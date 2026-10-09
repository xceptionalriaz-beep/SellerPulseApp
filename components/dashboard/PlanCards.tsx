'use client'
// components/dashboard/PlanCards.tsx
// Reusable plan cards â€” used in BillingTab
// Reads from landing_pricing table, highlights current plan

import { useEffect, useState } from 'react'
import { Check, X, ArrowRight, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const T = {
  surface:      '#ffffff',
  bg:           '#f9fdf4',
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
  free:    { bg: T.surface, border: T.border                          },
  starter: { bg: T.surface, border: T.accentBorder                   },
  growth:  { bg: T.dark,    border: T.lime,    badge: 'MOST POPULAR' },
  custom:  { bg: '#0f172a', border: '#6366f1', badge: 'ENTERPRISE'   },
}

interface Props {
  currentPlan: string
  isAnnual:    boolean
  onBillingToggle: () => void
}

export default function PlanCards({ currentPlan, isAnnual, onBillingToggle }: Props) {
  const supabase = createClient()

  const [plans,           setPlans]           = useState<DBPlan[]>([])
  const [loaded,          setLoaded]          = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [hoveredPlan,     setHoveredPlan]     = useState<string | null>(null)

  useEffect(() => { loadPlans() }, [])

  async function loadPlans() {
    try {
      const { data } = await (supabase.from('landing_pricing') as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (data) setPlans(data as DBPlan[])
    } catch (e) { console.error('[PlanCards] Load error:', e) }
    setLoaded(true)
  }

  async function handleCta(plan: DBPlan) {
    // Current plan â€” do nothing
    if (currentPlan?.toLowerCase() === plan.plan_id) return
    // Custom â€” contact sales
    if (plan.plan_id === 'custom') { window.open('/contact', '_blank'); return }
    // Free â€” no action needed from billing tab
    if (plan.plan_id === 'free') return

    setCheckoutLoading(plan.plan_id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/payments/checkout', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan:      plan.plan_id,
          billing:   isAnnual ? 'annual' : 'monthly',
          userId:    session.user.id,
          userEmail: session.user.email,
          userName:  session.user.user_metadata?.full_name ?? '',
        }),
      })

      const data = await res.json()
      if (data.url) {
        const w    = 520, h = 680
        const left = Math.round((window.screen.width  - w) / 2)
        const top  = Math.round((window.screen.height - h) / 2)
        window.open(data.url, 'ls_checkout', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`)
      } else console.error('[PlanCards] No checkout URL:', data.error)
    } catch (e) { console.error('[PlanCards] Checkout error:', e) }
    setCheckoutLoading(null)
  }

  if (!loaded) return (
    <div className="flex items-center justify-center py-10">
      <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: T.lime }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @keyframes plansFadeUp {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .plans-animate {
          animation: plansFadeUp 0.4s ease both;
        }
      `}</style>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 plans-animate" style={{ animationDelay: '0ms' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: !isAnnual ? T.dark : T.muted }}>
          Monthly
        </span>
        <button
          onClick={onBillingToggle}
          className="relative w-12 h-6 rounded-full transition-all"
          style={{ backgroundColor: isAnnual ? T.dark : T.border }}
        >
          <div style={{
            position:        'absolute',
            top:             2, left: 2,
            width:           20, height: 20,
            borderRadius:    '50%',
            backgroundColor: isAnnual ? T.lime : T.surface,
            transform:       isAnnual ? 'translateX(24px)' : 'translateX(0)',
            transition:      'transform 0.2s ease',
          }} />
        </button>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: isAnnual ? T.dark : T.muted }}>
          Annual
        </span>
        {isAnnual && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-black"
            style={{ backgroundColor: T.limeTint, color: T.limeDeep }}
          >
            SAVE UP TO 20%
          </span>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan, index) => {
          const style     = PLAN_STYLE[plan.plan_id] ?? PLAN_STYLE.free
          const isDark    = plan.plan_id === 'growth' || plan.plan_id === 'custom'
          const isCustom  = plan.plan_id === 'custom'
          const isCurrent = currentPlan?.toLowerCase() === plan.plan_id
          const yes       = plan.features.filter(f => f.included)
          const no        = plan.features.filter(f => !f.included)

          const isHovered = hoveredPlan === plan.plan_id

          return (
            <div
              key={plan.id}
              className="plans-animate rounded-2xl flex flex-col relative overflow-hidden"
              onMouseEnter={() => setHoveredPlan(plan.plan_id)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                animationDelay: `${index * 80}ms`,
                backgroundColor: style.bg,
                border: `${isCurrent || plan.highlight ? 2 : 1}px solid ${
                  isCurrent && isHovered ? T.lime :
                  isCurrent ? T.lime :
                  isHovered && !isDark ? 'rgba(143,255,0,0.4)' :
                  style.border
                }`,
                boxShadow: isCurrent && isHovered ? `0 12px 32px rgba(143,255,0,0.2)` :
                           isCurrent      ? `0 8px 24px rgba(143,255,0,0.12)` :
                           plan.highlight ? '0 8px 24px rgba(143,255,0,0.1)'  :
                           isCustom       ? '0 8px 24px rgba(99,102,241,0.1)' : 'none',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
                cursor: isCurrent ? 'default' : 'pointer',
              }}
            >
            {/* Hover shimmer for current plan */}
            {isCurrent && isHovered && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(143,255,0,0.04) 0%, transparent 60%)',
                  borderRadius: 'inherit',
                }}
              />
            )}
              {/* Badge */}
              {(style.badge || isCurrent) && (
                <div className="px-4 pt-4">
                  <span
                    className="inline-flex items-center gap-1.5 font-black rounded-full"
                    style={{
                      backgroundColor: isCurrent ? T.lime    : isCustom ? '#6366f1' : T.lime,
                      color:           isCurrent ? T.dark    : isCustom ? '#fff'    : T.dark,
                      fontSize:        isCurrent ? 11        : 9,
                      padding:         isCurrent ? '4px 12px': '2px 8px',
                      boxShadow:       isCurrent ? `0 0 12px rgba(143,255,0,0.5)` : 'none',
                      letterSpacing:   '0.06em',
                    }}
                  >
                    {isCurrent && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: T.dark, display: 'inline-block', flexShrink: 0 }} />
                    )}
                    {isCurrent ? 'YOUR PLAN' : style.badge}
                  </span>
                </div>
              )}

              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Plan name + price */}
                <div>
                  <p
                    className="text-[10px] font-black tracking-widest mb-1.5"
                    style={{ color: isDark ? (isCustom ? '#6366f1' : T.lime) : T.muted }}
                  >
                    {plan.name.toUpperCase()}
                  </p>
                  <div className="flex items-baseline gap-1 mb-0.5">
                    <span
                      className="font-black leading-none"
                      style={{
                        fontSize: isCustom ? 22 : 32,
                        color: isDark ? '#fff' : T.limeDeep,
                      }}
                    >
                      {isCustom ? "Let's talk" : (isAnnual && plan.price_annual ? plan.price_annual : plan.price)}
                    </span>
                    {plan.plan_id !== 'free' && !isCustom && (
                      <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.5)' : T.muted }}>/mo</span>
                    )}
                  </div>
                  {isAnnual && plan.price_annual_total && !isCustom && (
                    <p style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.4)' : T.muted }}>
                      {plan.price_annual_total} billed annually
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : T.muted, marginTop: 2 }}>
                    {plan.description}
                  </p>
                </div>

                <div style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : T.border }} />

                {/* Features */}
                <div className="flex flex-col gap-2 flex-1">
                  {yes.map((f, j) => {
                    const [label, value] = f.text.includes('|') ? f.text.split('|') : [f.text, null]
                    return (
                      <div key={j} className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: T.lime }}
                        >
                          <Check size={7} strokeWidth={3} style={{ color: T.dark }} />
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 500, color: isDark ? '#e2e8f0' : T.text }}>
                          {label}
                          {value && (
                            <span style={{ fontWeight: 800, marginLeft: 4, color: isDark ? T.lime : T.limeDeep }}>
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
                      <div key={j} className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f0',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#dde8d8'}`,
                          }}
                        >
                          <X size={7} strokeWidth={2.5} style={{ color: '#e53e3e' }} />
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: isDark ? 'rgba(255,255,255,0.25)' : '#7a8c70' }}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Hover tooltip â€” current plan only */}
                {isCurrent && isHovered && (
                  <div
                    className="rounded-xl px-3 py-2 flex items-center gap-2"
                    style={{ backgroundColor: 'rgba(143,255,0,0.08)', border: '1px solid rgba(143,255,0,0.2)' }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: T.lime, flexShrink: 0, boxShadow: `0 0 6px ${T.lime}` }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: T.limeDeep }}>
                      Active â€” renewing automatically
                    </span>
                  </div>
                )}

                {/* CTA button */}
                <button
                  onClick={() => handleCta(plan)}
                  disabled={isCurrent || checkoutLoading === plan.plan_id}
                  className="w-full py-2.5 rounded-xl font-black text-[12px] flex items-center justify-center gap-1.5 disabled:cursor-default mt-1 overflow-hidden relative"
                  style={{
                    backgroundColor: isCurrent      ? T.limeTint  :
                                     plan.highlight ? T.lime      :
                                     isCustom       ? '#6366f1'   :
                                     plan.plan_id === 'free' ? T.dark : T.limeTint,
                    color:           isCurrent      ? T.limeDeep  :
                                     plan.highlight ? T.dark      :
                                     isCustom       ? '#fff'      :
                                     plan.plan_id === 'free' ? T.lime : T.limeDeep,
                    opacity:         isCurrent ? 0.8 : 1,
                    transform:       !isCurrent && isHovered ? 'scale(1.02)' : 'scale(1)',
                    transition:      'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
                    boxShadow:       !isCurrent && isHovered
                                       ? plan.highlight ? '0 6px 20px rgba(143,255,0,0.4)'
                                         : isCustom     ? '0 6px 20px rgba(99,102,241,0.4)'
                                         : '0 4px 12px rgba(143,255,0,0.2)'
                                       : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent) {
                      const btn = e.currentTarget
                      const shine = document.createElement('span')
                      shine.style.cssText = `
                        position:absolute; top:0; left:-100%; width:60%; height:100%;
                        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);
                        transform:skewX(-20deg); animation:btnShine 0.5s ease forwards;
                        pointer-events:none;
                      `
                      shine.id = 'btn-shine'
                      btn.appendChild(shine)
                      setTimeout(() => shine.remove(), 500)
                    }
                  }}
                >
                  <style>{`@keyframes btnShine { 0%{left:-100%} 100%{left:150%} }`}</style>
                  {checkoutLoading === plan.plan_id ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <>
                      {isCurrent ? 'Current Plan' : plan.cta_text}
                      {!isCurrent && (
                        <ArrowRight
                          size={12}
                          style={{
                            transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                            transition: 'transform 0.15s ease',
                          }}
                        />
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
