'use client'
// components/landing/Pricing.tsx
// ─────────────────────────────────────────────
// Standalone Pricing section for landing page
// To update: just edit this file
// ─────────────────────────────────────────────

import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

// ── Brand tokens (same as landing page) ───────
const T = {
  white:        '#ffffff',
  surface:      '#f7f9f5',
  border:       '#e8ede2',
  accentBorder: 'rgba(143,255,0,0.35)',
  lime:         '#8fff00',
  limeDeep:     '#4a8f00',
  limeMid:      '#6bcc00',
  limeTint:     '#f4ffe6',
  carbon:       '#1a2410',
  sage:         '#8a9e78',
  black:        '#0a0d08',
}

// ── Pricing ────────────────────────────────────────────────────
export default function Pricing() {
  const router = useRouter()

  const plans = [
    {
      name:      'Free',
      price:     '$0',
      period:    'forever',
      desc:      'Try Riazify with no commitment.',
      highlight: false,
      cta:       'Get Started Free',
      ctaAction: () => router.push('/auth/signup'),
      yes: [
        '30 orders/month',
        '5 VeRO checks/month',
        '3 Title Builder/day',
        'Profit Calculator',
        'Basic risk scoring',
        'Email support',
      ],
      no: [
        'Buyer profiling',
        'Evidence PDF',
        'CSV export',
        'Auto sync',
        'Analytics',
        'Team seats',
      ],
    },
    {
      name:      'Starter',
      price:     '$19',
      period:    '/month',
      desc:      'For eBay sellers getting serious.',
      highlight: false,
      cta:       'Start Starter →',
      ctaAction: () => router.push('/auth/signup?plan=starter'),
      yes: [
        '200 orders/month',
        '50 VeRO checks/month',
        '20 Title Builder/day',
        'Profit Calculator',
        'Full risk scoring',
        'Buyer profiling (basic)',
        'CSV export',
        'Auto sync (30 min)',
        'Basic analytics',
        '2 team seats',
        'Email support (48h)',
      ],
      no: [
        'Evidence PDF',
        'PDF export',
        'Advanced analytics',
        'API access',
      ],
    },
    {
      name:      'Growth',
      price:     '$49',
      period:    '/month',
      desc:      'For scaling eBay operators.',
      highlight: true,
      cta:       'Start Growth Free →',
      ctaAction: () => router.push('/auth/signup?plan=growth'),
      yes: [
        '1,000 orders/month',
        'Unlimited VeRO checks',
        'Unlimited Title Builder',
        'Profit Calculator',
        'Full risk scoring',
        'Buyer profiling (advanced)',
        'Evidence PDF (full 6-page)',
        'CSV + PDF export',
        'Auto sync (5 min)',
        'Full analytics',
        '5 team seats',
        'Priority support (24h)',
      ],
      no: [
        'API access',
        'Custom integrations',
        'Unlimited seats',
      ],
    },
    {
      name:      'Custom',
      price:     'Let\'s talk',
      period:    '',
      desc:      'For agencies and enterprise sellers.',
      highlight: false,
      cta:       'Contact Sales →',
      ctaAction: () => router.push('/contact'),
      yes: [
        'Unlimited orders',
        'Unlimited VeRO checks',
        'Unlimited Title Builder',
        'Profit Calculator',
        'Full risk scoring',
        'Buyer profiling (advanced)',
        'Evidence PDF (full 6-page)',
        'CSV + PDF export',
        'Real-time auto sync',
        'Full analytics',
        'Unlimited team seats',
        'API access',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
      ],
      no: [],
    },
  ]

  return (
    <section id="pricing" className="py-24" style={{ background: T.surface }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4">
            <span style={{ color: T.limeDeep }}>Simple Pricing.</span>
            <br/>
            <span style={{ color: T.carbon }}>No Surprises.</span>
          </h2>
          <p className="text-[17px]" style={{ color: T.sage }}>
            Cancel anytime. No lock-in. No fine print.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <div key={i}
              className="rounded-3xl border p-7 flex flex-col gap-5 relative overflow-hidden"
              style={{
                background:   plan.highlight ? T.carbon : T.white,
                borderColor:  plan.highlight ? T.lime   : T.border,
                boxShadow:    plan.highlight ? '0 20px 60px rgba(143,255,0,0.15)' : 'none',
              }}>

              {/* Most popular badge */}
              {plan.highlight && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black"
                     style={{ background: T.lime, color: T.black }}>
                  MOST POPULAR
                </div>
              )}

              {/* Plan name + price */}
              <div>
                <p className="text-[12px] font-black tracking-widest mb-2"
                   style={{ color: plan.highlight ? T.lime : T.sage }}>
                  {plan.name.toUpperCase()}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[36px] font-black leading-none"
                        style={{ color: plan.highlight ? T.white : T.limeDeep }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-[13px]" style={{ color: T.sage }}>{plan.period}</span>
                  )}
                </div>
                <p className="text-[12px]" style={{ color: plan.highlight ? '#94a3b8' : T.sage }}>
                  {plan.desc}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px" style={{ backgroundColor: plan.highlight ? 'rgba(255,255,255,0.1)' : T.border }} />

              {/* Features */}
              <div className="flex flex-col gap-2.5 flex-1">
                {plan.yes.map((f, j) => (
                  <div key={j} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                         style={{ background: '#8fff00' }}>
                      <Check size={11} strokeWidth={3} style={{ color: '#0a0d08' }} />
                    </div>
                    <span className="text-[12.5px] font-semibold"
                          style={{ color: plan.highlight ? '#e2e8f0' : T.carbon }}>{f}</span>
                  </div>
                ))}
                {plan.no.map((f, j) => (
                  <div key={j} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                         style={{ background: plan.highlight ? 'rgba(255,255,255,0.06)' : '#f1f5f0',
                                  border: `1.5px solid ${plan.highlight ? 'rgba(255,255,255,0.1)' : '#dde8d8'}` }}>
                      <X size={10} strokeWidth={2.5} style={{ color: '#e53e3e' }} />
                    </div>
                    <span className="text-[12.5px]"
                          style={{ color: plan.highlight ? '#8899aa' : '#7a8c70' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <button onClick={plan.ctaAction}
                className="w-full py-3.5 rounded-xl font-black text-[13px] transition-all hover:scale-105 mt-2"
                style={{
                  background:  plan.highlight ? T.lime    : plan.name === 'Custom' ? T.carbon : T.limeTint,
                  color:       plan.highlight ? T.black   : plan.name === 'Custom' ? T.white  : T.limeDeep,
                  border:      plan.highlight ? 'none'    : plan.name === 'Custom' ? 'none'   : `1px solid ${T.accentBorder}`,
                }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-[13px] mt-10" style={{ color: T.sage }}>
          All paid plans include a <strong>14-day free trial</strong>. No credit card required to start.
        </p>

      </div>
    </section>
  )
}