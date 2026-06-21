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
import Navbar  from '@/components/landing/Navbar'
import Footer  from '@/components/landing/Footer'

const T = {
  bg:       '#f7f9f5',
  surface:  '#ffffff',
  border:   '#e8ede2',
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  muted:    '#8a9e78',
  text:     '#1a2410',
}

interface DBPlan {
  id:                 string
  plan_id:            string
  sort_order:         number
  name:               string
  price:              string
  period:             string
  price_annual:       string | null
  price_annual_total: string | null
  description:        string
  features:           { text: string; included: boolean }[]
  cta_text:           string
  highlight:          boolean
  is_active:          boolean
}

const STATS = [
  { icon: Shield,     value: '12,400+', label: 'Orders Protected' },
  { icon: Users,      value: '3,200+',  label: 'Active Sellers'   },
  { icon: TrendingUp, value: '$2.8M+',  label: 'Fraud Prevented'  },
  { icon: Star,       value: '4.9/5',   label: 'Average Rating'   },
]

const FAQS = [
  { q: 'Can I cancel anytime?',               a: 'Yes — cancel from your billing settings with one click. No penalties, no questions.' },
  { q: 'Is there a free trial?',              a: 'Every paid plan includes a 14-day free trial. No credit card required to start.' },
  { q: 'What payment methods do you accept?', a: 'All major credit/debit cards via LemonSqueezy. Secure payment processing with full fraud protection.' },
  { q: 'Can I switch plans later?',           a: 'Yes — upgrade or downgrade at any time. Changes apply immediately and billing is prorated.' },
  { q: 'Do you offer annual discounts?',      a: 'Yes — annual billing saves you up to 20% compared to monthly.' },
  { q: 'What happens when I hit a limit?',    a: 'You will see a clear prompt to upgrade. Your existing data and orders are never affected.' },
]

const PLAN_STYLE: Record<string, { bg: string; border: string; badge?: string }> = {
  free:    { bg: T.surface, border: T.border                         },
  starter: { bg: T.surface, border: 'rgba(143,255,0,0.35)'          },
  growth:  { bg: T.dark,    border: T.lime,   badge: 'MOST POPULAR' },
  custom:  { bg: '#0f172a', border: '#6366f1', badge: 'ENTERPRISE'  },
}

export default function PricingPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [plans,       setPlans]       = useState<DBPlan[]>([])
  const [loaded,      setLoaded]      = useState(false)
  const [billing,     setBilling]     = useState<'monthly' | 'annual'>('monthly')
  const [openFaq,     setOpenFaq]     = useState<number | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)

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
        const checkout  = urlParams.get('checkout')
        if (checkout && user) {
          const [, billingCycle] = checkout.split('_')
          if (billingCycle) setBilling(billingCycle as 'monthly' | 'annual')
        }
      } catch {}
      setLoaded(true)
    }
    load()
  }, [])

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  async function handleCta(plan: DBPlan) {
    if (plan.plan_id === 'custom')    { router.push('/contact'); return }
    if (currentPlan === plan.plan_id) return
    if (plan.plan_id === 'free')      { router.push('/auth/signup'); return }

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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          plan:      plan.plan_id,
          billing,
          userId:    user.id,
          userEmail: user.email,
          userName:  (profile as any)?.full_name ?? '',
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
           style={{ borderTopColor: T.lime }} />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: T.bg }}>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[11px] font-black tracking-wider"
               style={{ backgroundColor: T.limeTint, color: T.limeDeep, border: `1px solid ${T.lime}40` }}>
            <Zap size={11} /> NO CONTRACTS. CANCEL ANYTIME.
          </div>
          <h1 className="text-[44px] lg:text-[64px] font-black leading-tight mb-4"
              style={{ color: T.dark }}>
            Simple pricing for<br />
            <span style={{ color: T.limeDeep }}>serious eBay sellers</span>
          </h1>
          <p className="text-[17px] max-w-xl mx-auto" style={{ color: T.muted }}>
            Every plan includes order protection, title builder, and profit calculator.
            Upgrade when you need more power.
          </p>
        </div>

        {/* ── Billing Toggle ── */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="text-[13px] font-bold" style={{ color: billing === 'monthly' ? T.dark : T.muted }}>
            Monthly
          </span>
          <button onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-14 h-7 rounded-full transition-all"
            style={{ backgroundColor: billing === 'annual' ? T.dark : T.border }}>
            <div style={{
              position:        'absolute',
              top:             3,
              left:            3,
              width:           22,
              height:          22,
              borderRadius:    '50%',
              backgroundColor: billing === 'annual' ? T.lime : T.surface,
              transform:       billing === 'annual' ? 'translateX(28px)' : 'translateX(0)',
              transition:      'transform 0.2s ease',
            }} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold" style={{ color: billing === 'annual' ? T.dark : T.muted }}>
              Annual
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: T.limeTint, color: T.limeDeep }}>
              SAVE UP TO 20%
            </span>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {plans.map((plan) => {
            const style    = PLAN_STYLE[plan.plan_id] ?? PLAN_STYLE.free
            const isDark   = plan.plan_id === 'growth' || plan.plan_id === 'custom'
            const isCustom = plan.plan_id === 'custom'
            const isCurrent = currentPlan === plan.plan_id
            const yes      = plan.features.filter(f => f.included)
            const no       = plan.features.filter(f => !f.included)
            return (
              <div key={plan.id}
                className="rounded-3xl flex flex-col relative overflow-hidden"
                style={{
                  backgroundColor: style.bg,
                  border: `${isCurrent || plan.highlight ? 2 : 1}px solid ${isCurrent ? T.lime : style.border}`,
                  boxShadow: plan.highlight ? '0 20px 60px rgba(143,255,0,0.15)' :
                             isCustom ? '0 20px 60px rgba(99,102,241,0.15)' : 'none',
                }}>

                {(style.badge || isCurrent) && (
                  <div className="px-5 pt-5">
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: isCurrent ? T.lime : isCustom ? '#6366f1' : T.lime,
                            color:           isCurrent ? T.dark : isCustom ? '#fff'    : T.dark,
                          }}>
                      {isCurrent ? 'CURRENT PLAN' : style.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 flex flex-col gap-5 flex-1">
                  <div>
                    <p className="text-[11px] font-black tracking-widest mb-2"
                       style={{ color: isDark ? (isCustom ? '#6366f1' : T.lime) : T.muted }}>
                      {plan.name.toUpperCase()}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-[42px] font-black leading-none"
                            style={{ color: isDark ? '#fff' : T.limeDeep }}>
                        {isCustom ? "Let's talk" : (billing === 'annual' && plan.price_annual ? plan.price_annual : plan.price)}
                      </span>
                      {plan.plan_id !== 'free' && !isCustom && (
                        <span className="text-[13px]" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : T.muted }}>
                          /mo
                        </span>
                      )}
                    </div>
                    {/* Annual total note */}
                    {billing === 'annual' && plan.price_annual_total && !isCustom && (
                      <p className="text-[11px] font-semibold mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : T.muted }}>
                        {plan.price_annual_total} — billed annually
                      </p>
                    )}
                    <p className="text-[12px]" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : T.muted }}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : T.border }} />

                  <div className="flex flex-col gap-2.5 flex-1">
                    {yes.map((f, j) => {
                      const [label, value] = f.text.includes('|') ? f.text.split('|') : [f.text, null]
                      return (
                        <div key={j} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                               style={{ backgroundColor: T.lime }}>
                            <Check size={8} strokeWidth={3} style={{ color: T.dark }} />
                          </div>
                          <span className="text-[12.5px] font-semibold"
                                style={{ color: isDark ? '#e2e8f0' : T.text }}>
                            {label}
                            {value && (
                              <span className="font-black ml-1"
                                    style={{ color: isDark ? T.lime : T.limeDeep }}>
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
                        <div key={j} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                               style={{
                                 backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f0',
                                 border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#dde8d8'}`,
                               }}>
                            <X size={8} strokeWidth={2.5} style={{ color: '#e53e3e' }} />
                          </div>
                          <span className="text-[12.5px]"
                                style={{ color: isDark ? 'rgba(255,255,255,0.25)' : '#7a8c70' }}>{label}</span>
                        </div>
                      )
                    })}
                  </div>

                  <button onClick={() => handleCta(plan)}
                    disabled={isCurrent || checkoutLoading === plan.plan_id}
                    className="w-full py-3.5 rounded-2xl font-black text-[13px] transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-default mt-2"
                    style={{
                      backgroundColor: isCurrent      ? T.limeTint :
                                       plan.highlight ? T.lime     :
                                       isCustom       ? '#6366f1'  :
                                       plan.plan_id === 'free' ? T.dark : T.limeTint,
                      color:           isCurrent      ? T.limeDeep :
                                       plan.highlight ? T.dark     :
                                       isCustom       ? '#fff'     :
                                       plan.plan_id === 'free' ? T.lime : T.limeDeep,
                    }}>
                    {checkoutLoading === plan.plan_id ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                             style={{ borderTopColor: plan.highlight ? T.dark : T.limeDeep }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        {isCurrent ? 'Current Plan' : plan.cta_text}
                        {!isCurrent && <ArrowRight size={14} />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Social proof */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {STATS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex flex-col items-center gap-2 p-5 rounded-2xl border text-center"
                   style={{ backgroundColor: T.surface, borderColor: T.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: T.limeTint }}>
                  <Icon size={18} style={{ color: T.limeDeep }} />
                </div>
                <p className="text-[26px] font-black" style={{ color: T.dark }}>
                  {s.value}
                </p>
                <p className="text-[12px]" style={{ color: T.muted }}>{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-[28px] font-black text-center mb-8"
              style={{ color: T.dark }}>
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden"
                   style={{ borderColor: T.border, backgroundColor: T.surface }}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-[14px] font-bold" style={{ color: T.dark }}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp   size={16} style={{ color: T.muted, flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: T.muted, flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t" style={{ borderColor: T.border }}>
                    <p className="text-[13px] pt-3" style={{ color: T.muted }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl p-10 text-center" style={{ backgroundColor: T.dark }}>
          <h2 className="text-[32px] font-black mb-3"
              style={{ color: '#fff' }}>
            Ready to protect your eBay business?
          </h2>
          <p className="text-[15px] mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Join 3,200+ sellers using Riazify to protect orders and grow profits.
          </p>
          <button onClick={() => router.push('/auth/signup')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[15px] hover:opacity-90"
            style={{ backgroundColor: T.lime, color: T.dark }}>
            Start for free — no card required <ArrowRight size={16} />
          </button>
        </div>

      </main>

      <Footer />

    </div>
  )
}