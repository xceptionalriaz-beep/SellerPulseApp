'use client'
// app/dashboard/profile/tabs/BillingTab.tsx

import { useState, useEffect } from 'react'
import {
  Calendar, Lock, FileText, CheckCircle, Download,
  RefreshCw, Zap, TrendingUp, AlertTriangle, XCircle,
  ChevronRight, Shield, Star, Crown, Clock,
  ToggleLeft, ToggleRight, Receipt, CreditCard, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#0a0d08',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  bg:       '#f9fdf4',
}

// ── Plan config — matches exact DB values ──────────────────────
const PLANS: Record<string, {
  label: string; price_mo: number; price_yr: number
  color: string; bg: string; icon: React.ElementType
  variant_mo: string | null; variant_yr: string | null
}> = {
  'Free': {
    label: 'Free', price_mo: 0, price_yr: 0,
    color: '#8a9e78', bg: 'rgba(138,158,120,0.1)', icon: Shield,
    variant_mo: null, variant_yr: null,
  },
  'Free Trial': {
    label: 'Free Trial', price_mo: 0, price_yr: 0,
    color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: Clock,
    variant_mo: null, variant_yr: null,
  },
  'Starter': {
    label: 'Starter', price_mo: 19, price_yr: 182,
    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Star,
    variant_mo: '1816372', variant_yr: '1816460',
  },
  'Growth': {
    label: 'Growth', price_mo: 49, price_yr: 470,
    color: '#8fff00', bg: 'rgba(143,255,0,0.1)', icon: TrendingUp,
    variant_mo: '1816599', variant_yr: '1816810',
  },
  'Custom': {
    label: 'Custom', price_mo: 149, price_yr: 1430,
    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Crown,
    variant_mo: '1816827', variant_yr: '1816837',
  },
}

const PLAN_ORDER = ['Free', 'Free Trial', 'Starter', 'Growth', 'Custom']







// ── Main component ─────────────────────────────────────────────
export default function BillingTab() {
  const supabase = createClient()

  const [profile,       setProfile]       = useState<any>(null)
  const [transactions,  setTransactions]  = useState<any[]>([])
  const [isAnnual,      setIsAnnual]      = useState(false)
  const [loadingUpgrade,  setLoadingUpgrade]  = useState(false)
  const [currentLimits,   setCurrentLimits]   = useState<any>(null)
  const [nextLimits,      setNextLimits]      = useState<any>(null)
  const [loadingCancel,   setLoadingCancel]   = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [loadingResume, setLoadingResume] = useState(false)
  const [exportingCSV,  setExportingCSV]  = useState(false)
  const [loading,       setLoading]       = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() as any
      if (prof) setProfile(prof)

      // Load transactions
      const { data: txns } = await (supabase.from('transactions') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (txns) setTransactions(txns)

      // usage data lives in OverviewTab

      // Load current + next plan limits for comparison
      const currentPlanName = (prof as any)?.plan_name ?? 'Free'
      const currentIdx      = PLAN_ORDER.indexOf(currentPlanName)
      const nextPlanName2   = PLAN_ORDER[currentIdx + 1] && PLAN_ORDER[currentIdx + 1] !== 'Free Trial'
        ? PLAN_ORDER[currentIdx + 1] : null

      const tierNames = [currentPlanName.toLowerCase()]
      if (nextPlanName2) tierNames.push(nextPlanName2.toLowerCase())

      const { data: limitsRows } = await (supabase.from('plan_limits') as any)
        .select('tier, max_orders_protected, max_monthly_searches, max_title_generations, max_competitor_scans, max_profit_calcs, max_team_seats, has_competitor_research, has_api_access, has_priority_support, has_advanced_analytics')
        .in('tier', tierNames)

      if (limitsRows) {
        const curr = limitsRows.find((r: any) => r.tier === currentPlanName.toLowerCase())
        const next = nextPlanName2 ? limitsRows.find((r: any) => r.tier === nextPlanName2.toLowerCase()) : null
        if (curr) setCurrentLimits(curr)
        if (next) setNextLimits(next)
      }

    } catch (e) { console.error('[BillingTab] Load error:', e) }
    setLoading(false)
  }

  // ── Derived values ──────────────────────────────────────────
  const planName    = profile?.plan_name ?? 'Free'
  const plan        = PLANS[planName] ?? PLANS['Free']
  const PlanIcon    = plan.icon
  const subStatus   = profile?.subscription_status ?? 'inactive'
  const isCancelled = subStatus === 'cancelled'
  const isPastDue   = subStatus === 'past_due'
  const isTrialing  = subStatus === 'trialing'

  // Trial days remaining
  const trialDaysLeft = isTrialing && profile?.created_at
    ? Math.max(0, 14 - Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000))
    : 0

  // Next billing from latest transaction
  const latestTxn    = transactions[0]
  const renewalRaw   = latestTxn?.next_billing ?? profile?.current_period_end ?? null
  const renewalDate  = renewalRaw
    ? new Date(renewalRaw).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  // Next plan up
  const currentIdx  = PLAN_ORDER.indexOf(planName)
  const nextPlanName = PLAN_ORDER[currentIdx + 1] && PLAN_ORDER[currentIdx + 1] !== 'Free Trial'
    ? PLAN_ORDER[currentIdx + 1]
    : null
  const nextPlan    = nextPlanName ? PLANS[nextPlanName] : null
  // Annual savings
  const annualSavings = plan.price_mo > 0 ? Math.round((plan.price_mo * 12) - plan.price_yr) : 0

  // ── Actions ────────────────────────────────────────────────
  async function handleUpgrade(targetPlan: string) {
    setLoadingUpgrade(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoadingUpgrade(false); return }
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          plan:      targetPlan.toLowerCase(),
          billing:   isAnnual ? 'annual' : 'monthly',
          userId:    session.user.id,
          userEmail: session.user.email,
          userName:  profile?.name ?? session.user.email,
        }),
      })
      const json = await res.json()
      if (json.url) window.open(json.url, '_blank', 'noopener,noreferrer')
      else console.error('[BillingTab] No checkout URL:', json.error)
    } catch (e) { console.error('[BillingTab] Upgrade error:', e) }
    setLoadingUpgrade(false)
  }

  async function handleCancel() {
    setLoadingCancel(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoadingUpgrade(false); return }
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const json = await res.json()
      if (json.success) loadAll()
    } catch (e) { console.error('[BillingTab] Cancel error:', e) }
    setLoadingCancel(false)
  }

  async function handleResume() {
    setLoadingResume(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoadingUpgrade(false); return }
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'resume' }),
      })
      const json = await res.json()
      if (json.success) loadAll()
    } catch (e) { console.error('[BillingTab] Resume error:', e) }
    setLoadingResume(false)
  }

  async function handleUpdatePayment() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoadingUpgrade(false); return }
      const res = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (json.url) window.open(json.url, '_blank')
    } catch (e) { console.error('[BillingTab] Portal error:', e) }
  }

  function exportCSV() {
    setExportingCSV(true)
    try {
      const headers = ['Date', 'Plan', 'Amount', 'Billing', 'Status', 'Coupon']
      const rows = transactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        t.plan ?? '—',
        t.amount ?? '—',
        t.billing ?? '—',
        t.status ?? '—',
        t.coupon ?? '—',
      ])
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'riazify-invoices.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error('[BillingTab] CSV export error:', e) }
    setExportingCSV(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Payment failed banner ── */}
      {isPastDue && (
        <div
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
          style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}
        >
          <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#991b1b' }}>
            Your last payment failed. Please update your payment method to keep access.
          </p>
          <button
            onClick={handleUpdatePayment}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0"
            style={{ backgroundColor: '#dc2626', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700 }}
          >
            <CreditCard size={12} />
            Fix Payment
          </button>
        </div>
      )}

      {/* ── Trial warning banner ── */}
      {isTrialing && trialDaysLeft <= 3 && (
        <div
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
          style={{ backgroundColor: '#fefce8', border: '1px solid #fbbf24' }}
        >
          <Clock size={16} style={{ color: '#b45309', flexShrink: 0 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#92400e' }}>
            Your free trial ends in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong>. Upgrade now to keep your data and access.
          </p>
          {nextPlan && (
            <button
              onClick={() => handleUpgrade(nextPlanName!)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0"
              style={{ backgroundColor: C.lime, color: C.dark, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700 }}
            >
              <Zap size={12} />
              Upgrade
            </button>
          )}
        </div>
      )}

      {/* ── Cancelled banner ── */}
      {isCancelled && (
        <div
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
          style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}
        >
          <XCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#991b1b' }}>
            Your subscription was cancelled. Access ends on <strong>{renewalDate}</strong>.
          </p>
          <button
            onClick={handleResume}
            disabled={loadingResume}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0"
            style={{ backgroundColor: '#16a34a', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700 }}
          >
            {loadingResume ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            Resume
          </button>
        </div>
      )}

      {/* ── SECTION 1: Active Plan Hero Card ── */}
      <div
        className="w-full p-6 rounded-2xl relative overflow-hidden"
        style={{
          backgroundColor: C.surface,
          border: `1.5px solid ${plan.color}40`,
          boxShadow: `0 4px 24px ${plan.color}15`,
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${plan.color}12 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }}
        />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: plan.bg, border: `1px solid ${plan.color}40` }}
            >
              <PlanIcon size={22} style={{ color: plan.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-widest"
                  style={{ backgroundColor: plan.bg, color: plan.color, border: `1px solid ${plan.color}40` }}
                >
                  {plan.label.toUpperCase()} PLAN
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px]"
                  style={{
                    backgroundColor: subStatus === 'active' ? 'rgba(34,197,94,0.1)'
                      : subStatus === 'trialing' ? 'rgba(99,102,241,0.1)'
                      : subStatus === 'past_due' ? 'rgba(239,68,68,0.1)'
                      : 'rgba(138,158,120,0.1)',
                    color: subStatus === 'active' ? '#16a34a'
                      : subStatus === 'trialing' ? '#6366f1'
                      : subStatus === 'past_due' ? '#dc2626'
                      : C.muted,
                    border: `1px solid ${subStatus === 'active' ? '#86efac'
                      : subStatus === 'trialing' ? '#a5b4fc'
                      : subStatus === 'past_due' ? '#fca5a5'
                      : C.border}`,
                    fontWeight: 700,
                  }}
                >
                  {subStatus === 'inactive' ? 'Free' : subStatus === 'trialing' ? `Trial — ${trialDaysLeft}d left` : subStatus}
                </span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 800, color: C.dark, letterSpacing: '-0.02em' }}>
                {planName === 'Free' || planName === 'Free Trial'
                  ? planName === 'Free Trial' ? 'Free Trial' : 'Free Forever'
                  : `$${isAnnual ? plan.price_yr : plan.price_mo}`
                }
                {planName !== 'Free' && planName !== 'Free Trial' && (
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.muted }}>
                    {isAnnual ? '/year' : '/month'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Billing cycle toggle */}
          {planName !== 'Free' && planName !== 'Free Trial' && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: !isAnnual ? C.dark : C.muted }}>Monthly</span>
              <button onClick={() => setIsAnnual(a => !a)}>
                {isAnnual
                  ? <ToggleRight size={22} style={{ color: C.lime }} />
                  : <ToggleLeft  size={22} style={{ color: C.muted }} />
                }
              </button>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: isAnnual ? C.dark : C.muted }}>Annual</span>
              {isAnnual && annualSavings > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                  Save ${annualSavings}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Renewal + next invoice */}
        {renewalRaw && (
          <div className="flex items-center gap-4 mt-5 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: C.muted }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: C.muted }}>
                Renews on {renewalDate}
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
              <Receipt size={13} style={{ color: C.muted }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: C.muted }}>
                Next charge: <strong style={{ color: C.dark }}>${isAnnual ? plan.price_yr : plan.price_mo}</strong>
              </span>
            </div>
            {latestTxn?.coupon && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: C.limeDeep }}>
                  Promo: {latestTxn.coupon}
                </span>
              </div>
            )}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${C.border}`, margin: '20px 0' }} />

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {nextPlan && nextPlan.variant_mo && (
            <button
              onClick={() => handleUpgrade(nextPlanName!)}
              disabled={loadingUpgrade}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: C.lime, color: C.dark, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, opacity: loadingUpgrade ? 0.7 : 1 }}
            >
              {loadingUpgrade ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
              {loadingUpgrade ? 'Opening checkout...' : `Upgrade to ${nextPlan.label}`}
            </button>
          )}
          {subStatus === 'active' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #fca5a5' }}
            >
              <XCircle size={13} />
              Cancel Subscription
            </button>
          )}
          {isCancelled && (
            <button
              onClick={handleResume}
              disabled={loadingResume}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: '#16a34a', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700 }}
            >
              {loadingResume ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              Resume Subscription
            </button>
          )}
        </div>
      </div>



      {/* ── SECTION 3: Plan Comparison or Highest Plan ── */}
      {!nextPlan && planName === 'Custom' && (
        <div
          className="w-full px-6 py-4 rounded-2xl flex items-center gap-3"
          style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <Crown size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: C.dark }}>
            You're on our highest plan. You have full access to everything Riazify offers.
          </p>
        </div>
      )}
      {nextPlan && nextPlanName && nextPlan.variant_mo && (
        <div
          className="w-full p-6 rounded-2xl"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} style={{ color: C.lime }} />
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark }}>
              Upgrade to {nextPlan.label}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">

            {/* Current plan */}
            <div className="rounded-xl p-4" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', marginBottom: 12 }}>
                CURRENT — {planName.toUpperCase()}
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Orders/mo',         val: currentLimits?.max_orders_protected   },
                  { label: 'Product Searches',   val: currentLimits?.max_monthly_searches   },
                  { label: 'Title Generations',  val: currentLimits?.max_title_generations  },
                  { label: 'Competitor Scans',   val: currentLimits?.max_competitor_scans   },
                  { label: 'Profit Calcs',       val: currentLimits?.max_profit_calcs       },
                  { label: 'Team Seats',         val: currentLimits?.max_team_seats         },
                  { label: 'Advanced Analytics', val: currentLimits?.has_advanced_analytics },
                  { label: 'Competitor Research',val: currentLimits?.has_competitor_research},
                  { label: 'API Access',         val: currentLimits?.has_api_access         },
                  { label: 'Priority Support',   val: currentLimits?.has_priority_support   },
                ].map(({ label, val }) => {
                  const display = val === -1 ? 'Unlimited' : val === 0 ? '—' : val === true ? '✓' : val === false ? '—' : val
                  const isGood  = val === -1 || val === true || (typeof val === 'number' && val > 0)
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.muted }}>{label}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: isGood ? C.dark : C.muted }}>{display}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Next plan */}
            <div className="rounded-xl p-4" style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: C.limeDeep, letterSpacing: '0.08em', marginBottom: 12 }}>
                UPGRADE — {nextPlanName.toUpperCase()}
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Orders/mo',          val: nextLimits?.max_orders_protected    },
                  { label: 'Product Searches',    val: nextLimits?.max_monthly_searches    },
                  { label: 'Title Generations',   val: nextLimits?.max_title_generations   },
                  { label: 'Competitor Scans',    val: nextLimits?.max_competitor_scans    },
                  { label: 'Profit Calcs',        val: nextLimits?.max_profit_calcs        },
                  { label: 'Team Seats',          val: nextLimits?.max_team_seats          },
                  { label: 'Advanced Analytics',  val: nextLimits?.has_advanced_analytics  },
                  { label: 'Competitor Research', val: nextLimits?.has_competitor_research },
                  { label: 'API Access',          val: nextLimits?.has_api_access          },
                  { label: 'Priority Support',    val: nextLimits?.has_priority_support    },
                ].map(({ label, val }) => {
                  const display = val === -1 ? 'Unlimited' : val === 0 ? '—' : val === true ? '✓' : val === false ? '—' : val
                  const isGood  = val === -1 || val === true || (typeof val === 'number' && val > 0)
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.limeDeep }}>{label}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: isGood ? C.dark : C.muted }}>{display}</span>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => handleUpgrade(nextPlanName!)}
                disabled={loadingUpgrade}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: C.lime, color: C.dark, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, opacity: loadingUpgrade ? 0.7 : 1 }}
              >
                {loadingUpgrade ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                {loadingUpgrade ? 'Opening...' : `Upgrade — $${isAnnual ? nextPlan.price_yr : nextPlan.price_mo}${isAnnual ? '/yr' : '/mo'}`}
                {!loadingUpgrade && <ChevronRight size={14} />}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── SECTION 4: Payment Method ── */}
      <div
        className="w-full p-6 rounded-2xl"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Lock size={16} style={{ color: C.lime }} />
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark }}>Payment Method</h2>
          </div>
          <button
            onClick={handleUpdatePayment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all hover:opacity-80"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: C.dark, backgroundColor: C.bg, border: `1px solid ${C.border}` }}
          >
            <CreditCard size={13} />
            Update Payment
          </button>
        </div>
        <div
          className="w-full max-w-[300px] p-5 rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #1a2910 100%)`, boxShadow: '0 8px 24px rgba(10,13,8,0.2)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center" style={{ borderColor: 'rgba(143,255,0,0.3)' }}>
              <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'rgba(143,255,0,0.5)' }} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 900, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>VISA</span>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 500, letterSpacing: '3px', color: '#ffffff', marginBottom: 20 }}>
            ••••  ••••  ••••  4242
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>CARDHOLDER</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{profile?.name ?? profile?.email?.split('@')[0] ?? 'Riazify User'}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>EXPIRES</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#ffffff' }}>12/28</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 5: Invoice History ── */}
      <div
        className="w-full p-6 rounded-2xl"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: C.lime }} />
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark }}>Invoice History</h2>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={exportCSV}
              disabled={exportingCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: C.dark, backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
              {exportingCSV ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
              Export CSV
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Receipt size={32} style={{ color: C.border }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.muted }}>No invoices yet</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <div
              className="grid grid-cols-5 px-4 py-3"
              style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}
            >
              {['DATE', 'PLAN', 'AMOUNT', 'BILLING', 'STATUS'].map((h, i) => (
                <span key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.08em' }}>{h}</span>
              ))}
            </div>
            {transactions.map((txn, i) => (
              <div
                key={i}
                className="grid grid-cols-5 items-center px-4 py-3.5"
                style={{ borderBottom: i < transactions.length - 1 ? `1px solid ${C.border}` : 'none' }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.dark }}>
                  {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: C.dark }}>
                  {txn.plan ?? '—'}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: C.dark }}>
                  ${parseFloat(txn.amount ?? '0').toFixed(2)}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.muted, textTransform: 'capitalize' }}>
                  {txn.billing ?? '—'}
                </span>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{
                      backgroundColor: ['paid', 'active'].includes(txn.status) ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: ['paid', 'active'].includes(txn.status) ? '#16a34a' : '#dc2626',
                    }}
                  >
                    <CheckCircle size={10} />
                    {txn.status ?? '—'}
                  </span>
                  {txn.invoice ? (
                    <a href={txn.invoice} target="_blank" rel="noopener noreferrer">
                      <Download size={15} style={{ color: C.muted }} />
                    </a>
                  ) : (
                    <FileText size={15} style={{ color: C.border }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cancel Subscription Modal ── */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCancelModal(false) }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl"
            style={{ backgroundColor: C.surface, border: '1px solid #fca5a5' }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark }}>
                  Cancel Subscription
                </span>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} style={{ color: C.muted }} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 flex flex-col gap-4">

              {/* What they lose */}
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
              >
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#991b1b', letterSpacing: '0.06em', marginBottom: 10 }}>
                  YOU WILL LOSE ACCESS TO
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    currentLimits?.max_orders_protected !== undefined && `${currentLimits.max_orders_protected === -1 ? 'Unlimited' : currentLimits.max_orders_protected} Orders Protected/mo`,
                    currentLimits?.max_monthly_searches !== undefined && `${currentLimits.max_monthly_searches === -1 ? 'Unlimited' : currentLimits.max_monthly_searches} Product Searches`,
                    currentLimits?.max_title_generations !== undefined && `${currentLimits.max_title_generations === -1 ? 'Unlimited' : currentLimits.max_title_generations} Title Generations`,
                    currentLimits?.has_advanced_analytics && 'Advanced Analytics',
                    currentLimits?.has_competitor_research && 'Competitor Research',
                    currentLimits?.has_api_access && 'API Access',
                  ].filter(Boolean).map((feature) => (
                    <div key={feature as string} className="flex items-center gap-2">
                      <XCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7f1d1d' }}>{feature as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access until date */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
              >
                <Calendar size={15} style={{ color: C.muted, flexShrink: 0 }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: C.dark }}>
                  You'll keep full access until <strong>{renewalDate}</strong>. No charges after that.
                </p>
              </div>

              {/* Soft save */}
              {nextPlan && (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}
                >
                  <Zap size={15} style={{ color: C.limeDeep, flexShrink: 0 }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: C.dark }}>
                    Consider switching to a lower plan instead of cancelling completely.
                  </p>
                </div>
              )}

            </div>

            {/* Modal footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: C.lime, color: C.dark, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700 }}
              >
                Keep My Plan
              </button>
              <button
                onClick={() => { setShowCancelModal(false); handleCancel() }}
                disabled={loadingCancel}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #fca5a5' }}
              >
                {loadingCancel ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}