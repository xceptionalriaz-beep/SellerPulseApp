'use client'
// app/features/page.tsx
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import TypewriterText from '@/components/ui/TypewriterText'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import {
  Search, Type, Calculator, Shield, Radar, Package,
  ArrowRight, Check, Lock, Zap, ChevronRight,
  TrendingUp, AlertTriangle, BarChart2,
  Globe, ShieldCheck, Eye, Plus, Minus
} from 'lucide-react'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
  surface:  '#ffffff',
  text:     '#1a2410',
}

const FEATURES = [
  {
    id:       'title-builder',
    icon:     Type,
    label:    'Title Builder',
    headline: 'Cassini-optimized titles that rank',
    sub:      "eBay's Cassini algorithm rewards keyword-rich, structured titles. Our AI analyzes top-performing listings and builds titles that maximize organic impressions and CTR — in under 3 seconds.",
    bullets:  ['Cassini keyword density scoring', 'Character limit optimization', 'Category-specific title patterns', 'A/B title variant suggestions'],
    badge:    'AI Powered',
    color:    '#6366f1',
  },
  {
    id:       'profit-calculator',
    icon:     Calculator,
    label:    'Profit Calculator',
    headline: 'Exact margins before you list',
    sub:      'Maps every eBay final value fee, PayPal/payment processing cut, shipping weight variance, VAT obligation and cost of goods — so you know your exact profit before committing to a listing.',
    bullets:  ['Real-time FVF calculation', 'VAT variance by country', 'Shipping weight & zone mapping', 'Multi-currency support'],
    badge:    'Real-time',
    color:    '#f59e0b',
  },
  {
    id:       'product-research',
    icon:     Search,
    label:    'Product Research',
    headline: 'Demand velocity before you buy',
    sub:      'See real sell-through rates, competition density and estimated monthly revenue for any product. Know what sells before you invest in inventory.',
    bullets:  ['Sell-through rate analysis', 'Competition density index', 'Estimated monthly revenue', 'Trending product alerts'],
    badge:    'Coming Soon',
    color:    '#8b5cf6',
  },
  {
    id:       'orders-protection',
    icon:     Shield,
    label:    'Orders Protection',
    headline: 'VeRO risk & fraud mitigation',
    sub:      'AI flags high-risk orders before you ship — identifying VeRO violations, malicious buyer patterns and chargeback risk signals so you never lose money on a bad transaction.',
    bullets:  ['Buyer risk scoring', 'VeRO violation detection', 'Chargeback pattern recognition', 'Real-time order alerts'],
    badge:    'Live',
    color:    '#ef4444',
  },
  {
    id:       'competitor-research',
    icon:     Radar,
    label:    'Competitor Research',
    headline: 'Seller intelligence extraction',
    sub:      "Analyse any seller's complete strategy — their top products, pricing model, title patterns and estimated monthly volume. Learn from the best and find the gaps they're missing.",
    bullets:  ['Full seller profile analysis', 'Top product identification', 'Pricing strategy patterns', 'Market gap detection'],
    badge:    'Coming Soon',
    color:    '#06b6d4',
  },
  {
    id:       'inventory-manager',
    icon:     Package,
    label:    'Inventory Manager',
    headline: 'Stock velocity monitoring',
    sub:      'Track inventory levels across all your listings, get low-stock alerts before you run out, and see which products are moving fastest so you can reorder at the right time.',
    bullets:  ['Real-time stock tracking', 'Low stock alerts', 'Velocity-based reorder suggestions', 'Multi-listing sync'],
    badge:    'Coming Soon',
    color:    '#10b981',
  },
]

const STATS = [
  { value: 135, suffix: 'M', label: 'eBay active buyers',         desc: 'Marketplace your listings reach'  },
  { value: 50,  suffix: 'K+',label: 'Protected orders',           desc: 'Fraud attempts blocked'           },
  { value: 3,   suffix: 's', label: 'Title generation',           desc: 'Average AI response time'         },
  { value: 94,  suffix: '%', label: 'Cassini score improvement',  desc: 'Average across all users'         },
]

const TRUST = [
  { icon: ShieldCheck, label: 'Official eBay API',      desc: 'OAuth 2.0 certified integration — no scraping' },
  { icon: Lock,        label: 'Your data stays yours',  desc: 'Listings and metrics never shared with other sellers' },
  { icon: Eye,         label: 'No data exposure',       desc: 'Proprietary sourcing channels fully protected' },
  { icon: Globe,       label: 'GDPR compliant',         desc: 'EU & UK data regulations fully respected' },
]

function FadeCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `0.5px solid ${open ? '#8fff00' : '#e8ede2'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
      <button onClick={() => setOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2410', margin: 0 }}>{q}</p>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: open ? '#f4ffe6' : '#f7f9f5', border: `0.5px solid ${open ? '#8fff00' : '#e8ede2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
          {open ? <Minus size={13} style={{ color: '#4a8f00' }}/> : <Plus size={13} style={{ color: '#8a9e78' }}/>}
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px' }}>
          <p style={{ fontSize: 14, color: '#8a9e78', margin: 0, lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FeaturesPage() {
  const [beforeAfter, setBeforeAfter]   = useState<'before' | 'after'>('before')
  const [sandboxInput, setSandboxInput] = useState('')
  const [sandboxEmail, setSandboxEmail] = useState('')
  const [sandboxDone, setSandboxDone]   = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 80 }}>

        {/* ── 1. HERO ── */}
        <div style={{ backgroundColor: C.dark, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(143,255,0,0.04)', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(143,255,0,0.03)', pointerEvents: 'none' }}/>
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center" style={{ position: 'relative', zIndex: 1 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                 style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.lime }}/>
              <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>BUILT FOR SERIOUS EBAY SELLERS</span>
            </div>
            <h1 className="text-[32px] md:text-[62px] font-black leading-tight mb-6" style={{ color: '#fff' }}>
              <TypewriterText
                text="Everything you need to sell smarter on eBay"
                speed={35}
                delay={300}
                cursor={true}
                style={{ color: '#fff' }}
              />
            </h1>
            <p className="text-[17px] leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Cassini-optimized titles. Real-time profit margins. VeRO risk detection. Six intelligent tools built specifically for high-volume eBay sellers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/auth/signup"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[14px] hover:opacity-90 transition-all"
                    style={{ backgroundColor: C.lime, color: C.dark }}>
                Start free trial <ArrowRight size={16}/>
              </Link>
              <Link href="/pricing"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[14px] border hover:opacity-80 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                See pricing
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. SANDBOX ── */}
        <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                 style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}` }}>
              <Zap size={11} style={{ color: C.limeDeep }}/>
              <span className="text-[11px] font-black tracking-wider" style={{ color: C.limeDeep }}>LIVE ANALYSIS — COMING SOON</span>
            </div>
            <h2 className="text-[28px] font-black mb-3" style={{ color: C.text }}>Try it before you sign up</h2>
            <p className="text-[14px] mb-8" style={{ color: C.muted }}>Enter any eBay keyword and see Riazify's intelligence in action. Join the waitlist to be first when it goes live.</p>

            {!sandboxDone ? (
              <div style={{ background: C.bg, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="e.g. Dog Grooming Brush, iPhone 14 case..."
                    value={sandboxInput}
                    onChange={e => setSandboxInput(e.target.value)}
                    style={{ flex: 1, height: 48, padding: '0 16px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, outline: 'none', fontFamily: 'Inter, sans-serif', background: C.surface }}
                  />
                  <button
                    onClick={() => {}}
                    style={{ height: 48, padding: '0 20px', borderRadius: 10, background: C.dark, color: C.lime, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'not-allowed', opacity: 0.6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Analyze <ArrowRight size={14}/>
                  </button>
                </div>

                {/* Preview output — clearly labeled as example */}
                <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: C.dark, borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.lime }}>EXAMPLE OUTPUT — Preview only</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Real data available after signup</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    {[
                      { label: 'Cassini Score',      value: '94/100',  color: C.limeDeep },
                      { label: 'Est. Monthly Vol',   value: '$12,450', color: '#1d4ed8'  },
                      { label: 'Competition Risk',   value: 'Low',     color: '#15803d'  },
                      { label: 'Title Optimization', value: '87%',     color: '#b45309'  },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: 12 }}>
                        <p style={{ fontSize: 20, fontWeight: 900, color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Waitlist */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <input
                    type="email"
                    placeholder="your@email.com — join the waitlist"
                    value={sandboxEmail}
                    onChange={e => setSandboxEmail(e.target.value)}
                    style={{ flex: 1, height: 44, padding: '0 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, outline: 'none', fontFamily: 'Inter, sans-serif', background: C.surface }}
                  />
                  <button
                    onClick={() => sandboxEmail && setSandboxDone(true)}
                    style={{ height: 44, padding: '0 18px', borderRadius: 10, background: C.lime, color: C.dark, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    Notify me
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: C.limeTint, borderRadius: 16, padding: 32, border: `1px solid ${C.lime}` }}>
                <Check size={32} style={{ color: C.limeDeep, margin: '0 auto 12px' }}/>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>You're on the waitlist!</p>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>We'll notify you the moment live analysis goes live.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. SECURITY BAR ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {TRUST.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(143,255,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <t.icon size={15} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: '0 0 1px' }}>{t.label}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. BEFORE / AFTER ── */}
        <div style={{ backgroundColor: C.surface }}>
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
            <div className="text-center mb-10">
              <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>THE DIFFERENCE</p>
              <h2 className="text-[24px] md:text-[32px] font-black mb-6" style={{ color: C.text }}>Life with and without Riazify</h2>
              <div style={{ display: 'inline-flex', background: C.bg, borderRadius: 10, padding: 3, border: `0.5px solid ${C.border}`, gap: 2 }}>
                <button onClick={() => setBeforeAfter('before')}
                        style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', background: beforeAfter === 'before' ? C.dark : 'transparent', color: beforeAfter === 'before' ? '#fff' : C.muted, transition: 'all .2s', fontFamily: 'Inter, sans-serif' }}>
                  Without Riazify
                </button>
                <button onClick={() => setBeforeAfter('after')}
                        style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', background: beforeAfter === 'after' ? C.lime : 'transparent', color: beforeAfter === 'after' ? C.dark : C.muted, transition: 'all .2s', fontFamily: 'Inter, sans-serif' }}>
                  With Riazify
                </button>
              </div>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(beforeAfter === 'before' ? [
                { icon: Package,       label: 'Manual work',    text: 'Copying competitor titles and hoping for the best'  },
                { icon: Calculator,    label: 'Hidden fees',    text: 'Fee surprises discovered after every sale'           },
                { icon: BarChart2,     label: 'Spreadsheets',   text: 'Excel sheets for inventory — error-prone and slow'   },
                { icon: AlertTriangle, label: 'Fraud risk',     text: 'Shipping to risky buyers and losing disputes'        },
                { icon: Eye,           label: 'Blind research', text: 'Manually checking competitor stores one by one'      },
                { icon: TrendingUp,    label: 'Stockouts',      text: 'Running out of stock on best sellers'                },
              ] : [
                { icon: Type,         label: 'AI titles',      text: 'Cassini-optimized titles generated in 3 seconds'     },
                { icon: Calculator,   label: 'Exact margins',  text: 'Full FVF, VAT and shipping cost before you list'     },
                { icon: BarChart2,    label: 'Live tracking',  text: 'Real-time inventory dashboard with velocity alerts'   },
                { icon: Shield,       label: 'Fraud blocked',  text: 'High-risk buyers flagged before you ship'            },
                { icon: Radar,        label: 'Intel',          text: 'Full competitor strategy revealed in one click'      },
                { icon: Package,      label: 'Auto alerts',    text: 'Velocity-based restock notifications automatically'  },
              ]).map((item, i) => (
                <FadeCard key={`${beforeAfter}-${i}`} delay={i * 45}>
                  <div style={{
                    borderRadius: 12,
                    padding: '20px 16px',
                    border: `0.5px solid ${beforeAfter === 'before' ? '#fecaca' : '#c6f6a0'}`,
                    background: beforeAfter === 'before' ? '#fef9f9' : C.limeTint,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 10,
                    height: '100%',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: beforeAfter === 'before' ? '#fef2f2' : C.limeTint,
                      border: `0.5px solid ${beforeAfter === 'before' ? '#fecaca' : C.lime}`,
                    }}>
                      <item.icon size={20} style={{ color: beforeAfter === 'before' ? '#b91c1c' : C.limeDeep }}/>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: beforeAfter === 'before' ? '#b91c1c' : C.limeDeep }}>
                      {item.label}
                    </span>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: C.text, margin: 0 }}>{item.text}</p>
                  </div>
                </FadeCard>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. FEATURE GRID ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>ALL FEATURES</p>
            <h2 className="text-[32px] font-black mb-10" style={{ color: C.text }}>Six tools. One platform.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURES.map((f, i) => (
                <FadeCard key={f.id} delay={i * 80}>
                  <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <f.icon size={20} style={{ color: C.lime }}/>
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 900, color: C.text, margin: '0 0 2px' }}>{f.label}</p>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: f.badge === 'Live' ? C.limeTint : f.badge === 'AI Powered' ? '#eff6ff' : C.bg, color: f.badge === 'Live' ? C.limeDeep : f.badge === 'AI Powered' ? '#1d4ed8' : C.muted, border: `0.5px solid ${f.badge === 'Live' ? C.lime : f.badge === 'AI Powered' ? '#bfdbfe' : C.border}` }}>
                            {f.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 8px', lineHeight: 1.3 }}>{f.headline}</p>
                      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 14px', lineHeight: 1.6 }}>{f.sub}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {f.bullets.map((b, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.lime, flexShrink: 0 }}/>
                            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{b}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href="/pricing"
                          className="flex items-center gap-2 text-[13px] font-bold hover:opacity-70 transition-opacity"
                          style={{ color: C.limeDeep }}>
                      Get started <ChevronRight size={14}/>
                    </Link>
                  </div>
                </FadeCard>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. STATS ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center" style={{ color: C.muted }}>BY THE NUMBERS</p>
            <h2 className="text-[32px] font-black mb-10 text-center" style={{ color: '#fff' }}>Built for scale</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {STATS.map((s, i) => (
                <FadeCard key={i} delay={i * 100}>
                  <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[36px] font-black mb-1" style={{ color: C.lime }}>
                      <AnimatedCounter value={s.value} suffix={s.suffix} duration={2000}/>
                    </p>
                    <p className="text-[13px] font-black mb-1" style={{ color: '#fff' }}>{s.label}</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
                  </div>
                </FadeCard>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. FAQ ── */}
        <div style={{ backgroundColor: C.surface }}>
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
            <div className="text-center mb-10">
              <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>FAQ</p>
              <h2 className="text-[24px] md:text-[32px] font-black" style={{ color: C.text }}>Common questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { q: 'Does Riazify work with all eBay marketplaces?', a: 'Yes — Riazify supports all major eBay marketplaces including eBay.com, eBay.co.uk, eBay.de, eBay.com.au and more. Currency and fee calculations automatically adjust per marketplace.' },
                { q: 'Is my eBay data safe and private?', a: 'Absolutely. We connect via official eBay OAuth API — no passwords stored, no scraping. Your listings, pricing data and sourcing channels are never shared with other sellers or third parties.' },
                { q: 'Do I need to be a professional seller to use Riazify?', a: 'No — Riazify works for sellers at every level, from part-time to full-time. The tools are designed to grow with you, whether you have 10 listings or 10,000.' },
                { q: 'What is Cassini and why does it matter?', a: "Cassini is eBay's internal search algorithm. It ranks listings based on keywords, sell-through rate, price competitiveness and more. Our Title Builder is specifically optimized to help your listings rank higher in Cassini search results." },
                { q: 'Can I try Riazify before paying?', a: 'Yes — we offer a free 14-day trial with full access to all features. No credit card required to start.' },
                { q: 'Which features are live and which are coming soon?', a: 'Title Builder, Profit Calculator and Orders Protection are live now. Product Research, Competitor Research and Inventory Manager are in development and launching in Q3 2026.' },
              ].map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </div>

        {/* ── 8. CTA ── */}
        <div style={{ backgroundColor: C.bg, paddingBottom: 40 }}>
          <div className="max-w-5xl mx-auto px-4 md:px-6 pt-12 md:pt-20">
            <div className="p-8 md:p-14 text-center" style={{ backgroundColor: C.dark, borderRadius: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(143,255,0,0.05)', pointerEvents: 'none' }}/>
              <p className="text-[11px] font-black tracking-wider mb-4" style={{ color: C.muted }}>GET STARTED TODAY</p>
              <h2 className="text-[28px] md:text-[36px] font-black mb-3" style={{ color: '#fff' }}>
                Start selling smarter on eBay
              </h2>
              <p className="text-[15px] mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Join thousands of eBay sellers using Riazify to optimize titles, protect orders and maximize profit margins.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/auth/signup"
                      className="flex items-center gap-2 px-10 py-4 rounded-xl font-black text-[15px] hover:opacity-90 transition-all"
                      style={{ backgroundColor: C.lime, color: C.dark }}>
                  Start free trial <ArrowRight size={16}/>
                </Link>
                <Link href="/pricing"
                      className="px-8 py-4 rounded-xl font-bold text-[14px] border hover:opacity-80 transition-all"
                      style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  See pricing →
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 flex-wrap mt-6">
                {['Free 14-day trial', 'No credit card required', 'Cancel anytime'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check size={13} style={{ color: C.lime }}/>
                    <span className="text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}