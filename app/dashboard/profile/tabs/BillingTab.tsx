'use client'
// app/dashboard/profile/tabs/BillingTab.tsx

import { useState, useEffect } from 'react'
import {
  Calendar, Lock, FileText, CheckCircle, Download,
  RefreshCw, Zap, TrendingUp, AlertTriangle, XCircle,
  Shield, Star, Crown, Clock,
  Receipt, CreditCard, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import PlanCards from '@/components/dashboard/PlanCards'

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
  const [loadingCancel,   setLoadingCancel]   = useState(false)
  const [loadingPortal,   setLoadingPortal]   = useState(false)
  const [showCardModal,   setShowCardModal]   = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelStep,      setCancelStep]      = useState(1)
  const [cancelReason,    setCancelReason]    = useState('')
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
    } catch (e) { console.error('[BillingTab] Load error:', e) }
    setLoading(false)
  }

  // ── Derived values ──────────────────────────────────────────
  const planName    = profile?.plan_name ?? 'Free'
  const plan        = PLANS[planName] ?? PLANS['Free']
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
  // ── Actions ────────────────────────────────────────────────
  async function handleCancel() {
    setLoadingCancel(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'cancel', lsSubId: profile?.subscription_id, userId: session.user.id, cancelAtPeriodEnd: true }),
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
      if (!session) return
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'resume', lsSubId: profile?.subscription_id, userId: session.user.id }),
      })
      const json = await res.json()
      if (json.success) loadAll()
    } catch (e) { console.error('[BillingTab] Resume error:', e) }
    setLoadingResume(false)
  }

  async function handleUpdatePayment() {
    setShowCardModal(true)
  }

  async function handleOpenPortal() {
    setLoadingPortal(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoadingPortal(false); return }
      const res = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      const url = json.url ?? 'https://app.lemonsqueezy.com/my-orders'
      const w = 520, h = 680
      const left = Math.round((window.screen.width - w) / 2)
      const top  = Math.round((window.screen.height - h) / 2)
      window.open(url, 'ls_portal', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`)
    } catch (e) { console.error('[BillingTab] Portal error:', e) }
    setLoadingPortal(false)
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
          <button
            onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0"
            style={{ backgroundColor: C.lime, color: C.dark, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700 }}
          >
            <Zap size={12} />
            Upgrade
          </button>
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
        className="w-full px-6 py-4 rounded-2xl flex items-center gap-5 flex-wrap"
        style={{ backgroundColor: C.surface, border: `1.5px solid rgba(143,255,0,0.4)` }}
      >
        {/* Plan badge */}
        <span
          style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:800, backgroundColor:C.lime, color:C.dark, padding:'4px 14px', borderRadius:20, letterSpacing:'.06em', whiteSpace:'nowrap' }}
        >
          {plan.label.toUpperCase()} PLAN
        </span>

        {/* Status badge */}
        <span
          className="flex items-center gap-1.5"
          style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700,
            backgroundColor: subStatus === 'active' ? 'rgba(143,255,0,0.12)' : subStatus === 'past_due' ? 'rgba(239,68,68,0.1)' : 'rgba(138,158,120,0.1)',
            color: subStatus === 'active' ? C.limeDeep : subStatus === 'past_due' ? '#dc2626' : C.muted,
            padding:'4px 12px', borderRadius:20,
            border: `1px solid ${subStatus === 'active' ? 'rgba(143,255,0,0.35)' : subStatus === 'past_due' ? '#fca5a5' : C.border}`,
            whiteSpace:'nowrap'
          }}
        >
          <div style={{ width:6, height:6, borderRadius:'50%', flexShrink:0,
            backgroundColor: subStatus === 'active' ? C.lime : subStatus === 'trialing' ? '#6366f1' : subStatus === 'past_due' ? '#ef4444' : C.muted,
            boxShadow: subStatus === 'active' ? `0 0 6px ${C.lime}` : 'none',
          }} />
          {subStatus === 'inactive' ? 'free' : subStatus === 'trialing' ? `trial — ${trialDaysLeft}d left` : subStatus}
        </span>

        {/* Divider */}
        <div style={{ width:1, height:28, backgroundColor:C.border, flexShrink:0 }} />

        {/* Price */}
        <div style={{ fontFamily:'Inter,sans-serif', fontSize:24, fontWeight:800, color:C.dark, whiteSpace:'nowrap' }}>
          {planName === 'Free' || planName === 'Free Trial'
            ? <span style={{ fontSize:18 }}>{planName === 'Free Trial' ? 'Free Trial' : 'Free Forever'}</span>
            : <>{`$${isAnnual ? plan.price_yr : plan.price_mo}`}<span style={{ fontSize:13, fontWeight:500, color:C.muted }}>{isAnnual ? '/yr' : '/mo'}</span></>
          }
        </div>

        {/* Divider */}
        {renewalRaw && <div style={{ width:1, height:28, backgroundColor:C.border, flexShrink:0 }} />}

        {/* Renewal */}
        {renewalRaw && (
          <div className="flex items-center gap-1.5" style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted, whiteSpace:'nowrap' }}>
            <Calendar size={13} />
            {renewalDate}
          </div>
        )}

        {/* Next charge */}
        {renewalRaw && (
          <div className="flex items-center gap-1.5" style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted, whiteSpace:'nowrap' }}>
            <Receipt size={13} />
            Next <strong style={{ color:C.dark, marginLeft:3 }}>${isAnnual ? plan.price_yr : plan.price_mo}</strong>
          </div>
        )}

        {/* Coupon */}
        {latestTxn?.coupon && (
          <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700, backgroundColor:C.limeTint, color:C.limeDeep, padding:'3px 10px', borderRadius:20, border:`1px solid ${C.lime}40`, whiteSpace:'nowrap' }}>
            Promo: {latestTxn.coupon}
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex:1 }} />

        {/* Resume button */}
        {isCancelled && (
          <button
            onClick={handleResume}
            disabled={loadingResume}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all hover:opacity-90"
            style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, backgroundColor:'#16a34a', color:'#fff', whiteSpace:'nowrap' }}
          >
            {loadingResume ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
            Resume
          </button>
        )}

        {/* Update Payment */}
        {planName !== 'Free' && planName !== 'Free Trial' && (
          <button
            onClick={handleUpdatePayment}
            disabled={loadingPortal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all hover:opacity-80"
            style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.dark, backgroundColor:C.bg, border:`1px solid ${C.border}`, whiteSpace:'nowrap', opacity:loadingPortal ? 0.7 : 1 }}
          >
            {loadingPortal ? <RefreshCw size={13} className="animate-spin" style={{ color:C.muted }} /> : <CreditCard size={13} />}
            {loadingPortal ? 'Opening...' : 'Update Payment'}
          </button>
        )}
      </div>



      {/* ── SECTION 3: All Plans ── */}
      <div
        id="plans-section"
        className="w-full p-6 rounded-2xl"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: C.lime }} />
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark }}>
              Plans & Pricing
            </h2>
          </div>
        </div>
        <PlanCards
          currentPlan={planName}
          isAnnual={isAnnual}
          onBillingToggle={() => setIsAnnual(a => !a)}
        />
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
                    <button
                      onClick={async () => {
                        try {
                          const { data: { session } } = await supabase.auth.getSession()
                          if (!session) return
                          const res = await fetch(`/api/payments/invoice?txnId=${txn.id}`, {
                            headers: { 'Authorization': `Bearer ${session.access_token}` },
                          })
                          if (!res.ok) { window.open(txn.invoice, '_blank'); return }
                          const blob = await res.blob()
                          const url  = URL.createObjectURL(blob)
                          const a    = document.createElement('a')
                          a.href     = url
                          a.download = res.headers.get('content-disposition')
                            ?.split('filename=')[1]?.replace(/"/g, '')
                            ?? `riazify-invoice.pdf`
                          a.click()
                          URL.revokeObjectURL(url)
                        } catch {
                          window.open(txn.invoice, '_blank')
                        }
                      }}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <Download size={15} style={{ color: C.muted }} />
                    </button>
                  ) : (
                    <FileText size={15} style={{ color: C.border }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Danger Zone ── */}
      {subStatus === 'active' && (
        <div
          className="w-full p-6 rounded-2xl"
          style={{ backgroundColor: C.surface, border: '1px solid #fca5a5' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#ef4444' }}>Danger Zone</h2>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.muted, marginBottom: 16 }}>
            Cancelling your subscription will downgrade your account to Free at the end of your billing period. Your data will be preserved.
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl transition-all hover:opacity-80"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #fca5a5' }}
          >
            <XCircle size={14} />
            Cancel Subscription
          </button>
        </div>
      )}

      {/* ── Payment Card Modal ── */}
      {showCardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCardModal(false) }}
        >
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2">
                <CreditCard size={16} style={{ color: C.dark }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark }}>Payment Method</span>
              </div>
              <button onClick={() => setShowCardModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={16} style={{ color: C.muted }} />
              </button>
            </div>

            {/* Card */}
            <div className="px-6 py-6 flex flex-col items-center gap-4">
              <style>{`
                .modal-card-scene { width: 300px; height: 178px; perspective: 1000px; cursor: pointer; }
                .modal-card-inner { width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.65s cubic-bezier(.4,0,.2,1); }
                .modal-card-scene:hover .modal-card-inner { transform: rotateY(180deg); }
                .modal-card-face { position:absolute; inset:0; border-radius:18px; overflow:hidden; backface-visibility:hidden; font-family:'Inter',sans-serif; }
                .modal-card-back { transform: rotateY(180deg); }
              `}</style>

              <div className="modal-card-scene">
                <div className="modal-card-inner">
                  {/* Front */}
                  <div className="modal-card-face" style={{ background: C.lime }}>
                    <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.15)', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', bottom:-40, left:-40, width:160, height:160, borderRadius:'50%', background:'rgba(10,13,8,0.08)', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', top:20, left:20, display:'flex', alignItems:'center', gap:4 }}>
                      <Shield size={11} style={{ color:C.dark, opacity:0.55 }} />
                      <span style={{ fontSize:11, fontWeight:800, color:C.dark, opacity:0.55, letterSpacing:'.06em' }}>RIAZIFY</span>
                    </div>
                    <div style={{ position:'absolute', top:48, left:20, width:32, height:24, background:C.dark, borderRadius:4, opacity:0.65 }}>
                      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, background:'rgba(143,255,0,0.3)', transform:'translateY(-50%)' }} />
                      <div style={{ position:'absolute', top:0, left:'50%', bottom:0, width:1, background:'rgba(143,255,0,0.2)', transform:'translateX(-50%)' }} />
                    </div>
                    <div style={{ position:'absolute', top:20, right:20 }}>
                      <span style={{ fontSize:15, fontWeight:900, fontStyle:'italic', color:C.dark, opacity:0.6 }}>VISA</span>
                    </div>
                    <div style={{ position:'absolute', bottom:46, left:20, fontSize:14, fontWeight:500, letterSpacing:3, color:C.dark, fontFamily:"'Courier New',monospace", opacity:0.8 }}>
                      •••• •••• •••• {profile?.card_last_four ?? '4242'}
                    </div>
                    <div style={{ position:'absolute', bottom:12, left:20 }}>
                      <div style={{ fontSize:9, color:C.dark, opacity:0.5, letterSpacing:'.1em', marginBottom:2 }}>CARDHOLDER</div>
                      <div style={{ fontSize:12, fontWeight:700, color:C.dark }}>{profile?.name ?? profile?.email?.split('@')[0] ?? 'Riazify User'}</div>
                    </div>
                    <div style={{ position:'absolute', bottom:12, right:20, textAlign:'right' }}>
                      <div style={{ fontSize:9, color:C.dark, opacity:0.5, letterSpacing:'.1em', marginBottom:2 }}>EXPIRES</div>
                      <div style={{ fontSize:12, fontWeight:700, color:C.dark }}>12/28</div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="modal-card-face modal-card-back" style={{ background: C.limeDeep }}>
                    <div style={{ position:'absolute', top:26, left:0, right:0, height:38, background:'rgba(0,0,0,0.3)' }} />
                    <div style={{ position:'absolute', top:80, left:14, right:14, height:30, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(143,255,0,0.3)', borderRadius:4, display:'flex', alignItems:'center', padding:'0 10px' }}>
                      <span style={{ fontSize:16, letterSpacing:4, color:C.lime, flex:1 }}>•••</span>
                      <span style={{ fontSize:9, color:'rgba(143,255,0,0.7)', letterSpacing:'.1em' }}>CVV</span>
                    </div>
                    <div style={{ position:'absolute', bottom:12, left:14, display:'flex', alignItems:'center', gap:4 }}>
                      <Lock size={10} style={{ color:'rgba(143,255,0,0.7)' }} />
                      <span style={{ fontSize:10, color:'rgba(143,255,0,0.7)', fontWeight:600 }}>Secured by LemonSqueezy</span>
                    </div>
                    <div style={{ position:'absolute', bottom:10, right:14, fontSize:14, fontWeight:900, fontStyle:'italic', color:'rgba(143,255,0,0.4)' }}>VISA</div>
                  </div>
                </div>
              </div>

              <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:C.muted, display:'flex', alignItems:'center', gap:4 }}>
                <CreditCard size={11} />
                Hover card to flip
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center px-6 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <style>{`
                .portal-btn { background-color: #0a0d08; color: #8fff00; transition: background-color 0.3s ease, color 0.3s ease; }
                .portal-btn:hover { background-color: #8fff00; color: #0a0d08; }
              `}</style>
              <button
                onClick={() => { setShowCardModal(false); handleOpenPortal() }}
                disabled={loadingPortal}
                className="portal-btn flex items-center gap-2 px-8 py-2.5 rounded-full"
                style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:700, opacity:loadingPortal ? 0.7 : 1, cursor: loadingPortal ? 'not-allowed' : 'pointer' }}
              >
                {loadingPortal ? <RefreshCw size={13} className="animate-spin" /> : null}
                {loadingPortal ? 'Opening...' : 'Update Payment Method'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Subscription Modal — 3 steps ── */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowCancelModal(false); setCancelStep(1); setCancelReason('') } }}
        >
          <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ backgroundColor: C.surface, border: '1px solid #fca5a5' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3">
                <AlertTriangle size={17} style={{ color: '#ef4444' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark }}>
                  Cancel Subscription
                </span>
                {/* Step indicator */}
                <div className="flex items-center gap-1">
                  {[1,2,3].map(s => (
                    <div key={s} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: s <= cancelStep ? '#ef4444' : C.border,
                      transition: 'background-color 0.2s'
                    }} />
                  ))}
                </div>
              </div>
              <button onClick={() => { setShowCancelModal(false); setCancelStep(1); setCancelReason('') }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={16} style={{ color: C.muted }} />
              </button>
            </div>

            {/* ── STEP 1: Reason ── */}
            {cancelStep === 1 && (
              <>
                <div className="px-6 py-5 flex flex-col gap-3">
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
                    Why are you leaving?
                  </p>
                  {[
                    'Too expensive',
                    'Not using it enough',
                    'Missing features I need',
                    'Switching to a competitor',
                    'Technical issues',
                    'Other reason',
                  ].map(reason => (
                    <button
                      key={reason}
                      onClick={() => setCancelReason(reason)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                        backgroundColor: cancelReason === reason ? '#fef2f2' : C.bg,
                        border: `1px solid ${cancelReason === reason ? '#fca5a5' : C.border}`,
                        color: cancelReason === reason ? '#ef4444' : C.dark,
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${cancelReason === reason ? '#ef4444' : C.border}`,
                        backgroundColor: cancelReason === reason ? '#ef4444' : 'transparent',
                      }} />
                      {reason}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
                  <button onClick={() => { setShowCancelModal(false); setCancelStep(1); setCancelReason('') }}
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: C.muted }}>
                    Keep My Plan
                  </button>
                  <button
                    onClick={() => cancelReason && setCancelStep(2)}
                    disabled={!cancelReason}
                    className="px-5 py-2.5 rounded-xl transition-all"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, backgroundColor: cancelReason ? C.dark : C.border, color: cancelReason ? '#fff' : C.muted, cursor: cancelReason ? 'pointer' : 'not-allowed' }}
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 2: Retention offer ── */}
            {cancelStep === 2 && (
              <>
                <div className="px-6 py-5 flex flex-col gap-4">
                  {cancelReason === 'Too expensive' && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: C.limeDeep, marginBottom: 6 }}>
                        Before you go — special offer
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.dark }}>
                        Would a <strong>20% discount for 3 months</strong> change your mind? Contact us and we'll apply it to your account immediately.
                      </p>
                    </div>
                  )}
                  {cancelReason === 'Not using it enough' && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: C.limeDeep, marginBottom: 6 }}>
                        Would pausing work instead?
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.dark }}>
                        You can downgrade to the <strong>Free plan</strong> and keep your data. Come back when you're ready — no setup required.
                      </p>
                    </div>
                  )}
                  {cancelReason === 'Missing features I need' && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: C.limeDeep, marginBottom: 6 }}>
                        What's coming in 30 days
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.dark }}>
                        Competitor research, bulk title builder, and AI product scoring are all shipping soon. Your feedback shapes what we build next.
                      </p>
                    </div>
                  )}
                  {cancelReason === 'Switching to a competitor' && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: C.limeDeep, marginBottom: 6 }}>
                        We'd love to know more
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.dark }}>
                        What does the other tool offer that we don't? Your answer helps us build exactly what eBay sellers need.
                      </p>
                    </div>
                  )}
                  {(cancelReason === 'Technical issues' || cancelReason === 'Other reason') && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}40` }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: C.limeDeep, marginBottom: 6 }}>
                        Let us fix it first
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.dark }}>
                        Our support team typically responds within 2 hours. Submit a ticket and give us a chance to resolve your issue before cancelling.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
                  <button onClick={() => setCancelStep(1)}
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: C.muted }}>
                    ← Back
                  </button>
                  <button onClick={() => setCancelStep(3)}
                    className="px-5 py-2.5 rounded-xl transition-all hover:opacity-80"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #fca5a5' }}>
                    Still want to cancel
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 3: Confirm ── */}
            {cancelStep === 3 && (
              <>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#991b1b', letterSpacing: '0.06em', marginBottom: 10 }}>
                      YOU WILL LOSE ACCESS TO
                    </p>
                    <div className="flex flex-col gap-2">
                      {['Your current plan features', 'Product research history', 'Order protection', 'Title builder access', 'Team member access'].map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <XCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7f1d1d' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                    <Calendar size={14} style={{ color: C.muted, flexShrink: 0 }} />
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: C.dark }}>
                      Access continues until <strong>{renewalDate}</strong>. No charges after that.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => { setShowCancelModal(false); setCancelStep(1); setCancelReason('') }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                    style={{ backgroundColor: C.lime, color: C.dark, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700 }}
                  >
                    Keep My Plan
                  </button>
                  <button
                    onClick={() => { setShowCancelModal(false); setCancelStep(1); setCancelReason(''); handleCancel() }}
                    disabled={loadingCancel}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #fca5a5' }}
                  >
                    {loadingCancel ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />}
                    Yes, Cancel
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}