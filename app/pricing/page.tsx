'use client'

// app/pricing/page.tsx
// Full standalone pricing page — uses shared Navbar and Footer

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Check, X, Zap, TrendingUp, Users,
  ArrowRight, Star, ChevronDown, ChevronUp, Shield
} from 'lucide-react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

// -- Riazify Color Role Tokens (v2.0) ---------------------------
const T = {
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
}

interface DBPlan {
  id: string
  plan_id: string
  sort_order: number
  name: string
  price: string
  period: string
  price_annual: string | null
  price_annual_total: string | null
  description: string
  features: { text: string; included: boolean }[]
  cta_text: string
  highlight: boolean
  is_active: boolean
}

const STATS = [
  { icon: Shield, value: '12,400+', label: 'Orders Protected' },
  { icon: Users, value: '3,200+', label: 'Active Sellers' },
  { icon: TrendingUp, value: '$2.8M+', label: 'Fraud Prevented' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
]

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes — cancel from your billing settings with one click. No penalties, no questions asked.' },
  { q: 'Is there a free trial?', a: 'Every paid plan includes a full 14-day free trial. No credit card required to get started.' },
  { q: 'What payment methods do you accept?', a: 'All major credit and debit cards via LemonSqueezy. Enterprise-grade payment processing with full fraud mitigation.' },
  { q: 'Can I switch plans later?', a: 'Yes — upgrade or downgrade at any time. Changes apply immediately and billing is automatically prorated.' },
  { q: 'Do you offer annual discounts?', a: 'Yes — annual billing saves you up to 20% compared to month-to-month plans.' },
  { q: 'What happens when I hit a limit?', a: 'You will receive an in-app notice to upgrade. Your active listings, historical logs, and order data are never affected.' },
]

const PLAN_STYLE: Record<string, { bg: string; border: string; badge?: string; badgeBg?: string; badgeColor?: string }> = {
  free: { bg: T.surface, border: T.border },
  starter: { bg: T.surface, border: '#ddd6fe' },
  growth: { bg: T.dark, border: T.primary, badge: 'MOST POPULAR', badgeBg: T.accent, badgeColor: T.dark },
  custom: { bg: T.darkCard, border: T.borderDark, badge: 'ENTERPRISE', badgeBg: T.primary, badgeColor: '#ffffff' },
}

export default function PricingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [plans, setPlans] = useState<DBPlan[]>([])
  const [loaded, setLoaded] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('landing_pricing')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (data) setPlans(data as DBPlan[])

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan_name')
            .eq('id', user.id)
            .single()
          if (profile) setCurrentPlan((profile as any).plan_name ?? 'free')
        }

        // Auto-set billing if redirected from signup
        const urlParams = new URLSearchParams(window.location.search)
        const checkout = urlParams.get('checkout')
        if (checkout && user) {
          const [, billingCycle] = checkout.split('_')
          if (billingCycle) setBilling(billingCycle as 'monthly' | 'annual')
        }
      } catch { }
      setLoaded(true)
    }
    load()
  }, [])

  async function handleCta(plan: DBPlan) {
    if (plan.plan_id === 'custom') { router.push('/contact'); return }
    if (currentPlan === plan.plan_id) return
    if (plan.plan_id === 'free') { router.push('/auth/signup'); return }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Not logged in → go to signup first
    if (!user) {
      router.push(`/auth/signup?plan=${plan.plan_id}&billing=${billing}&next=/pricing?checkout=${plan.plan_id}_${billing}`)
      return
    }

    // Logged in → create checkout
    setCheckoutLoading(plan.plan_id)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.plan_id,
          billing,
          userId: user.id,
          userEmail: user.email,
          userName: (profile as any)?.full_name ?? '',
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: T.bg }}>
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: T.primary }} />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: T.bg }}>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* Hero Section */}
        <div className="text-center mb-14 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 text-[11px] font-black tracking-wider border uppercase font-syne"
            style={{ backgroundColor: T.primaryLight, color: T.primary, borderColor: T.border }}>
            <Zap size={12} className="fill-current" /> NO CONTRACTS · CANCEL ANYTIME
          </div>
          <h1 className="text-[40px] md:text-[56px] font-black leading-tight mb-4 font-syne tracking-tight"
            style={{ color: T.textDark }}>
            Simple pricing for<br />
            <span style={{ color: T.primary }}>serious eBay operators</span>
          </h1>
          <p className="text-[16px] max-w-xl mx-auto leading-relaxed" style={{ color: T.muted }}>
            Every plan includes order protection, Cassini title builder, and automated fee calculators.
            Upgrade when your volume scales.
          </p>
        </div>

        {/* ── Billing Cycle Toggle ── */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span className={`text-[13px] font-bold transition-colors ${billing === 'monthly' ? 'text-[#1e1535]' : 'text-[#6b7280]'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-14 h-7 rounded-full transition-all cursor-pointer p-0.5"
            style={{ backgroundColor: billing === 'annual' ? T.primary : '#d8d1f2' }}
            aria-label="Toggle annual or monthly billing"
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: billing === 'annual' ? T.accent : T.surface,
              transform: billing === 'annual' ? 'translateX(28px)' : 'translateX(0)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-bold transition-colors ${billing === 'annual' ? 'text-[#1e1535]' : 'text-[#6b7280]'}`}>
              Annual
            </span>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-syne shadow-xs"
              style={{ backgroundColor: T.primaryLight, color: T.primary, border: `1px solid ${T.border}` }}>
              SAVE UP TO 20%
            </span>
          </div>
        </div>

        {/* ── Pricing Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 items-stretch">
          {plans.map((plan) => {
            const style = PLAN_STYLE[plan.plan_id] ?? PLAN_STYLE.free
            const isDark = plan.plan_id === 'growth' || plan.plan_id === 'custom'
            const isCustom = plan.plan_id === 'custom'
            const isCurrent = currentPlan === plan.plan_id
            const yes = plan.features.filter(f => f.included)
            const no = plan.features.filter(f => !f.included)

            return (
              <div
                key={plan.id}
                className="rounded-3xl flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: style.bg,
                  border: `${isCurrent || plan.highlight ? 2 : 1}px solid ${isCurrent ? T.accent : plan.highlight ? T.primary : style.border
                    }`,
                  boxShadow: plan.highlight
                    ? '0 20px 50px rgba(117,48,251,0.22)'
                    : isCustom
                      ? '0 20px 50px rgba(30,21,53,0.3)'
                      : '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                {/* Badge header */}
                {(style.badge || isCurrent) && (
                  <div className="px-6 pt-5">
                    <span
                      className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-syne shadow-xs"
                      style={{
                        backgroundColor: isCurrent ? T.accent : (style.badgeBg ?? T.primary),
                        color: isCurrent ? T.dark : (style.badgeColor ?? '#ffffff'),
                      }}
                    >
                      {isCurrent ? 'CURRENT PLAN' : style.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 flex flex-col gap-5 flex-1">
                  <div>
                    <p
                      className="text-[11px] font-black tracking-widest mb-2 font-syne uppercase"
                      style={{ color: isDark ? (plan.highlight ? T.accent : '#ffffff') : T.primary }}
                    >
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className="text-[40px] font-black leading-none font-syne tracking-tight"
                        style={{ color: isDark ? '#ffffff' : T.textDark }}
                      >
                        {isCustom ? "Let's talk" : (billing === 'annual' && plan.price_annual ? plan.price_annual : plan.price)}
                      </span>
                      {plan.plan_id !== 'free' && !isCustom && (
                        <span className="text-[13px] font-medium" style={{ color: isDark ? T.textLight : T.muted }}>
                          /mo
                        </span>
                      )}
                    </div>

                    {/* Annual total billing indicator */}
                    {billing === 'annual' && plan.price_annual_total && !isCustom && (
                      <p className="text-[11px] font-semibold mb-1" style={{ color: isDark ? T.textLight : T.muted }}>
                        {plan.price_annual_total} — billed annually
                      </p>
                    )}

                    <p className="text-[12.5px] leading-relaxed mt-2" style={{ color: isDark ? T.textLight : T.muted }}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : T.border }} />

                  {/* Feature Checklist */}
                  <div className="flex flex-col gap-3 flex-1">
                    {yes.map((f, j) => {
                      const [label, value] = f.text.includes('|') ? f.text.split('|') : [f.text, null]
                      return (
                        <div key={j} className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: isDark ? T.accent : T.primary }}
                          >
                            <Check size={9} strokeWidth={3.5} style={{ color: isDark ? T.dark : '#ffffff' }} />
                          </div>
                          <span className="text-[12.5px] font-medium" style={{ color: isDark ? '#f8f7ff' : T.text }}>
                            {label}
                            {value && (
                              <span className="font-bold ml-1" style={{ color: isDark ? T.accent : T.primary }}>
                                {value}
                              </span>
                            )}
                          </span>
                        </div>
                      )
                    })}

                    {no.map((f, j) => {
                      const [label] = f.text.includes('|') ? f.text.split('|') : [f.text]
                      return (
                        <div key={j} className="flex items-center gap-2.5 opacity-40">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3eeff',
                              borderColor: isDark ? 'rgba(255,255,255,0.15)' : T.border,
                            }}
                          >
                            <X size={9} strokeWidth={2.5} style={{ color: isDark ? '#ffffff' : T.muted }} />
                          </div>
                          <span className="text-[12.5px]" style={{ color: isDark ? T.textLight : T.muted }}>
                            {label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCta(plan)}
                    disabled={isCurrent || checkoutLoading === plan.plan_id}
                    className="w-full py-3.5 rounded-2xl font-black text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-default cursor-pointer mt-4 shadow-sm"
                    style={{
                      backgroundColor: isCurrent
                        ? (isDark ? T.darkCard : T.primaryLight)
                        : plan.highlight
                          ? T.accent
                          : isCustom
                            ? T.primary
                            : plan.plan_id === 'free'
                              ? T.dark
                              : T.primary,
                      color: isCurrent
                        ? (isDark ? T.accent : T.primary)
                        : plan.highlight
                          ? T.dark
                          : '#ffffff',
                    }}
                  >
                    {checkoutLoading === plan.plan_id ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{isCurrent ? 'Current Plan' : plan.cta_text}</span>
                        {!isCurrent && <ArrowRight size={14} className="stroke-[2.5]" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Social Proof Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {STATS.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 p-6 rounded-2xl border text-center shadow-xs"
                style={{ backgroundColor: T.surface, borderColor: T.border }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{ backgroundColor: T.primaryLight, borderColor: T.border }}
                >
                  <Icon size={20} style={{ color: T.primary }} />
                </div>
                <p className="text-[26px] font-black font-syne tracking-tight" style={{ color: T.textDark }}>
                  {s.value}
                </p>
                <p className="text-[12px] font-bold uppercase tracking-wider font-syne" style={{ color: T.muted }}>
                  {s.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* ── FAQ Section ── */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-[28px] md:text-[34px] font-black text-center mb-8 font-syne" style={{ color: T.textDark }}>
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border overflow-hidden shadow-xs transition-colors"
                style={{
                  borderColor: openFaq === i ? T.primary : T.border,
                  backgroundColor: T.surface,
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[15px] font-bold font-syne" style={{ color: T.textDark }}>{faq.q}</span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-4 border"
                    style={{
                      backgroundColor: openFaq === i ? T.primary : T.primaryLight,
                      borderColor: openFaq === i ? T.primary : T.border,
                    }}
                  >
                    {openFaq === i
                      ? <ChevronUp size={15} style={{ color: '#ffffff' }} />
                      : <ChevronDown size={15} style={{ color: T.primary }} />}
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-1 border-t" style={{ borderColor: T.border }}>
                    <p className="text-[13.5px] leading-relaxed pt-2" style={{ color: T.muted }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA Callout ── */}
        <div
          className="rounded-3xl p-10 md:p-14 text-center shadow-xl relative overflow-hidden border"
          style={{ backgroundColor: T.dark, borderColor: T.borderDark }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'rgba(117,48,251,0.25)',
              pointerEvents: 'none',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-[30px] md:text-[38px] font-black mb-3 font-syne text-white tracking-tight">
              Ready to protect and scale your eBay business?
            </h2>
            <p className="text-[15px] mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: T.textLight }}>
              Join 3,200+ sellers using Riazify to stop fraud, generate Cassini-ranked titles, and lock in real profit margins.
            </p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-black text-[15px] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              style={{ backgroundColor: T.accent, color: T.dark }}
            >
              <span>Start free 14-day trial — no card required</span>
              <ArrowRight size={17} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

      </main>

      <Footer />

    </div>
  )
}
