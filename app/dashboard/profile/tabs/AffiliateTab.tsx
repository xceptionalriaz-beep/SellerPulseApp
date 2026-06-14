'use client'
// app/dashboard/profile/tabs/AffiliateTab.tsx
// User-facing affiliate dashboard — 3 tabs: Earnings · Referrals · Payments

import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Copy, Share2, CheckCircle, Clock,
  MousePointer, Users, DollarSign, TrendingUp,
  ArrowRight, Tag, BarChart2, CreditCard,
  Lightbulb, ClipboardList, Rocket, Lock,
  AlertTriangle, Wrench, Info, X, ChevronDown, RefreshCw,
} from 'lucide-react'

// ── Brand tokens ──────────────────────────────────────────────
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

// ── Interfaces ────────────────────────────────────────────────
interface AffiliateData {
  id:               string
  name:             string
  email:            string | null
  code:             string
  clicks:           number
  signups:          number
  mrr:              number
  payout:           number
  tier:             string | null
  status:           string | null
  payout_status:    string | null
  paid_at:          string | null
  payout_method:    string | null
  payment_details:  string | null
  custom_commission:number | null
  discount_percent: number | null
  discount_months:  number | null
  notes:            string | null
  created_at:       string
}

interface PayoutHistory {
  id:             string
  amount:         number
  status:         string
  paid_at:        string | null
  payment_method: string | null
  notes:          string | null
  created_at:     string
}

interface WithdrawalRequest {
  id:           string
  amount:       number
  status:       string
  requested_at: string
  rejection_reason: string | null
}

interface Settings {
  commission_rate:         number
  commission_months:       number
  min_payout:              number
  default_discount:        number
  default_discount_months: number
  cookie_days:             number
  earn_on_discounted:      boolean
  is_program_active:       boolean
}

// ── Helpers ───────────────────────────────────────────────────
function getCommission(affiliate: AffiliateData, settings: Settings | null): number {
  return affiliate.custom_commission ?? settings?.commission_rate ?? 0.25
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMethod(method: string | null): string {
  if (!method) return '—'
  if (method === 'paypal') return 'PayPal'
  if (method === 'bank')   return 'Bank Transfer'
  if (method === 'crypto') return 'Crypto'
  return method.charAt(0).toUpperCase() + method.slice(1)
}

function getPaymentPlaceholder(method: string): string {
  if (method === 'paypal') return 'your@paypal.com'
  if (method === 'bank')   return 'Bank name + account number (e.g. Chase — 123456789)'
  if (method === 'crypto') return 'Wallet address (e.g. 0x1a2b3c...)'
  return 'Payment details'
}

// ── FocusInput ────────────────────────────────────────────────
function FocusInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className="w-full h-10 px-3 rounded-xl text-[13px]"
      style={{
        backgroundColor: C.surface, color: C.text, outline: 'none',
        border:     `1.5px solid ${focused ? C.lime : C.border}`,
        boxShadow:  focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }} />
  )
}

// ── Method Selector ───────────────────────────────────────────
function MethodSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {[
        { value: 'paypal', label: 'PayPal'        },
        { value: 'bank',   label: 'Bank Transfer'  },
        { value: 'crypto', label: 'Crypto'         },
      ].map(m => (
        <button key={m.value} onClick={() => onChange(m.value)}
          className="px-3 py-2 rounded-xl text-[12px] font-bold transition-all"
          style={{
            backgroundColor: value === m.value ? C.lime    : C.bg,
            color:           value === m.value ? C.dark    : C.muted,
            border:          `1.5px solid ${value === m.value ? C.lime : C.border}`,
          }}>
          {m.label}
        </button>
      ))}
    </div>
  )
}

// ── Tab Button ────────────────────────────────────────────────
const TAB_ICONS: Record<string, ReactNode> = {
  Earnings:  <BarChart2  size={14} />,
  Referrals: <Users      size={14} />,
  Payments:  <CreditCard size={14} />,
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all"
      style={{
        backgroundColor: active ? C.dark    : 'transparent',
        color:           active ? C.lime    : C.muted,
        border:          `1.5px solid ${active ? C.dark : C.border}`,
      }}>
      {TAB_ICONS[label]}
      {label}
    </button>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function AffiliateTab() {
  const supabase = createClient()

  const [tab,           setTab]           = useState<'earnings' | 'referrals' | 'payments'>('earnings')
  const [loading,       setLoading]       = useState(true)
  const [affiliate,     setAffiliate]     = useState<AffiliateData | null>(null)
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([])
  const [withdrawals,   setWithdrawals]   = useState<WithdrawalRequest[]>([])
  const [settings,      setSettings]      = useState<Settings | null>(null)
  const [notAffiliate,  setNotAffiliate]  = useState(false)
  const [application,    setApplication]    = useState<{status: string; created_at: string} | null>(null)

  // Payments tab state
  const [payMethod,   setPayMethod]   = useState('paypal')
  const [payDetails,  setPayDetails]  = useState('')
  const [savingPay,   setSavingPay]   = useState(false)
  const [paySaved,    setPaySaved]    = useState(false)
  const [requesting,      setRequesting]      = useState(false)
  const [showWithdrawPopup, setShowWithdrawPopup] = useState(false)
  const [withdrawStep,      setWithdrawStep]      = useState<1 | 2>(1)
  const [withdrawAmount,    setWithdrawAmount]    = useState('')
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false)
  const [withdrawPopupError,setWithdrawPopupError] = useState('')
  const [cancelling,      setCancelling]      = useState(false)
  const [refreshing,      setRefreshing]      = useState(false)
  const [cancelDone,      setCancelDone]      = useState(false)
  const [confirmCancel,   setConfirmCancel]   = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [couponCopied,  setCouponCopied]  = useState(false)
  const [calcSignups,   setCalcSignups]   = useState(10)
  const [calcPlan,      setCalcPlan]      = useState<49 | 99>(49)
  const [openFaq,       setOpenFaq]       = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { setNotAffiliate(true); setLoading(false); return }

      const [{ data: affData }, { data: settingsData }] = await Promise.all([
        supabase.from('affiliates').select('*').eq('email', user.email).eq('status', 'active').maybeSingle(),
        (supabase.from('affiliate_settings') as any).select('*').limit(1).maybeSingle(),
      ])

      if (!affData) {
        // Check if they have a pending/rejected application
        const { data: appData } = await (supabase.from('affiliate_applications') as any)
          .select('status, created_at')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (appData) setApplication(appData)
        setNotAffiliate(true)
        setLoading(false)
        return
      }

      const aff = affData as AffiliateData
      setAffiliate(aff)
      if (settingsData) setSettings(settingsData as Settings)
      if (aff.payout_method)   setPayMethod(aff.payout_method)
      if (aff.payment_details) setPayDetails(aff.payment_details)

      const [{ data: payData }, { data: wdData }] = await Promise.all([
        (supabase.from('affiliate_payouts') as any).select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }).limit(50),
        (supabase.from('affiliate_withdrawal_requests') as any).select('*').eq('affiliate_id', aff.id).order('requested_at', { ascending: false }).limit(20),
      ])
      setPayoutHistory((payData ?? []) as PayoutHistory[])
      setWithdrawals((wdData ?? []) as WithdrawalRequest[])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function copyLink() {
    if (!affiliate) return
    navigator.clipboard.writeText(`https://riazify.com?ref=${affiliate.code}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function shareLink() {
    if (!affiliate) return
    const url = `https://riazify.com?ref=${affiliate.code}`
    if (navigator.share) navigator.share({ title: 'Join Riazify', url })
    else { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  function validatePayDetails(): string {
    if (!payDetails.trim()) return 'Payment details are required'
    if (payMethod === 'paypal') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(payDetails.trim())) return 'Please enter a valid PayPal email address'
    }
    if (payMethod === 'crypto' && payDetails.trim().length < 20)
      return 'Please enter a valid wallet address'
    if (payMethod === 'bank' && payDetails.trim().length < 5)
      return 'Please enter your bank name and account number'
    return ''
  }

  async function savePayoutSettings() {
    if (!affiliate) return
    const validationError = validatePayDetails()
    if (validationError) { setWithdrawPopupError(validationError); return }
    setSavingPay(true)
    try {
      await (supabase.from('affiliates') as any).update({
        payout_method:   payMethod,
        payment_details: payDetails.trim(),
      }).eq('id', affiliate.id)
      setPaySaved(true); setTimeout(() => { try { setPaySaved(false) } catch(e) {} }, 3000)
      await load()
    } catch (e) { console.error(e) }
    setSavingPay(false)
  }

  async function cancelWithdrawal() {
    if (!pendingRequest) return
    setCancelling(true)
    try {
      await (supabase.from('affiliate_withdrawal_requests') as any)
        .update({ status: 'cancelled' })
        .eq('id', pendingRequest.id)
      setCancelDone(true)
      setConfirmCancel(false)
      await load()
      setTimeout(() => setCancelDone(false), 3000)
    } catch (e) {
      console.error(e)
      setWithdrawPopupError('Failed to cancel — please try again')
    } finally {
      setCancelling(false)
    }
  }



  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.dark }} />
    </div>
  )

  // ── Program paused ────────────────────────────────────────
  if (settings?.is_program_active === false) return (
    <div className="rounded-2xl overflow-hidden"
         style={{ backgroundColor: C.surface, border: `0.5px solid ${C.border}` }}>

      {/* Dark status banner */}
      <div className="flex items-center gap-2 px-5 py-3"
           style={{ backgroundColor: C.dark }}>
        <Lock size={13} style={{ color: C.lime }} />
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Affiliate program temporarily paused by Riazify
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center px-6 py-8 text-center">
        <p className="text-[17px] font-bold mb-2" style={{ color: C.text }}>
          Your affiliate account is safe
        </p>
        <p className="text-[13px] mb-6" style={{ color: C.muted, maxWidth: 300 }}>
          All your earnings and referrals are preserved.
          The program will resume soon.
        </p>

        {/* Stats — shows their data is preserved */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6" style={{ maxWidth: 340 }}>
          {[
            { label: 'Balance',    val: `$${affiliate?.payout?.toFixed(2) ?? '0.00'}`, color: C.limeDeep },
            { label: 'Signups',    val: String(affiliate?.signups ?? 0),                color: C.text     },
            { label: 'Commission', val: `${((settings?.commission_rate ?? 0.25) * 100).toFixed(0)}%`,  color: C.text },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl text-center"
                 style={{ backgroundColor: C.bg }}>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>{s.label}</p>
              <p className="text-[16px] font-bold" style={{ color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <a href="mailto:support@riazify.com"
           className="flex items-center gap-2 text-[13px] transition-all hover:opacity-80"
           style={{ color: C.limeDeep, textDecoration: 'none' }}>
          <Info size={15} />
          support@riazify.com
        </a>
      </div>
    </div>
  )

  // ── Not an affiliate ──────────────────────────────────────
  if (notAffiliate) return (
    <div className="flex flex-col items-center py-16 px-6 text-center">

      {/* Pending application state */}
      {application?.status === 'pending' ? (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
               style={{ backgroundColor: '#FEF3C7' }}>
            <Clock size={28} style={{ color: '#92400E' }} />
          </div>
          <h2 className="text-[18px] font-bold mb-2" style={{ color: C.text }}>
            Application Under Review
          </h2>
          <p className="text-[14px] mb-2" style={{ color: C.muted, maxWidth: 340 }}>
            We received your application on {new Date(application.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} and are reviewing it.
          </p>
          <p className="text-[13px] mb-6" style={{ color: C.muted }}>
            We'll email you within 2–3 business days with our decision.
          </p>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
               style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <Clock size={14} style={{ color: '#92400E' }} />
            <p className="text-[12px] font-bold" style={{ color: '#92400E' }}>
              Pending review — check your email for updates
            </p>
          </div>
        </>
      ) : application?.status === 'rejected' ? (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
               style={{ backgroundColor: '#FEF2F2' }}>
            <X size={28} style={{ color: C.red }} />
          </div>
          <h2 className="text-[18px] font-bold mb-2" style={{ color: C.text }}>
            Application Not Approved
          </h2>
          <p className="text-[14px] mb-6" style={{ color: C.muted, maxWidth: 340 }}>
            Your previous application wasn't approved. You're welcome to apply again with updated information.
          </p>
          <a href="/affiliate/apply"
             className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition-all hover:opacity-90"
             style={{ backgroundColor: C.dark, color: C.lime }}>
            Apply Again <ArrowRight size={16} />
          </a>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
               style={{ backgroundColor: C.limeTint }}>
            <DollarSign size={28} style={{ color: C.limeDeep }} />
          </div>
          <h2 className="text-[18px] font-bold mb-2" style={{ color: C.text }}>
            Not an Affiliate Yet
          </h2>
          <p className="text-[14px] mb-6" style={{ color: C.muted, maxWidth: 340 }}>
            Join our affiliate program and earn {((settings?.commission_rate ?? 0.25) * 100).toFixed(0)}% recurring commission
            for {settings?.commission_months ?? 12} months on every user you refer!
          </p>
          <a href="/affiliate/apply"
             className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition-all hover:opacity-90"
             style={{ backgroundColor: C.dark, color: C.lime }}>
            Apply Now <ArrowRight size={16} />
          </a>
        </>
      )}
      {/* Commission preview */}
      <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm">
        {[
          { label: 'Commission', val: `${((settings?.commission_rate ?? 0.25) * 100).toFixed(0)}%`, sub: 'per payment' },
          { label: 'Duration',   val: `${settings?.commission_months ?? 12}mo`,                      sub: 'per user'  },
          { label: 'Min payout', val: `$${settings?.min_payout ?? 50}`,                              sub: 'withdraw'  },
        ].map(t => (
          <div key={t.label} className="p-3 rounded-xl border text-center"
               style={{ backgroundColor: C.bg, borderColor: C.border }}>
            <p className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>{t.label}</p>
            <p className="text-[18px] font-extrabold" style={{ color: C.limeDeep }}>{t.val}</p>
            <p className="text-[10px]" style={{ color: C.muted }}>{t.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )

  if (!affiliate) return null

  const commission    = getCommission(affiliate, settings)
  const earnOnDisc      = settings?.earn_on_discounted ?? true
  const discPct         = affiliate.discount_percent ?? settings?.default_discount ?? 50
  const discMonths      = affiliate.discount_months  ?? settings?.default_discount_months ?? 1
  const planPrice       = calcPlan  // uses $49 or $99 from earnings calculator
  const discountedPrice = planPrice * (1 - discPct / 100)
  const month1Earn      = earnOnDisc ? discountedPrice * commission : planPrice * commission
  const monthFullEarn   = planPrice * commission
  const minPayout    = settings?.min_payout ?? 50
  const commMonths   = settings?.commission_months ?? 12
  const totalPaid      = payoutHistory.reduce((s, p) => s + p.amount, 0)
  const totalEarned    = totalPaid + affiliate.payout
  const hasPending      = withdrawals.some(w => w.status === 'pending')
  const pendingRequest  = withdrawals.find(w => w.status === 'pending')
  // When pending: show requested amount, not full balance
  const pendingAmt      = pendingRequest?.amount ?? 0
  const availableAmt    = hasPending
    ? affiliate.payout - pendingAmt   // remaining not requested
    : affiliate.payout                // full balance available
  const rejectedRequest= withdrawals.find(w => w.status === 'rejected')
  // Most recent non-cancelled request drives the UI
  const latestRequest  = withdrawals
    .filter(w => w.status !== 'cancelled')
    .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())[0]
  const showRejected   = latestRequest?.status === 'rejected'
  const thisMonth      = new Date().getMonth()
  const thisYear       = new Date().getFullYear()
  const thisMonthEarned = payoutHistory
    .filter(p => p.paid_at && new Date(p.paid_at).getMonth() === thisMonth && new Date(p.paid_at).getFullYear() === thisYear)
    .reduce((s, p) => s + p.amount, 0)
  const convRate        = affiliate.clicks > 0 ? ((affiliate.signups / affiliate.clicks) * 100).toFixed(1) : '0'
  const totalPotential  = affiliate.signups * (month1Earn * discMonths + monthFullEarn * (commMonths - discMonths))
  const referralLink = `https://riazify.com?ref=${affiliate.code}`

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero — Option C: Ultra slim bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
           style={{ backgroundColor: C.dark }}>
        <p className="text-[18px] font-extrabold shrink-0" style={{ color: '#fff' }}>
          Welcome, <span style={{ color: C.lime }}>{affiliate.name.split(' ')[0]}</span>
        </p>
        <div className="w-px self-stretch shrink-0"
             style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(143,255,0,0.15)', color: C.lime }}>
            {(commission * 100).toFixed(0)}% commission
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
            {commMonths}mo
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <Tag size={9} />
            Users save {affiliate.discount_percent ?? settings?.default_discount ?? 50}% · first{' '}
            {affiliate.discount_months ?? settings?.default_discount_months ?? 1} month
            {(affiliate.discount_months ?? settings?.default_discount_months ?? 1) > 1 ? 's' : ''}
          </span>
        </div>
        <div className="w-px self-stretch shrink-0"
             style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div className="text-right shrink-0">
          <p className="text-[10px] mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {hasPending ? 'under review' : 'available'}
          </p>
          <p className="text-[26px] font-extrabold leading-none"
             style={{ color: hasPending ? '#f97316' : C.lime }}>
            ${hasPending ? pendingAmt.toFixed(2) : affiliate.payout.toFixed(2)}
          </p>
          {hasPending && availableAmt > 0 && (
            <p className="text-[10px] mt-1 font-bold" style={{ color: C.lime }}>
              ${availableAmt.toFixed(2)} available
            </p>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2">
        {[
          { label: 'Earnings',  icon: BarChart2,  key: 'earnings'  },
          { label: 'Referrals', icon: Users,       key: 'referrals' },
          { label: 'Payments',  icon: CreditCard,  key: 'payments'  },
        ].map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
            style={{
              backgroundColor: tab === t.key ? C.dark : 'transparent',
              color:           tab === t.key ? C.lime : C.muted,
              border:          `1.5px solid ${tab === t.key ? C.dark : C.border}`,
            }}>
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB 1 — EARNINGS
      ══════════════════════════════════════════ */}
      {tab === 'earnings' && (
        <div className="flex flex-col gap-5">

          {/* ── Option A: Two-column layout ── */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

            {/* LEFT COLUMN — Stats + Breakdown */}
            <div className="flex flex-col gap-3">

              {/* 4 Stat cards 2x2 */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: MousePointer, label: 'Clicks',      value: affiliate.clicks.toLocaleString(), sub: 'all time',          color: C.text     },
                  { icon: Users,        label: 'Signups',      value: affiliate.signups.toString(),      sub: 'from your link',    color: C.limeDeep },
                  { icon: TrendingUp,   label: 'Conv. rate',   value: `${convRate}%`,                    sub: 'clicks → signups',  color: C.text     },
                  { icon: DollarSign,   label: 'Total earned', value: `$${totalEarned.toFixed(2)}`,      sub: `$${totalPaid.toFixed(2)} paid · $${hasPending ? pendingAmt.toFixed(2) : affiliate.payout.toFixed(2)} ${hasPending ? 'under review' : 'available'}${hasPending && availableAmt > 0 ? ' · $' + availableAmt.toFixed(2) + ' free' : ''}`, color: C.green },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-2xl border"
                       style={{ backgroundColor: C.surface, borderColor: C.border }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold" style={{ color: C.muted }}>{s.label}</p>
                      <s.icon size={12} style={{ color: C.muted }} />
                    </div>
                    <p className="text-[20px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Earnings breakdown */}
              <div className="p-4 rounded-2xl border"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <p className="text-[11px] font-bold mb-3" style={{ color: C.muted }}>Earnings breakdown</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl text-center" style={{ backgroundColor: C.bg }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>This month</p>
                    <p className="text-[14px] font-extrabold" style={{ color: C.limeDeep }}>
                      ${thisMonthEarned.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl text-center" style={{ backgroundColor: C.bg }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>Paid out</p>
                    <p className="text-[14px] font-extrabold" style={{ color: C.green }}>
                      ${totalPaid.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl text-center"
                       style={{ backgroundColor: hasPending ? '#FEF3C7' : C.bg }}>
                    <p className="text-[10px] font-bold mb-1"
                       style={{ color: hasPending ? '#92400E' : C.muted }}>
                      {hasPending ? 'Under review' : 'Available'}
                    </p>
                    <p className="text-[14px] font-extrabold"
                       style={{ color: hasPending ? '#f97316' : C.limeDeep }}>
                      ${hasPending ? pendingAmt.toFixed(2) : affiliate.payout.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission model */}
              <div className="p-4 rounded-2xl border"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <p className="text-[11px] font-bold mb-3" style={{ color: C.muted }}>Commission model</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Your rate',     val: `${(commission * 100).toFixed(0)}%`,  color: C.limeDeep },
                    { label: 'Duration',      val: `${commMonths} months`,               color: C.text     },
                    { label: 'User discount', val: `${affiliate.discount_percent ?? settings?.default_discount ?? 50}% off`, color: '#7C3AED' },
                    { label: 'Cookie',        val: `${settings?.cookie_days ?? 30} days`, color: C.text    },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 rounded-xl"
                         style={{ backgroundColor: C.bg }}>
                      <p className="text-[10px] font-bold" style={{ color: C.muted }}>{s.label}</p>
                      <p className="text-[14px] font-extrabold" style={{ color: s.color }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                {affiliate.signups > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl flex items-center justify-between"
                       style={{ backgroundColor: C.limeTint }}>
                    <p className="text-[11px]" style={{ color: C.limeDeep }}>
                      {affiliate.signups} signups on Pro · ${month1Earn.toFixed(2)}/mo × {discMonths}mo, ${monthFullEarn.toFixed(2)}/mo after
                    </p>
                    <p className="text-[13px] font-extrabold" style={{ color: C.limeDeep }}>
                      ${totalPotential.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN — Link, Code, Calculator */}
            <div className="flex flex-col gap-3">

              {/* Referral link + Coupon code */}
              <div className="p-4 rounded-2xl border"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <p className="text-[11px] font-bold mb-2" style={{ color: C.muted }}>Referral link</p>
                <button onClick={copyLink}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-3 transition-all hover:opacity-80"
                  style={{
                    backgroundColor: C.bg,
                    border: `1.5px solid ${copied ? C.lime : C.border}`,
                    boxShadow: copied ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
                  }}>
                  <p className="flex-1 text-[11px] truncate text-left" style={{ color: C.muted }}>
                    {referralLink}
                  </p>
                  {copied
                    ? <CheckCircle size={13} style={{ color: C.green, flexShrink: 0 }} />
                    : <Copy size={13} style={{ color: C.muted, flexShrink: 0 }} />}
                </button>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold" style={{ color: C.muted }}>Coupon code</p>
                  {couponCopied && <p className="text-[10px] font-bold" style={{ color: C.green }}>Copied!</p>}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(affiliate.code); setCouponCopied(true); setTimeout(() => setCouponCopied(false), 2000) }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 transition-all hover:opacity-80"
                  style={{
                    backgroundColor: C.dark,
                    border: `1.5px dashed ${couponCopied ? C.lime : C.lime + '50'}`,
                  }}>
                  <span className="text-[15px] font-extrabold tracking-widest" style={{ color: C.lime }}>
                    {affiliate.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'rgba(143,255,0,0.15)', color: C.lime }}>
                      {affiliate.discount_percent ?? settings?.default_discount ?? 50}% OFF ·{' '}
                      {affiliate.discount_months ?? settings?.default_discount_months ?? 1}
                      {(affiliate.discount_months ?? settings?.default_discount_months ?? 1) > 1 ? ' months' : ' month'}
                    </span>
                    {couponCopied
                      ? <CheckCircle size={12} style={{ color: C.lime }} />
                      : <Copy size={12} style={{ color: C.lime + '80' }} />}
                  </div>
                </button>

                {/* Share buttons */}
                <div className="flex gap-2">
                  <button onClick={shareLink}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] font-bold"
                    style={{ borderColor: C.border, color: C.muted }}>
                    <Share2 size={12} /> Share
                  </button>
                  <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Get ${affiliate.discount_percent ?? settings?.default_discount ?? 50}% off Riazify with code ${affiliate.code}!&url=${encodeURIComponent(referralLink)}`, '_blank')}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold"
                    style={{ backgroundColor: '#000', color: '#fff' }}>
                    X (Twitter)
                  </button>
                  <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Get ${affiliate.discount_percent ?? settings?.default_discount ?? 50}% off Riazify with code ${affiliate.code} → ${referralLink}`)}`, '_blank')}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold"
                    style={{ backgroundColor: '#25D366', color: '#fff' }}>
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Earnings calculator */}
              <div className="p-4 rounded-2xl border"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold" style={{ color: C.muted }}>Earnings calculator</p>
                  <div className="flex gap-1">
                    {([49, 99] as (49|99)[]).map(p => (
                      <button key={p} onClick={() => setCalcPlan(p)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: calcPlan === p ? C.dark : C.bg, color: calcPlan === p ? C.lime : C.muted }}>
                        ${p} plan
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[10px]" style={{ color: C.muted }}>Signups</p>
                  <input type="range" min={1} max={100} value={calcSignups}
                    onChange={e => setCalcSignups(Number(e.target.value))}
                    className="flex-1" style={{ accentColor: C.lime }} />
                  <span className="text-[13px] font-extrabold w-6 text-right"
                        style={{ color: C.limeDeep }}>{calcSignups}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: `Month${discMonths > 1 ? 's 1-' + discMonths : ' 1'}`, val: `$${(calcSignups * (earnOnDisc ? calcPlan * (1 - discPct/100) : calcPlan) * commission).toFixed(2)}`,                                                                    color: C.muted    },
                    { label: '/mo after',  val: `$${(calcSignups * calcPlan * commission).toFixed(2)}`,                                                                          color: C.limeDeep },
                    { label: `${commMonths}mo total`, val: `$${(calcSignups * ((earnOnDisc ? calcPlan*(1-discPct/100) : calcPlan)*commission*discMonths + calcPlan*commission*(commMonths-discMonths))).toFixed(2)}`, color: C.green },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 rounded-xl text-center"
                         style={{ backgroundColor: C.bg }}>
                      <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>{s.label}</p>
                      <p className="text-[13px] font-extrabold" style={{ color: s.color }}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready-made promo copy */}
              <div className="p-4 rounded-2xl border"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <p className="text-[11px] font-bold mb-2" style={{ color: C.muted }}>Ready-made promo copy</p>
                {[
                  { label: 'Short (Twitter/X)', text: `Get ${affiliate.discount_percent ?? settings?.default_discount ?? 50}% off your first month on Riazify — the best eBay product research tool! Use code: ${affiliate.code} → riazify.com?ref=${affiliate.code}` },
                  { label: 'Long (YouTube/Blog)', text: `If you sell on eBay, you need Riazify. I use it for product research, title building, and profit calculation. Use my code ${affiliate.code} for ${affiliate.discount_percent ?? settings?.default_discount ?? 50}% off your first ${discMonths > 1 ? discMonths + ' months' : 'month'} → riazify.com?ref=${affiliate.code}` },
                ].map((item, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wide" style={{ color: C.muted }}>{item.label}</p>
                    <div className="relative">
                      <div className="px-3 py-2 rounded-xl text-[11px] leading-relaxed pr-8"
                           style={{ backgroundColor: C.bg, color: C.text, border: `1px solid ${C.border}` }}>
                        {item.text}
                      </div>
                      <button onClick={() => navigator.clipboard.writeText(item.text)}
                        className="absolute top-1.5 right-1.5 p-1 rounded transition-all hover:opacity-70"
                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                        <Copy size={11} style={{ color: C.muted }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips + FAQ below — full width */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

            {/* Tips */}
            <div className="p-4 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <p className="text-[11px] font-bold mb-3" style={{ color: C.muted }}>Tips to earn more</p>
              <div className="flex flex-col gap-2">
                {[
                  'Share your link in YouTube descriptions, bio links, and pinned posts',
                  'Mention Riazify in content about eBay selling or dropshipping',
                  'Add it to eBay seller community groups and forums',
                  `You earn ${(commission * 100).toFixed(0)}% every month — the longer users stay, the more you earn!`,
                  `Cookie lasts ${settings?.cookie_days ?? 30} days — users can come back later and still count`,
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={12} style={{ color: C.limeDeep, flexShrink: 0, marginTop: 2 }} />
                    <p className="text-[11px]" style={{ color: C.text }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="p-4 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <p className="text-[11px] font-bold mb-3" style={{ color: C.muted }}>Frequently asked questions</p>
              <div className="flex flex-col gap-2">
                {[
                  { q: 'When do I get paid?', a: `Once your balance reaches $${minPayout}, request a withdrawal. Processed within 2–3 business days.` },
                  { q: 'How long does the cookie last?', a: `${settings?.cookie_days ?? 30} days after a click — users can come back later and still count.` },
                  { q: 'What if a user cancels?', a: 'Commissions stop when they cancel. Already earned commissions are kept.' },
                  { q: 'How long do I earn per user?', a: `Up to ${commMonths} months per referred user at ${(commission * 100).toFixed(0)}%.` },
                  { q: 'Can I refer myself?', a: 'No — self-referrals are prohibited and result in account termination.' },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl overflow-hidden"
                       style={{ border: `1px solid ${C.border}` }}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                      style={{ backgroundColor: openFaq === i ? C.limeTint : C.surface }}>
                      <p className="text-[11px] font-bold" style={{ color: C.text }}>{item.q}</p>
                      <ChevronDown size={13} style={{
                        color: C.muted, flexShrink: 0, marginLeft: 8,
                        transform: openFaq === i ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }} />
                    </button>
                    {openFaq === i && (
                      <div className="px-3 pb-2.5 pt-1" style={{ backgroundColor: C.limeTint }}>
                        <p className="text-[11px] leading-relaxed" style={{ color: C.limeDeep }}>{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 2 — REFERRALS
      ══════════════════════════════════════════ */}
      {tab === 'referrals' && (
        <div className="flex flex-col gap-5">

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <p className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>Total Signups</p>
              <p className="text-[26px] font-extrabold" style={{ color: C.limeDeep }}>
                {affiliate.signups}
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>via your referral link</p>
            </div>
            <div className="p-4 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <p className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>Revenue Generated</p>
              <p className="text-[26px] font-extrabold" style={{ color: C.text }}>
                ${affiliate.mrr.toLocaleString()}
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>monthly recurring revenue</p>
            </div>
          </div>

          {/* Referrals table — coming soon with real tracking */}
          <div className="p-5 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold" style={{ color: C.text }}>Your Referred Users</p>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                {affiliate.signups} total
              </span>
            </div>

            {affiliate.signups === 0 ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                     style={{ backgroundColor: C.limeTint }}>
                  <Users size={24} style={{ color: C.limeDeep }} />
                </div>
                <p className="text-[14px] font-bold mb-1" style={{ color: C.text }}>
                  No referrals yet
                </p>
                <p className="text-[12px] text-center" style={{ color: C.muted, maxWidth: 280 }}>
                  Share your referral link and when someone signs up using your link they'll appear here
                </p>
                <button onClick={() => setTab('earnings')}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
                  style={{ backgroundColor: C.dark, color: C.lime }}>
                  Get your link <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div className="grid px-3 py-2 rounded-xl mb-2"
                     style={{
                       gridTemplateColumns: '2fr 80px 80px 80px',
                       backgroundColor: C.bg,
                       gap: 8,
                     }}>
                  {['Referral', 'Plan', 'Status', 'Monthly'].map((h, i) => (
                    <p key={i} className="text-[11px] font-bold uppercase tracking-wide"
                       style={{ color: C.muted }}>{h}</p>
                  ))}
                </div>

                {/* Placeholder rows until real tracking built */}
                {Array.from({ length: Math.min(affiliate.signups, 5) }).map((_, i) => (
                  <div key={i} className="grid items-center px-3 py-2 rounded-xl mb-1"
                       style={{
                         gridTemplateColumns: '2fr 80px 80px 80px',
                         backgroundColor: i % 2 === 0 ? C.bg : 'transparent',
                         gap: 8,
                       }}>
                    {/* Avatar — show number not "U" */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                           style={{ backgroundColor: C.dark }}>
                        <span className="text-[10px] font-bold" style={{ color: C.lime }}>{i + 1}</span>
                      </div>
                      <p className="text-[12px] font-bold" style={{ color: C.text }}>
                        Referral {i + 1}
                      </p>
                    </div>

                    {/* Plan */}
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>Pro</span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: '#F0FDF4', color: C.green }}>Active</span>
                    </div>

                    {/* Earned — show monthly earning (month 2+ full price) */}
                    <p className="text-[12px] font-bold" style={{ color: C.green }}>
                      ${(49 * commission).toFixed(2)}
                    </p>
                  </div>
                ))}

                {affiliate.signups > 5 && (
                  <p className="text-[11px] text-center mt-2" style={{ color: C.muted }}>
                    + {affiliate.signups - 5} more referrals
                  </p>
                )}

                <div className="mt-4 p-3 rounded-xl"
                     style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    Detailed per-user tracking coming soon. Above shows estimated data based on your {affiliate.signups} signups.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="p-5 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[13px] font-bold mb-4" style={{ color: C.text }}>How commissions work</p>
            <div className="flex flex-col gap-3">
              {[
                { step: '1', text: `Someone clicks your link → cookie saved for ${settings?.cookie_days ?? 30} days`,                icon: MousePointer },
                { step: '2', text: `They sign up and pay for a plan ($49 or $99/mo)`,                    icon: Users        },
                { step: '3', text: `You earn ${(commission * 100).toFixed(0)}% of every payment they make`,   icon: DollarSign   },
                { step: '4', text: `This continues for up to ${commMonths} months per user`,             icon: TrendingUp   },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
                       style={{ backgroundColor: C.lime, color: C.dark }}>
                    {s.step}
                  </div>
                  <p className="text-[13px]" style={{ color: C.text }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 3 — PAYMENTS
      ══════════════════════════════════════════ */}
      {tab === 'payments' && (
        <div className="flex flex-col gap-5">

          {/* ── Rejected notice — FIRST thing they see ── */}
          {showRejected && latestRequest && (
            <div className="p-4 rounded-2xl"
                 style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                     style={{ backgroundColor: '#FEE2E2' }}>
                  <X size={16} style={{ color: C.red }} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold mb-1" style={{ color: C.red }}>
                    Your withdrawal request was rejected
                  </p>
                  {latestRequest.rejection_reason?.trim() && (
                    <div className="px-3 py-2 rounded-lg mb-2"
                         style={{ backgroundColor: '#FEE2E2' }}>
                      <p className="text-[11px] font-bold" style={{ color: C.red }}>
                        Reason: {latestRequest.rejection_reason}
                      </p>
                    </div>
                  )}
                  <p className="text-[11px]" style={{ color: C.red }}>
                    Please update your payout details below and submit a new request.
                    Contact support if you need help.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Refresh button — so user can check latest status ── */}
          <div className="flex items-center justify-between">
            <p className="text-[11px]" style={{ color: C.muted }}>
              Payment status may take a moment to update
            </p>
            <button onClick={async () => { setRefreshing(true); await load(); setRefreshing(false) }}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:opacity-80"
              style={{ backgroundColor: refreshing ? C.limeTint : C.bg, color: refreshing ? C.limeDeep : C.muted, border: `1px solid ${refreshing ? C.lime : C.border}` }}>
              <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Balance + Pending status */}
          {hasPending && pendingRequest && !showRejected ? (
            <div className="flex flex-col gap-3">

              {/* Top row — Under review + Available (if partial) */}
              <div className={`grid gap-3 ${availableAmt > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>

                {/* Under review box */}
                <div className="p-4 rounded-2xl"
                     style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
                  <p className="text-[11px] font-bold mb-1" style={{ color: '#92400E' }}>
                    Under review
                  </p>
                  <p className="text-[28px] font-extrabold" style={{ color: '#f97316' }}>
                    ${pendingAmt.toFixed(2)}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: '#B45309' }}>
                    {new Date(pendingRequest.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {formatMethod(affiliate.payout_method)}
                  </p>
                </div>

                {/* Available remaining box — only when partial withdrawal */}
                {availableAmt > 0 && (
                  <div className="p-4 rounded-2xl"
                       style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}>
                    <p className="text-[11px] font-bold mb-1" style={{ color: C.limeDeep }}>
                      Remaining balance
                    </p>
                    <p className="text-[28px] font-extrabold" style={{ color: C.limeDeep }}>
                      ${availableAmt.toFixed(2)}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: C.limeDeep }}>
                      available after review
                    </p>
                  </div>
                )}
              </div>

              {/* Pending details + cancel — full width */}
              <div className="p-4 rounded-2xl flex flex-col gap-3"
                   style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} style={{ color: '#92400E' }} />
                    <p className="text-[12px] font-bold" style={{ color: '#92400E' }}>
                      Pending review
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[12px] font-bold" style={{ color: '#B45309' }}>
                      ${pendingRequest.amount.toFixed(2)}
                    </p>
                    {affiliate.payout_method && (
                      <p className="text-[11px]" style={{ color: '#B45309' }}>
                        {formatMethod(affiliate.payout_method)}
                        {affiliate.payment_details ? ` · ${affiliate.payment_details.length > 20 ? affiliate.payment_details.slice(0, 12) + '***' : affiliate.payment_details}` : ''}
                      </p>
                    )}
                    <p className="text-[10px]" style={{ color: '#92400E' }}>
                      2–3 business days
                    </p>
                  </div>
                </div>

                {/* Cancel — 2 step */}
                {cancelDone ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                       style={{ backgroundColor: C.limeTint }}>
                    <CheckCircle size={13} style={{ color: C.limeDeep }} />
                    <p className="text-[11px] font-bold" style={{ color: C.limeDeep }}>
                      Request cancelled
                    </p>
                  </div>
                ) : !confirmCancel ? (
                  <button onClick={() => setConfirmCancel(true)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[11px] font-bold transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(180,83,9,0.15)', color: '#92400E', border: '1px solid #FDE68A' }}>
                    <X size={13} /> Cancel Request
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 p-3 rounded-xl"
                       style={{ backgroundColor: 'rgba(180,83,9,0.12)', border: '1px solid #FDE68A' }}>
                    <p className="text-[11px] font-bold text-center" style={{ color: '#92400E' }}>
                      Cancel this withdrawal?
                    </p>
                    <p className="text-[10px] text-center" style={{ color: '#B45309' }}>
                      Your ${pendingRequest.amount.toFixed(2)} will stay in your balance
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmCancel(false)}
                        className="flex-1 py-1.5 rounded-xl text-[11px] font-bold"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#92400E' }}>
                        Keep it
                      </button>
                      <button onClick={cancelWithdrawal} disabled={cancelling}
                        className="flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
                        style={{ backgroundColor: '#92400E', color: '#fff' }}>
                        {cancelling
                          ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin"
                                 style={{ borderTopColor: '#fff' }} />
                          : 'Yes, cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Normal balance card */
            <div className="p-5 rounded-2xl flex items-center justify-between flex-wrap gap-4"
                 style={{
                   backgroundColor: affiliate.payout >= minPayout ? C.limeTint : C.bg,
                   border: `1px solid ${affiliate.payout >= minPayout ? C.lime + '50' : C.border}`,
                 }}>
              <div>
                <p className="text-[12px] font-bold" style={{ color: C.muted }}>Available balance</p>
                <p className="text-[32px] font-extrabold" style={{ color: C.limeDeep }}>
                  ${affiliate.payout.toFixed(2)}
                </p>
                {affiliate.payout < minPayout && (
                  <p className="text-[12px]" style={{ color: C.muted }}>
                    ${(minPayout - affiliate.payout).toFixed(2)} more needed to withdraw
                  </p>
                )}
              </div>
              {affiliate.payout >= minPayout && (
                <button onClick={() => { setWithdrawAmount(affiliate.payout.toFixed(2)); setWithdrawStep(1); setWithdrawPopupError(''); setShowWithdrawPopup(true) }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: C.dark, color: C.lime }}>
                  Request Withdrawal <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}

          {withdrawPopupError && !showWithdrawPopup && (
            <div className="flex items-start gap-2 p-3 rounded-xl"
                 style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertTriangle size={14} style={{ color: C.red, flexShrink: 0 }} />
              <p className="text-[12px] font-bold" style={{ color: C.red }}>{withdrawPopupError}</p>
            </div>
          )}

          {/* Progress to min payout */}
          {affiliate.payout < minPayout && !hasPending && (
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-[11px]" style={{ color: C.muted }}>Progress to minimum payout</p>
                <p className="text-[11px] font-bold" style={{ color: C.limeDeep }}>
                  ${affiliate.payout.toFixed(2)} / ${minPayout}
                </p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                <div className="h-full rounded-full transition-all"
                     style={{
                       width:           `${minPayout > 0 ? Math.min((affiliate.payout / minPayout) * 100, 100) : 0}%`,
                       backgroundColor: C.lime,
                     }} />
              </div>
            </div>
          )}

          {/* FIX 2 — First-time setup prompt */}
          {!affiliate.payout_method && !affiliate.payment_details && (
            <div className="p-4 rounded-2xl flex items-start gap-3"
                 style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}50` }}>
              <Info size={20} style={{ color: C.limeDeep, flexShrink: 0 }} />
              <div>
                <p className="text-[13px] font-bold mb-1" style={{ color: C.limeDeep }}>
                  Set up your payout method first!
                </p>
                <p className="text-[12px]" style={{ color: C.limeDeep }}>
                  You need to add your payment details before you can request a withdrawal.
                  Once your balance reaches ${minPayout}, you'll be able to withdraw instantly.
                </p>
              </div>
            </div>
          )}

          {/* Payout settings */}
          <div className="p-5 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold" style={{ color: C.text }}>Payout settings</p>
              {hasPending && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  Locked during review
                </span>
              )}
            </div>

            {hasPending && (
              <div className="flex items-start gap-2 p-3 rounded-xl mb-4"
                   style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <p className="text-[12px]" style={{ color: '#92400E' }}>
                  Your withdrawal is being processed. Please don't change your payment details until it's completed.
                </p>
              </div>
            )}

            {paySaved && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
                   style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}50` }}>
                <CheckCircle size={14} style={{ color: C.limeDeep }} />
                <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>Settings saved!</p>
              </div>
            )}

            <div className="flex flex-col gap-3" style={{ opacity: hasPending ? 0.5 : 1, pointerEvents: hasPending ? 'none' : 'auto' }}>
              <div>
                <p className="text-[11px] font-bold mb-2" style={{ color: C.muted }}>Payment method</p>
                <MethodSelector value={payMethod} onChange={setPayMethod} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-2" style={{ color: C.muted }}>Payment details</p>
                <FocusInput
                  value={payDetails}
                  onChange={setPayDetails}
                  placeholder={getPaymentPlaceholder(payMethod)}
                />
              </div>
              <button onClick={savePayoutSettings}
                disabled={savingPay || !payDetails.trim() || hasPending}
                className="self-start px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90 flex items-center gap-2"
                style={{
                  backgroundColor: C.dark, color: C.lime,
                  opacity: !payDetails.trim() || hasPending ? 0.5 : 1,
                }}>
                {savingPay
                  ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                           style={{ borderTopColor: C.lime }}></div> Saving...</>
                  : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* ── Payment History — slim table layout ── */}
          <div className="rounded-2xl border overflow-hidden"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>

            {/* Table header */}
            <div className="grid px-4 py-2"
                 style={{
                   gridTemplateColumns: '2fr 1fr 1fr 1fr',
                   backgroundColor: C.bg,
                   borderBottom: `1px solid ${C.border}`,
                 }}>
              {['Description', 'Date', 'Amount', 'Status'].map((h, i) => (
                <p key={i} className="text-[10px] font-bold uppercase tracking-wide"
                   style={{ color: C.muted }}>{h}</p>
              ))}
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>

              {/* Paid payouts */}
              {payoutHistory.map((p, i) => (
                <div key={`pay-${i}`} className="grid items-center px-4 py-2 hover:bg-gray-50"
                     style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                  <p className="text-[12px] font-bold truncate" style={{ color: C.text }}>
                    {p.notes ?? 'Payout'} · {formatMethod(p.payment_method)}
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {p.paid_at ? formatDate(p.paid_at) : '—'}
                  </p>
                  <p className="text-[12px] font-bold" style={{ color: C.green }}>
                    +${p.amount.toFixed(2)}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"
                        style={{ backgroundColor: '#F0FDF4', color: C.green }}>
                    <CheckCircle size={9} /> Paid
                  </span>
                </div>
              ))}

              {/* Withdrawal requests — rejected, pending, cancelled */}
              {withdrawals.map((w, i) => (
                <div key={`wd-${i}`}
                     className="grid items-center px-4 py-2"
                     style={{
                       gridTemplateColumns: '2fr 1fr 1fr 1fr',
                       backgroundColor: w.status === 'rejected' ? '#FFF8F8' : 'transparent',
                     }}>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[12px] font-bold truncate"
                       style={{ color: w.status === 'cancelled' ? C.muted : C.text }}>
                      {w.status === 'rejected'  ? 'Withdrawal rejected'
                     : w.status === 'cancelled' ? 'Withdrawal cancelled'
                     : w.status === 'paid'      ? 'Withdrawal paid'
                     :                            'Withdrawal pending'}
                    </p>
                    {w.status === 'rejected' && w.rejection_reason?.trim() && (
                      <p className="text-[10px] truncate" style={{ color: C.red }}>
                        ↳ {w.rejection_reason}
                      </p>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {formatDate(w.requested_at)}
                  </p>
                  <p className="text-[12px] font-bold"
                     style={{ color: w.status === 'cancelled' ? C.muted : w.status === 'rejected' ? C.red : '#92400E' }}>
                    ${w.amount.toFixed(2)}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"
                        style={{
                          backgroundColor: w.status === 'rejected'  ? '#FEE2E2'
                                         : w.status === 'cancelled' ? C.bg
                                         : w.status === 'paid'      ? '#F0FDF4'
                                         : '#FEF3C7',
                          color:           w.status === 'rejected'  ? C.red
                                         : w.status === 'cancelled' ? C.muted
                                         : w.status === 'paid'      ? C.green
                                         : '#92400E',
                        }}>
                    {w.status === 'rejected'  ? 'Rejected'
                   : w.status === 'cancelled' ? 'Cancelled'
                   : w.status === 'paid'      ? 'Paid'
                   :                            'Pending'}
                  </span>
                </div>
              ))}

              {/* Empty state */}
              {payoutHistory.length === 0 && withdrawals.length === 0 && (
                <div className="flex flex-col items-center py-8">
                  <DollarSign size={24} style={{ color: C.muted }} />
                  <p className="text-[12px] font-bold mt-2" style={{ color: C.muted }}>
                    No history yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Withdrawal Popup ── */}
          {showWithdrawPopup && affiliate && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
                 style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                 onClick={e => { if (e.target === e.currentTarget) { setShowWithdrawPopup(false); setWithdrawStep(1); setWithdrawAmount(''); setWithdrawPopupError(''); setWithdrawConfirmed(false) } }}>
              <style>{`@keyframes popIn { 0%{opacity:0;transform:scale(0.93) translateY(10px)} 60%{transform:scale(1.01) translateY(-2px)} 100%{opacity:1;transform:scale(1) translateY(0)} }`}</style>
              <div className="w-full max-w-sm rounded-2xl overflow-hidden"
                   style={{ backgroundColor: C.surface, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4"
                     style={{ borderBottom: `1px solid ${C.border}` }}>
                  <p className="text-[15px] font-bold" style={{ color: C.text }}>
                    {withdrawStep === 1 ? 'Request Withdrawal' : 'Confirm Withdrawal'}
                  </p>
                  <button onClick={() => { setShowWithdrawPopup(false); setWithdrawStep(1); setWithdrawAmount(''); setWithdrawPopupError(''); setWithdrawConfirmed(false) }}
                    className="w-7 h-7 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: C.bg }}>
                    <X size={14} style={{ color: C.muted }} />
                  </button>
                </div>

                {/* Step 1 — Amount */}
                {withdrawStep === 1 && (
                  <div className="p-5 flex flex-col gap-4">

                    {/* Balance */}
                    <div className="p-3 rounded-xl text-center"
                         style={{ backgroundColor: C.limeTint }}>
                      <p className="text-[11px] font-bold" style={{ color: C.limeDeep }}>Available balance</p>
                      <p className="text-[24px] font-extrabold" style={{ color: C.limeDeep }}>
                        ${affiliate.payout.toFixed(2)}
                      </p>
                    </div>

                    {/* Amount input */}
                    <div>
                      <p className="text-[11px] font-bold mb-2" style={{ color: C.muted }}>
                        Withdrawal amount
                      </p>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center rounded-xl overflow-hidden"
                             style={{ border: `1.5px solid ${C.lime}`, boxShadow: '0 0 0 3px rgba(143,255,0,0.15)' }}>
                          <span className="px-3 text-[14px] font-bold" style={{ color: C.muted }}>$</span>
                          <input
                            value={withdrawAmount}
                            onChange={e => {
                              // Allow only valid decimal: strip non-numeric except first dot
                              let v = e.target.value.replace(/[^0-9.]/g, '')
                              const parts = v.split('.')
                              if (parts.length > 2) v = parts[0] + '.' + parts[1]
                              if (parts.length === 2 && parts[1].length > 2) v = parts[0] + '.' + parts[1].slice(0, 2)
                              if (v === '.' || v === '') { setWithdrawAmount(''); return }
                              if (!isNaN(Number(v)) && Number(v) <= affiliate.payout) setWithdrawAmount(v)
                            }}
                            placeholder="0.00"
                            className="flex-1 h-11 text-[16px] font-bold outline-none bg-transparent"
                            style={{ color: C.text }}
                            onPaste={e => {
                              e.preventDefault()
                              const pasted = e.clipboardData.getData('text').replace(/[^0-9.]/g, '')
                              const num = parseFloat(pasted)
                              if (!isNaN(num) && num > 0 && num <= affiliate.payout) {
                                setWithdrawAmount(num.toFixed(2))
                              }
                            }}
                            autoFocus
                          />
                        </div>
                        <button onClick={() => setWithdrawAmount(affiliate.payout.toFixed(2))}
                          className="px-3 rounded-xl text-[11px] font-bold transition-all hover:opacity-80"
                          style={{ backgroundColor: C.dark, color: C.lime }}>
                          All
                        </button>
                      </div>
                      {/* Quick shortcuts */}
                      <div className="flex gap-2 flex-wrap mt-2">
                        {[25, 50, 75].map(pct => {
                          const amt = (affiliate.payout * pct / 100)
                          if (amt < minPayout) return null
                          return (
                            <button key={pct}
                              onClick={() => setWithdrawAmount(amt.toFixed(2))}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:opacity-80"
                              style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}` }}>
                              {pct}% · ${amt.toFixed(2)}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                        Min: ${minPayout} · Max: ${affiliate.payout.toFixed(2)}
                      </p>
                      {withdrawAmount && Number(withdrawAmount) > 0 && Number(withdrawAmount) < affiliate.payout && (
                        <p className="text-[11px] mt-1 font-bold" style={{ color: C.limeDeep }}>
                          Remaining after withdrawal: ${(affiliate.payout - Number(withdrawAmount)).toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Inline error */}
                    {withdrawPopupError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl"
                           style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                        <AlertTriangle size={13} style={{ color: C.red, flexShrink: 0 }} />
                        <p className="text-[11px] font-bold" style={{ color: C.red }}>{withdrawPopupError}</p>
                      </div>
                    )}

                    {/* Payment details preview */}
                    {affiliate.payout_method ? (
                      <div className="p-3 rounded-xl"
                           style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                        <p className="text-[10px] font-bold mb-1.5" style={{ color: C.muted }}>PAYING TO</p>
                        <p className="text-[13px] font-bold" style={{ color: C.text }}>
                          {formatMethod(affiliate.payout_method)}
                        </p>
                        <p className="text-[12px]" style={{ color: C.muted }}>
                          {affiliate.payment_details}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-3 rounded-xl"
                           style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                        <AlertTriangle size={13} style={{ color: '#92400E', flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <p className="text-[12px] font-bold" style={{ color: '#92400E' }}>
                            No payout method saved
                          </p>
                          <p className="text-[11px]" style={{ color: '#B45309' }}>
                            Please save your payment details below before requesting a withdrawal
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button onClick={() => { setShowWithdrawPopup(false); setWithdrawStep(1); setWithdrawAmount(''); setWithdrawPopupError(''); setWithdrawConfirmed(false) }}
                        className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border"
                        style={{ borderColor: C.border, color: C.muted }}>
                        Cancel
                      </button>
                      <button
                        disabled={!affiliate.payout_method}
                        onClick={() => {
                          if (!withdrawAmount || withdrawAmount === '.' || withdrawAmount === '0') {
                            setWithdrawPopupError('Please enter a valid withdrawal amount')
                            return
                          }
                          const amt = Number(withdrawAmount)
                          if (isNaN(amt) || amt <= 0) {
                            setWithdrawPopupError('Please enter a valid withdrawal amount')
                            return
                          }
                          if (!affiliate.payout_method || !affiliate.payment_details) {
                            setWithdrawPopupError('Please save your payout settings first')
                            return
                          }
                          if (!withdrawAmount || isNaN(amt) || amt < minPayout) {
                            setWithdrawPopupError(`Minimum withdrawal amount is $${minPayout}`)
                            return
                          }
                          if (amt > affiliate.payout) {
                            setWithdrawPopupError('Amount exceeds your available balance')
                            return
                          }
                          setWithdrawPopupError('')
                          setWithdrawConfirmed(false)
                          setWithdrawStep(2)
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold"
                        style={{ backgroundColor: C.dark, color: C.lime }}>
                        Review <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Confirm */}
                {withdrawStep === 2 && (
                  <div className="p-5 flex flex-col gap-4">

                    {/* Summary */}
                    <div className="flex flex-col gap-2">
                      {[
                        { label: 'Amount',      value: `$${Number(withdrawAmount).toFixed(2)}`,                                                              bold: true  },
                        ...(Number(withdrawAmount) < affiliate.payout ? [{ label: 'Remaining', value: `$${(affiliate.payout - Number(withdrawAmount)).toFixed(2)}`, bold: false }] : []),
                        { label: 'Method',      value: formatMethod(affiliate.payout_method),                                                                bold: false },
                        { label: 'Paying to',   value: affiliate.payment_details ?? '—',                                                                    bold: false },
                        { label: 'Processing',  value: '2–3 business days',                                                                                 bold: false },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5"
                             style={{ borderBottom: `1px solid ${C.border}` }}>
                          <p className="text-[12px]" style={{ color: C.muted }}>{r.label}</p>
                          <p className={`text-[13px] ${r.bold ? 'font-extrabold' : 'font-bold'}`}
                             style={{ color: r.bold ? C.limeDeep : C.text }}>
                            {r.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-3 rounded-xl"
                         style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                      <AlertTriangle size={14} style={{ color: '#92400E', flexShrink: 0, marginTop: 1 }} />
                      <p className="text-[11px]" style={{ color: '#92400E' }}>
                        Double-check your payment details are correct.
                        Payments sent to wrong details cannot be reversed.
                      </p>
                    </div>

                    {/* Confirm checkbox */}
                    <button onClick={() => setWithdrawConfirmed(v => !v)}
                      className="flex items-center gap-2 text-left"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                           style={{ border: `2px solid ${withdrawConfirmed ? C.lime : C.border}`, backgroundColor: withdrawConfirmed ? C.lime : 'transparent' }}>
                        {withdrawConfirmed && <CheckCircle size={10} style={{ color: C.dark }} />}
                      </div>
                      <p className="text-[11px]" style={{ color: C.muted }}>
                        I confirm these payment details are correct
                      </p>
                    </button>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button onClick={() => { setWithdrawStep(1); setWithdrawConfirmed(false); setWithdrawPopupError('') }}
                        className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border"
                        style={{ borderColor: C.border, color: C.muted }}>
                        ← Back
                      </button>
                      <button onClick={async () => {
                        setRequesting(true)
                        try {
                          await (supabase.from('affiliate_withdrawal_requests') as any).insert([{
                            affiliate_id:    affiliate.id,
                            amount:          Number(withdrawAmount),
                            status:          'pending',
                            payment_method:  affiliate.payout_method,
                            payment_details: affiliate.payment_details,
                            requested_at:    new Date().toISOString(),
                          }])
                          setShowWithdrawPopup(false)
                          setWithdrawStep(1)
                          setWithdrawAmount('')
                          setWithdrawConfirmed(false)
                          setWithdrawPopupError('')
                          await load()
                        } catch(e) {
                          setWithdrawPopupError('Failed to submit — please try again')
                          setWithdrawStep(2)
                        } finally {
                          setRequesting(false)
                        }
                      }} disabled={requesting || !withdrawConfirmed}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all"
                        style={{ backgroundColor: C.dark, color: C.lime, opacity: !withdrawConfirmed ? 0.4 : 1 }}>
                        {requesting
                          ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                                 style={{ borderTopColor: C.lime }} />
                          : <>Submit Request <ArrowRight size={14} /></>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Support */}
          <div className="flex items-center justify-between p-4 rounded-2xl"
               style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
            <div>
              <p className="text-[13px] font-bold" style={{ color: C.text }}>
                Need help with your payments?
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                Issues with withdrawal, payout settings, or commissions
              </p>
            </div>
            <a href="mailto:support@riazify.com"
               className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-80 shrink-0"
               style={{ backgroundColor: C.dark, color: C.lime }}>
              <Info size={13} />
              Contact Support
            </a>
          </div>

        </div>
      )}

    </div>
  )
}