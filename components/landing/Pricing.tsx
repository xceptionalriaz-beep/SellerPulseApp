'use client'
// components/landing/Pricing.tsx
// Landing page pricing section â€” shows plan cards
// Full pricing page is at /pricing

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, ArrowRight } from 'lucide-react'

const T = {
  surface:      '#ffffff',
  bg:           '#f7f9f5',
  border:       '#e8ede2',
  accentBorder: 'rgba(143,255,0,0.35)',
  lime:         '#8fff00',
  limeDeep:     '#4a8f00',
  limeTint:     '#f4ffe6',
  dark:         '#0a0d08',
  muted:        '#8a9e78',
  text:         '#1a2410',
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

const PLAN_STYLE: Record<string, { bg: string; border: string; badge?: string }> = {
  free:    { bg: T.surface, border: T.border                         },
  starter: { bg: T.surface, border: T.accentBorder                  },
  growth:  { bg: T.dark,    border: T.lime,   badge: 'MOST POPULAR' },
  custom:  { bg: '#0f172a', border: '#6366f1', badge: 'ENTERPRISE'  },
}

export default function Pricing() {
  const router = useRouter()
  const [plans,  setPlans]  = useState<DBPlan[]>([])
  const [loaded, setLoaded] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await sb
          .from('landing_pricing')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (data && data.length > 0) setPlans(data as DBPlan[])
      } catch {}
      setLoaded(true)
    }
    load()
  }, [])

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  async function handleCta(plan: DBPlan) {
    if (plan.plan_id === 'custom') { router.push('/contact'); return }
    if (plan.plan_id === 'free')   { router.push('/auth/signup'); return }

    const { createClient: createSb } = await import('@supabase/supabase-js')
    const sb = createSb(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await sb.auth.getUser()

    if (!user) {
      router.push(`/auth/signup?plan=${plan.plan_id}&billing=${billing}`)
      return
    }

    setCheckoutLoading(plan.plan_id)
    try {
      const { data: profile } = await sb
        .from('profiles')
        .select('full_name')
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

  if (!loaded) return null

  return (
    <section id="pricing" className="py-24" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4">
            <span style={{ color: T.limeDeep }}>Simple Pricing.</span><br />
            <span style={{ color: T.dark }}>No Surprises.</span>
          </h2>
          <p className="text-[17px]" style={{ color: T.muted }}>
            Cancel anytime. No lock-in. No fine print.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="text-[13px] font-bold" style={{ color: billing === 'monthly' ? T.dark : T.muted }}>
            Monthly
          </span>
          <button onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-14 h-7 rounded-full transition-all"
            style={{ backgroundColor: billing === 'annual' ? T.dark : T.border }}>
            <div style={{
              position:        'absolute',
              top:             3, left: 3,
              width:           22, height: 22,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const style    = PLAN_STYLE[plan.plan_id] ?? PLAN_STYLE.free
            const isDark   = plan.plan_id === 'growth' || plan.plan_id === 'custom'
            const isCustom = plan.plan_id === 'custom'
            const yes      = plan.features.filter(f => f.included)
            const no       = plan.features.filter(f => !f.included)
            return (
              <div key={plan.id}
                className="rounded-3xl flex flex-col relative overflow-hidden"
                style={{
                  backgroundColor: style.bg,
                  border: `${plan.highlight ? 2 : 1}px solid ${style.border}`,
                  boxShadow: plan.highlight ? '0 20px 60px rgba(143,255,0,0.15)' :
                             isCustom ? '0 20px 60px rgba(99,102,241,0.15)' : 'none',
                }}>

                {style.badge && (
                  <div className="px-5 pt-5">
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: isCustom ? '#6366f1' : T.lime,
                            color:           isCustom ? '#fff'    : T.dark,
                          }}>
                      {style.badge}
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
                    {billing === 'annual' && plan.price_annual_total && !isCustom && (
                      <p className="text-[11px] font-semibold mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : T.muted }}>
                        {plan.price_annual_total} â€” billed annually
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
                    disabled={checkoutLoading === plan.plan_id}
                    className="w-full py-3.5 rounded-2xl font-black text-[13px] transition-all hover:opacity-90 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                    style={{
                      backgroundColor: plan.highlight ? T.lime     :
                                       isCustom       ? '#6366f1'  :
                                       plan.plan_id === 'free' ? T.dark : T.limeTint,
                      color:           plan.highlight ? T.dark     :
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
                      <>{plan.cta_text} <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom note + link to full pricing page */}
        <div className="flex flex-col items-center gap-3 mt-10">
          <p className="text-[13px]" style={{ color: T.muted }}>
            All paid plans include a <strong>14-day free trial</strong>. No credit card required to start.
          </p>
          <button onClick={() => router.push('/pricing')}
            className="text-[13px] font-bold hover:opacity-70 flex items-center gap-1"
            style={{ color: T.limeDeep }}>
            See full pricing details <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </section>
  )
}
