'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap, TrendingUp, BarChart2, Shield, ArrowRight,
  ChevronRight, ChevronDown, Star, Check, Menu, X,
  Activity, AlertTriangle, Target, Package, Search,
  DollarSign, ShoppingBag, Users, Eye, Cpu, Plus, Minus
} from 'lucide-react'

// ── Brand tokens ───────────────────────────────────────────────
const T = {
  white:       '#ffffff',
  surface:     '#f7f9f5',
  border:      '#e8ede2',
  accentBorder:'rgba(143,255,0,0.35)',
  lime:        '#8fff00',
  limeDeep:    '#4a8f00',
  limeMid:     '#6bcc00',
  limeTint:    '#f4ffe6',
  limePale:    '#e8ffcc',
  carbon:      '#1a2410',
  sage:        '#8a9e78',
  black:       '#0a0d08',
}

// ── Animated counter ───────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '', duration = 2000 }: {
  to: number; prefix?: string; suffix?: string; duration?: number
}) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      function tick(now: number) {
        const t = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - t, 4)
        setVal(Math.floor(ease * to))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to, duration])

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

// ── Mini sparkline SVG ─────────────────────────────────────────
function MiniChart({ scanned }: { scanned: boolean }) {
  return (
    <svg viewBox="0 0 320 80" className="w-full" style={{ height: 80 }}>
      <defs>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#8fff00" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#8fff00" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#4a8f00"/>
          <stop offset="100%" stopColor="#8fff00"/>
        </linearGradient>
      </defs>
      <path d="M0,60 C20,55 40,45 60,48 C80,51 100,35 120,30 C140,25 160,38 180,32 C200,26 220,20 240,18 L240,80 L0,80 Z"
            fill="url(#fillGrad)" />
      <path d="M0,60 C20,55 40,45 60,48 C80,51 100,35 120,30 C140,25 160,38 180,32 C200,26 220,20 240,18"
            fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="240" y1="0" x2="240" y2="80" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3"/>
      <text x="236" y="10" fontSize="7" fill="#94a3b8" textAnchor="end" fontWeight="bold">TODAY</text>
      <path d="M240,18 C260,16 280,14 300,12" fill="none" stroke="#8fff00"
            strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round"/>
      <circle cx="300" cy="12" r="4" fill="white" stroke="#8fff00" strokeWidth="2"/>
      <text x="304" y="16" fontSize="7" fill="#4a8f00" fontWeight="900">AI • 06-05</text>
      <line x1="140" y1="0" x2="140" y2="80" stroke="#fb923c" strokeWidth="1" strokeDasharray="4 3"/>
      <text x="144" y="10" fontSize="6.5" fill="#c2410c" fontWeight="bold">📉 Price Drop</text>
      {scanned && (
        <circle cx="120" cy="30" r="5" fill="#8fff00" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      )}
    </svg>
  )
}

// ── Navbar ─────────────────────────────────────────────────────
function Navbar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const tools = [
    { icon: Search,      label: 'Product Research',  desc: 'Find winning niches fast'      },
    { icon: BarChart2,   label: 'Title Builder',      desc: 'AI-optimized eBay titles'      },
    { icon: Eye,         label: 'Competitor X-Ray',   desc: 'Scan any eBay seller'          },
    { icon: ShoppingBag, label: 'Orders Manager',     desc: 'Risk-scored order tracking'    },
    { icon: DollarSign,  label: 'Profit Calculator',  desc: 'Real-time margin analysis'     },
    { icon: Package,     label: 'Inventory Manager',  desc: 'Stock control & forecasting'   },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
         style={{
           background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
           backdropFilter: scrolled ? 'blur(16px)' : 'none',
           borderBottom: scrolled ? `1px solid ${T.border}` : 'none',
         }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.lime }}>
            <Activity size={16} style={{ color: T.black }} />
          </div>
          <span className="text-[18px] font-black tracking-tight" style={{ color: T.carbon }}>Riazify</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className="flex items-center gap-1 text-[14px] font-medium transition-colors" style={{ color: T.carbon }}>
              Tools <ChevronDown size={14} />
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] rounded-2xl border p-4 grid grid-cols-2 gap-2"
                   style={{ background: T.white, borderColor: T.border, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
                {tools.map((t, i) => {
                  const Icon = t.icon
                  return (
                    <div key={i} onClick={() => router.push('/auth/signup')}
                         className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:opacity-80 transition-all"
                         style={{ background: T.surface }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.limeTint }}>
                        <Icon size={14} style={{ color: T.limeDeep }} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold" style={{ color: T.carbon }}>{t.label}</p>
                        <p className="text-[10px]" style={{ color: T.sage }}>{t.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {['Pricing', 'How It Works', 'Blog'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
               className="text-[14px] font-medium hover:opacity-70 transition-opacity"
               style={{ color: T.carbon }}>{item}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => router.push('/auth/login')}
            className="text-[14px] font-semibold px-4 py-2 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: T.carbon }}>Log In</button>
          <button onClick={() => router.push('/auth/signup')}
            className="text-[14px] font-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: T.lime, color: T.black }}>
            Get Started Free →
          </button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(s => !s)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4 border-t"
             style={{ background: T.white, borderColor: T.border }}>
          {['Tools', 'Pricing', 'How It Works', 'Blog'].map(item => (
            <a key={item} href="#" className="text-[15px] font-medium py-1" style={{ color: T.carbon }}>{item}</a>
          ))}
          <button onClick={() => router.push('/auth/signup')}
            className="mt-2 py-3 rounded-xl font-black text-[15px]"
            style={{ background: T.lime, color: T.black }}>
            Get Started Free →
          </button>
        </div>
      )}
    </nav>
  )
}

// ── Hero ───────────────────────────────────────────────────────
function HeroSection() {
  const router = useRouter()
  const [niche, setNiche] = useState('')
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)

  function handleScan() {
    if (!niche.trim()) return
    setScanning(true)
    setTimeout(() => { setScanning(false); setScanned(true) }, 1500)
  }

  return (
    <section className="min-h-screen flex items-center pt-20" style={{ background: T.white }}>
      <div className="max-w-7xl mx-auto px-6 w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col gap-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit border"
                 style={{ background: T.limeTint, borderColor: T.accentBorder }}>
              <Zap size={12} style={{ color: T.limeDeep }} className="fill-current" />
              <span className="text-[11px] font-black tracking-[1.5px]" style={{ color: T.limeDeep }}>
                NEXT-GEN EBAY INTELLIGENCE
              </span>
            </div>
            <h1 className="text-[42px] lg:text-[52px] font-black leading-[1.08] tracking-tight">
              <span style={{ color: T.limeDeep }}>Stop Guessing</span><br/>
              <span style={{ color: T.carbon }}>eBay Demand.</span><br/>
              <span style={{ color: T.limeMid }}>Spot Winning</span><br/>
              <span style={{ color: T.carbon }}>Trends Fast.</span>
            </h1>
            <p className="text-[16px] leading-relaxed" style={{ color: T.sage }}>
              Riazify combines live marketplace analytics, automated supplier event tracking, and predictive AI forecasting into a single, lightning-fast dashboard built for{' '}
              <span className="font-semibold px-1.5 py-0.5 rounded" style={{ background: T.limePale, color: T.carbon }}>
                scaling operators.
              </span>
            </p>
            <div className="flex items-center rounded-2xl border overflow-hidden"
                 style={{ background: T.surface, borderColor: T.border }}>
              <input value={niche} onChange={e => setNiche(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                placeholder="Enter sample niche (e.g., Cat Brushes...)"
                className="flex-1 px-5 py-4 text-[14px] outline-none bg-transparent"
                style={{ color: T.carbon }} />
              <button onClick={handleScan} disabled={scanning}
                className="px-6 py-4 font-black text-[14px] transition-all hover:opacity-90 shrink-0"
                style={{ background: T.lime, color: T.black }}>
                {scanning ? '⚡ Scanning...' : 'Scan Niche →'}
              </button>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              {['No credit card', 'Free scan included', '30-sec setup'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check size={13} style={{ color: T.limeDeep }} />
                  <span className="text-[12px] font-medium" style={{ color: T.sage }}>{t}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { val: 12000,   label: 'Active Sellers',     suffix: '+'  },
                { val: 4200000, label: 'Revenue Protected',  prefix: '$', suffix: '+' },
                { val: 98,      label: 'AI Accuracy',        suffix: '%'  },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl text-center"
                     style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                  <p className="text-[18px] font-black" style={{ color: T.limeDeep }}>
                    <Counter to={s.val} prefix={s.prefix ?? ''} suffix={s.suffix} />
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: T.sage }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border p-6 relative overflow-hidden"
                 style={{ background: T.surface, borderColor: T.border,
                          boxShadow: '0 20px 60px rgba(74,143,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}>
              <div className="absolute -top-3 -left-3 px-3 py-1.5 rounded-full border text-[11px] font-black shadow-lg"
                   style={{ background: T.white, borderColor: T.border, color: T.limeDeep }}>
                📈 +33.8% this week
              </div>
              <div className="absolute -top-3 right-8 px-3 py-1.5 rounded-full border text-[11px] font-black shadow-lg"
                   style={{ background: T.white, borderColor: T.border, color: T.carbon }}>
                🔥 312 active sellers
              </div>
              <div className="absolute -bottom-3 left-8 px-3 py-1.5 rounded-full border text-[11px] font-black shadow-lg"
                   style={{ background: T.white, borderColor: T.border, color: T.limeDeep }}>
                ⚡ AI Confidence: {scanned ? '95%' : '70%'}
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] font-black tracking-[1.1px] mb-1" style={{ color: T.sage }}>
                    📈 SALES TREND & FORECAST {scanned && niche ? `("${niche}")` : '("Overall Market")'}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[20px] font-black" style={{ color: T.limeDeep }}>+33.8%</span>
                    <span className="text-[12px]" style={{ color: T.sage }}>vs last period</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px]"
                         style={{ background: T.white, borderColor: T.border }}>
                      <span style={{ color: T.sage }}>Saturation:</span>
                      <div className="w-12 h-1.5 rounded-full"
                           style={{ background: `linear-gradient(to right, #ef4444, #fb923c, ${T.lime})` }} />
                      <span className="font-black" style={{ color: T.limeDeep }}>Low (Ideal)</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black"
                         style={{ background: T.limeTint, borderColor: T.accentBorder, color: T.limeDeep }}>
                      <Zap size={10} className="fill-current" />
                      AI Confidence: {scanned ? '95%' : '70%'}
                    </div>
                  </div>
                </div>
                <div className="flex bg-white p-1 rounded-lg border gap-0.5" style={{ borderColor: T.border }}>
                  {['7D','30D','90D','1Y'].map((t,i) => (
                    <button key={t} className="px-2.5 py-1 text-[10px] font-bold rounded-md"
                      style={{ background: i===1 ? T.white : 'transparent', color: i===1 ? T.carbon : T.sage,
                               boxShadow: i===1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-4 mb-4" style={{ background: T.white }}>
                <MiniChart scanned={scanned} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold" style={{ color: T.sage }}>Saturation:</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: T.limeTint }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                       style={{ width: scanned ? '22%' : '28%',
                                background: `linear-gradient(to right, ${T.limeDeep}, ${T.lime})`,
                                boxShadow: `0 0 8px rgba(143,255,0,0.5)` }} />
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: T.limePale, color: T.limeDeep }}>Low (Ideal)</span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                   style={{ background: 'rgba(143,255,0,0.1)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Social Proof Strip ─────────────────────────────────────────
function SocialProofStrip() {
  const items = [
    '⚡ 12,000+ Active Sellers', '📦 $4.2M+ Revenue Protected', '🎯 98% AI Accuracy',
    '🔥 50K+ Niches Tracked Daily', '⭐ 4.9/5 Average Rating', '🚀 30-Second Setup',
    '💰 Zero Dead Stock Guarantee', '🌍 US, UK, DE, IT Markets',
  ]
  const doubled = [...items, ...items]
  return (
    <div className="py-4 border-y overflow-hidden" style={{ background: T.carbon, borderColor: T.black }}>
      <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} className="text-[13px] font-black shrink-0" style={{ color: T.lime }}>
            {item}<span className="mx-6 opacity-30">|</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  )
}

// ── Anti-Loss Banner ───────────────────────────────────────────
function AntiLossBanner() {
  return (
    <section className="py-24" style={{ background: T.surface }}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
             style={{ background: T.limeTint, borderColor: T.accentBorder }}>
          <Shield size={12} style={{ color: T.limeDeep }} />
          <span className="text-[11px] font-black tracking-wider" style={{ color: T.limeDeep }}>DEAD STOCK PREVENTION ENGINE</span>
        </div>
        <h2 className="text-[36px] lg:text-[48px] font-black leading-tight mb-6" style={{ color: T.limeDeep }}>
          Riazify is currently under development..<br/><span style={{ color: T.carbon }}>Some features may be incomplete.</span>
        </h2>
        <p className="text-[17px] leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: T.sage }}>
          Before you deploy capital, Riazify cross-references{' '}
          <span className="font-semibold px-1.5 py-0.5 rounded" style={{ background: T.limePale, color: T.carbon }}>active wholesale listing counts</span>{' '}
          against historical sell-through velocity to calculate true seller competition — in real time.
        </p>
        <div className="rounded-3xl border p-8 lg:p-12 max-w-3xl mx-auto"
             style={{ background: T.white, borderColor: T.border, boxShadow: '0 12px 40px rgba(74,143,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-bold" style={{ color: T.sage }}>Market Saturation Pulse Meter</p>
            <span className="text-[11px] font-black px-3 py-1 rounded-full" style={{ background: T.limeTint, color: T.limeDeep }}>LIVE</span>
          </div>
          <div className="h-4 rounded-full relative overflow-hidden mb-3" style={{ background: T.limeTint }}>
            <div className="absolute left-0 top-0 h-full rounded-full"
                 style={{ width: '24%', background: `linear-gradient(to right, ${T.limeDeep}, ${T.lime})`, boxShadow: `0 0 12px rgba(143,255,0,0.6)` }} />
          </div>
          <div className="flex items-center justify-between mb-8">
            <span className="text-[11px]" style={{ color: T.sage }}>Oversaturated</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: T.lime, boxShadow: `0 0 6px ${T.lime}` }} />
              <span className="text-[13px] font-black" style={{ color: T.limeDeep }}>Saturation: Low (Ideal) — 24%</span>
            </div>
            <span className="text-[11px]" style={{ color: T.sage }}>Wide open</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Sellers',   value: '312',    sub: 'in this niche' },
              { label: 'Avg Sell-Through', value: '48.2%',  sub: 'last 30 days'  },
              { label: 'Market Vol.',      value: '$45.2K', sub: 'monthly est.'  },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl text-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <p className="text-[22px] font-black mb-0.5" style={{ color: T.limeDeep }}>{s.value}</p>
                <p className="text-[11px] font-bold mb-0.5" style={{ color: T.carbon }}>{s.label}</p>
                <p className="text-[10px]" style={{ color: T.sage }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Tool Showcase ──────────────────────────────────────────────
function ToolShowcase() {
  const tools = [
    { icon: Search,      name: 'Product Research',  desc: 'Scan any eBay niche in seconds. Get saturation score, sell-through rate, market volume, and AI demand forecasting before spending a single dollar.',    badge: 'Most Used',  color: '#4a8f00' },
    { icon: BarChart2,   name: 'Title Builder',      desc: 'AI-powered eBay title generator with keyword injection, VeRO protection, real-time character counter, and a spin engine for unlimited variations.',   badge: 'AI Powered', color: '#6bcc00' },
    { icon: Eye,         name: 'Competitor X-Ray',   desc: 'Deep scan any eBay seller — their revenue, active listings, top products, keyword gaps, and sell-through rate. Know your competition inside out.',   badge: 'Exclusive',  color: '#4a8f00' },
    { icon: ShoppingBag, name: 'Orders Manager',     desc: 'Risk-scored order management with buyer profile analysis, dropshipping detection, dispute protection checklists, and smart deadline reminders.',     badge: 'Essential',  color: '#6bcc00' },
    { icon: DollarSign,  name: 'Profit Calculator',  desc: 'Calculate true eBay net profit with eBay fees, shipping, FX rates, sourcing tax, ad costs, and cashback — all in one real-time calculation engine.', badge: 'Pro Tool',   color: '#4a8f00' },
    { icon: Package,     name: 'Inventory Manager',  desc: 'Track your full inventory pipeline with AI demand forecasting, reorder alerts, dead stock warnings, and supplier performance scoring in one view.',    badge: 'New',        color: '#6bcc00' },
  ]
  return (
    <section id="features" className="py-24" style={{ background: T.white }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
               style={{ background: T.limeTint, borderColor: T.accentBorder }}>
            <Cpu size={12} style={{ color: T.limeDeep }} />
            <span className="text-[11px] font-black tracking-wider" style={{ color: T.limeDeep }}>THE COMPLETE TOOLKIT</span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4" style={{ color: T.limeDeep }}>
            Every Tool You Need.<br/><span style={{ color: T.carbon }}>Nothing You Don't.</span>
          </h2>
          <p className="text-[17px] max-w-2xl mx-auto" style={{ color: T.sage }}>
            Six purpose-built intelligence tools. One unified dashboard. Zero subscription bloat.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => {
            const Icon = tool.icon
            return (
              <div key={i}
                   className="group rounded-3xl border p-8 flex flex-col gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                   style={{ background: T.surface, borderColor: T.border, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                   onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(74,143,0,0.12)'; e.currentTarget.style.borderColor = T.lime }}
                   onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = T.border }}>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                       style={{ background: T.limeTint, border: `1px solid ${T.accentBorder}` }}>
                    <Icon size={22} style={{ color: tool.color }} />
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                        style={{ background: T.limePale, color: T.limeDeep }}>{tool.badge}</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-black mb-2" style={{ color: T.carbon }}>{tool.name}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: T.sage }}>{tool.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-auto text-[13px] font-bold" style={{ color: T.limeDeep }}>
                  Explore tool <ChevronRight size={15} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Live Stats ─────────────────────────────────────────────────
function LiveStats() {
  const stats = [
    { val: 48392, label: 'Niche Scans Today',   suffix: '+', icon: Search     },
    { val: 127,   label: 'Niches Tracked Live', suffix: 'K', icon: TrendingUp },
    { val: 12841, label: 'Sellers Active Now',  suffix: '+', icon: Users      },
    { val: 4200,  label: 'Revenue Protected',   prefix: '$', suffix: 'K+', icon: Shield },
  ]
  return (
    <section className="py-20" style={{ background: T.carbon }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-[12px] font-black tracking-[2px] mb-10" style={{ color: T.sage }}>
          RIAZIFY BY THE NUMBERS — LIVE
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="text-center p-8 rounded-3xl border"
                   style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(143,255,0,0.15)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                     style={{ background: T.limeTint }}>
                  <Icon size={18} style={{ color: T.limeDeep }} />
                </div>
                <p className="text-[32px] font-black mb-1" style={{ color: T.lime }}>
                  <Counter to={s.val} prefix={s.prefix ?? ''} suffix={s.suffix} />
                </p>
                <p className="text-[13px] font-semibold" style={{ color: T.sage }}>{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Bento Grid ─────────────────────────────────────────────────
function BentoGrid() {
  return (
    <section className="py-24" style={{ background: T.surface }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4" style={{ color: T.limeDeep }}>
            Three Pillars.<br/><span style={{ color: T.carbon }}>One Unfair Advantage.</span>
          </h2>
          <p className="text-[17px] max-w-2xl mx-auto" style={{ color: T.sage }}>
            Every intelligence layer in Riazify is engineered around one obsession — getting you to the right product before everyone else.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-3xl border p-8 flex flex-col gap-6"
               style={{ background: T.white, borderColor: T.border }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: T.limeTint, border: `1px solid ${T.accentBorder}` }}>
                <AlertTriangle size={18} style={{ color: T.limeDeep }} />
              </div>
              <div>
                <p className="text-[13px] font-black" style={{ color: T.carbon }}>Supply Chain Shockwaves</p>
                <p className="text-[11px]" style={{ color: T.sage }}>Event Intelligence Engine</p>
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <svg viewBox="0 0 280 70" className="w-full">
                <defs>
                  <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8fff00" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#8fff00" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,50 C30,45 50,40 80,42 C110,44 120,30 130,52 C140,58 160,55 190,48 C220,40 250,35 280,32 L280,70 L0,70 Z" fill="url(#bg1)"/>
                <path d="M0,50 C30,45 50,40 80,42 C110,44 120,30 130,52 C140,58 160,55 190,48 C220,40 250,35 280,32" fill="none" stroke="#8fff00" strokeWidth="2" strokeLinecap="round"/>
                <line x1="128" y1="0" x2="128" y2="70" stroke="#fb923c" strokeDasharray="3 3" strokeWidth="1.5"/>
                <rect x="84" y="3" width="88" height="16" rx="4" fill="#fff7ed"/>
                <text x="128" y="14" fontSize="7" fill="#c2410c" textAnchor="middle" fontWeight="bold">📉 $5 Price Drop Event</text>
                <circle cx="128" cy="52" r="3.5" fill="#fb923c"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[18px] font-black mb-2" style={{ color: T.carbon }}>
                Auto-flag supplier anomalies <span style={{ color: T.limeDeep }}>before they tank your rank.</span>
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: T.sage }}>
                Riazify monitors price drop events, stock spikes, and listing velocity changes in real time — alerting you the moment your niche is disrupted.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-3xl border p-8" style={{ background: T.white, borderColor: T.border }}>
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                         style={{ background: T.limeTint, border: `1px solid ${T.accentBorder}` }}>
                      <TrendingUp size={18} style={{ color: T.limeDeep }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black" style={{ color: T.carbon }}>Forward-Looking Demand</p>
                      <p className="text-[11px]" style={{ color: T.sage }}>AI Forecasting Model</p>
                    </div>
                  </div>
                  <h3 className="text-[18px] font-black mb-2" style={{ color: T.carbon }}>
                    Stop driving by <span style={{ color: T.limeDeep }}>looking in the rearview mirror.</span>
                  </h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: T.sage }}>
                    Legacy tools show where demand was. Riazify shows where it's going — with AI projection nodes extending 7, 30, and 90 days forward.
                  </p>
                </div>
                <div className="rounded-2xl p-3 shrink-0 w-full lg:w-48"
                     style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                  <svg viewBox="0 0 140 60" className="w-full">
                    <defs>
                      <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8fff00" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#8fff00" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0,45 C20,40 40,35 60,30 C80,25 90,28 100,25 L100,60 L0,60 Z" fill="url(#bg2)"/>
                    <path d="M0,45 C20,40 40,35 60,30 C80,25 90,28 100,25" fill="none" stroke="#8fff00" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="100" y1="0" x2="100" y2="60" stroke="#94a3b8" strokeDasharray="2 2" strokeWidth="1"/>
                    <text x="97" y="8" fontSize="6" fill="#94a3b8" textAnchor="end" fontWeight="bold">TODAY</text>
                    <path d="M100,25 C115,22 125,20 140,18" fill="none" stroke="#8fff00" strokeDasharray="5 3" strokeWidth="2"/>
                    <circle cx="140" cy="18" r="3" fill="white" stroke="#8fff00" strokeWidth="1.5"/>
                  </svg>
                  <p className="text-[9px] font-black text-center mt-1" style={{ color: T.limeDeep }}>AI • 06-05 Projection</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border p-8" style={{ background: T.white, borderColor: T.border }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: T.limeTint, border: `1px solid ${T.accentBorder}` }}>
                  <Package size={18} style={{ color: T.limeDeep }} />
                </div>
                <div>
                  <p className="text-[13px] font-black" style={{ color: T.carbon }}>MAP Compliance Tracker</p>
                  <p className="text-[11px]" style={{ color: T.sage }}>Wholesale Intelligence</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: T.border }}>
                <div className="grid grid-cols-4 px-4 py-2.5 text-[10px] font-black tracking-wider"
                     style={{ background: T.carbon, color: T.lime }}>
                  {['BRAND','MAP PRICE','YOUR PRICE','STATUS'].map(h => <span key={h}>{h}</span>)}
                </div>
                {[
                  ['Anker',  '$29.99', '$28.50', '⚠️ Below MAP'],
                  ['Belkin', '$49.99', '$52.00', '✅ Compliant'],
                  ['Aukey',  '$19.99', '$19.99', '✅ Compliant'],
                ].map(([brand, map, price, status], i) => (
                  <div key={i} className="grid grid-cols-4 px-4 py-2.5 text-[11px] border-t"
                       style={{ borderColor: T.border, background: i % 2 === 0 ? T.white : T.surface }}>
                    <span className="font-bold" style={{ color: T.carbon }}>{brand}</span>
                    <span style={{ color: T.sage }}>{map}</span>
                    <span className="font-bold" style={{ color: T.carbon }}>{price}</span>
                    <span className="font-semibold text-[10px]"
                          style={{ color: status.includes('⚠️') ? '#f59e0b' : '#16a34a' }}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Trust Section ──────────────────────────────────────────────
function TrustSection() {
  return (
    <section className="py-24" style={{ background: T.white }}>
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-[12px] font-black tracking-[2px] mb-10" style={{ color: T.sage }}>
          DATA INTEGRITY PIPELINES CONNECTED TO
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap mb-20">
          {['eBay API', 'Supabase', 'Amazon SP', 'AliExpress', 'Google Trends', 'PayPal'].map(p => (
            <div key={p} className="px-5 py-2.5 rounded-xl border text-[13px] font-black"
                 style={{ background: T.surface, borderColor: T.border, color: T.sage }}>{p}</div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: '"SellerPulse flagged a hidden saturation spike on a pet grooming line I was about to buy in bulk. Saved my business over $3,500 in dead inventory on day one."', name: 'James R.', role: '7-Figure eBay Seller · Pet Supplies', rating: 5 },
            { quote: '"The AI forecast is scary accurate. I sourced 200 units of a trending product 3 weeks before it went viral on eBay. Sold out in 4 days."', name: 'Sarah K.', role: 'eBay Dropshipper · Electronics', rating: 5 },
            { quote: '"Finally a tool built for eBay operators, not Amazon sellers. The Title Builder alone saved me 10 hours a week."', name: 'Marcus T.', role: 'eBay Power Seller · Home & Garden', rating: 5 },
          ].map((t, i) => (
            <div key={i} className="rounded-3xl border p-8 flex flex-col gap-5 relative overflow-hidden"
                 style={{ background: T.surface, borderColor: T.border }}>
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} style={{ color: T.lime }} className="fill-current" />
                ))}
              </div>
              <p className="text-[14px] leading-relaxed font-medium" style={{ color: T.carbon }}>{t.quote}</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px]"
                     style={{ background: T.limeTint, color: T.limeDeep }}>{t.name[0]}</div>
                <div>
                  <p className="font-black text-[13px]" style={{ color: T.carbon }}>{t.name}</p>
                  <p className="text-[11px]" style={{ color: T.sage }}>{t.role}</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                   style={{ background: 'rgba(143,255,0,0.08)' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ───────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Enter Your Niche',      desc: 'Type any product or keyword. Riazify instantly pulls live eBay market data, saturation scores, and trend velocity.',                                                   icon: Target    },
    { n: '02', title: 'Read the Intelligence', desc: 'See historical actuals, AI forecast projections, competitor analysis, and MAP compliance — all in one unified dashboard.',                                               icon: BarChart2 },
    { n: '03', title: 'Move with Confidence',  desc: 'Source the right products, set the right prices, and scale your eBay business with predictive intelligence — not guesswork.',                                          icon: TrendingUp},
  ]
  return (
    <section id="how-it-works" className="py-24" style={{ background: T.surface }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4" style={{ color: T.limeDeep }}>
            Up and Running<br/><span style={{ color: T.carbon }}>in 30 Seconds.</span>
          </h2>
          <p className="text-[17px]" style={{ color: T.sage }}>No technical setup. No API keys. Just results.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="rounded-3xl border p-8 h-full" style={{ background: T.white, borderColor: T.border }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[42px] font-black" style={{ color: T.limeTint, WebkitTextStroke: `2px ${T.limeDeep}` }}>{s.n}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.limeTint }}>
                    <Icon size={18} style={{ color: T.limeDeep }} />
                  </div>
                </div>
                <h3 className="text-[18px] font-black mb-3" style={{ color: T.carbon }}>{s.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: T.sage }}>{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: 'Is Riazify only for eBay sellers?',      a: "Currently yes — Riazify is purpose-built for eBay operators. We're expanding to Amazon and Walmart in Q3 2026. eBay-focused tools mean deeper data, better accuracy, and zero feature bloat from other marketplaces." },
    { q: 'How accurate is the AI forecast?',       a: 'Our hybrid regressor model achieves 98% accuracy on 7-day forecasts and 91% on 30-day projections, validated against 18 months of live eBay sales data. Each prediction comes with a confidence score so you always know how much to trust it.' },
    { q: 'What does the free plan include?',       a: "The free plan includes 5 niche scans per day, basic trend charts, a saturation meter, and the profit calculator. No credit card required. Upgrade to Pro when you're ready to scale." },
    { q: 'Can I cancel my subscription anytime?', a: 'Absolutely. Cancel in one click from your account settings. No lock-in contracts, no cancellation fees, no questions asked. Your data remains accessible for 30 days after cancellation.' },
    { q: 'How does Riazify get its eBay data?',   a: "We connect directly to the official eBay Partner API, refreshing market data every 4 hours. Combined with our AI processing layer, you get both real-time accuracy and forward-looking intelligence that raw API data alone can't provide." },
    { q: 'Is my eBay account information safe?',  a: 'Riazify never stores your eBay login credentials. We use OAuth 2.0 for secure read-only market data access. Your account data is encrypted at rest and in transit using AES-256 and TLS 1.3.' },
  ]
  return (
    <section className="py-24" style={{ background: T.white }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4" style={{ color: T.limeDeep }}>
            Questions?<br/><span style={{ color: T.carbon }}>We've Got Answers.</span>
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden transition-all"
                 style={{ background: T.surface, borderColor: open === i ? T.lime : T.border }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left" style={{ color: T.carbon }}>
                <span className="text-[15px] font-bold pr-4">{faq.q}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: open === i ? T.lime : T.limeTint }}>
                  {open === i ? <Minus size={12} style={{ color: T.black }} /> : <Plus size={12} style={{ color: T.limeDeep }} />}
                </div>
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <p className="text-[14px] leading-relaxed" style={{ color: T.sage }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ────────────────────────────────────────────────────
function Pricing() {
  const router = useRouter()
  const plans = [
    { name: 'Free',     price: '$0',  period: 'forever',  desc: 'Perfect for testing Riazify.',          features: ['5 niche scans/day','Basic trend chart','Saturation meter','Profit calculator','Email alerts'],                                                            cta: 'Start Free',       highlight: false },
    { name: 'Pro',      price: '$29', period: '/month',   desc: 'For serious eBay scaling operators.',   features: ['Unlimited niche scans','AI forecast projections','MAP compliance tracker','Competitor X-Ray','Title Builder Pro','CSV exports','Priority support'],        cta: 'Start Pro Free →', highlight: true  },
    { name: 'Business', price: '$79', period: '/month',   desc: 'For agencies and multi-account sellers.',features: ['Everything in Pro','5 user seats','API access','Custom webhooks','Dedicated success manager','White-label reports','SLA guarantee'],                     cta: 'Contact Sales',    highlight: false },
  ]
  return (
    <section id="pricing" className="py-24" style={{ background: T.surface }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4" style={{ color: T.limeDeep }}>
            Simple Pricing.<br/><span style={{ color: T.carbon }}>No Surprises.</span>
          </h2>
          <p className="text-[17px]" style={{ color: T.sage }}>Cancel anytime. No lock-in. No fine print.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className="rounded-3xl border p-8 flex flex-col gap-6 relative overflow-hidden"
                 style={{ background: plan.highlight ? T.carbon : T.white, borderColor: plan.highlight ? T.lime : T.border,
                          boxShadow: plan.highlight ? '0 20px 60px rgba(143,255,0,0.15)' : 'none' }}>
              {plan.highlight && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black"
                     style={{ background: T.lime, color: T.black }}>MOST POPULAR</div>
              )}
              <div>
                <p className="text-[13px] font-bold mb-2" style={{ color: plan.highlight ? T.lime : T.sage }}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[42px] font-black" style={{ color: plan.highlight ? T.white : T.limeDeep }}>{plan.price}</span>
                  <span className="text-[14px]" style={{ color: T.sage }}>{plan.period}</span>
                </div>
                <p className="text-[13px]" style={{ color: plan.highlight ? '#94a3b8' : T.sage }}>{plan.desc}</p>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: T.limeTint }}>
                      <Check size={10} style={{ color: T.limeDeep }} />
                    </div>
                    <span className="text-[13px]" style={{ color: plan.highlight ? '#cbd5e1' : T.sage }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/auth/signup')}
                className="w-full py-3.5 rounded-xl font-black text-[14px] transition-all hover:scale-105"
                style={{ background: plan.highlight ? T.lime : T.limeTint, color: plan.highlight ? T.black : T.limeDeep,
                         border: plan.highlight ? 'none' : `1px solid ${T.accentBorder}` }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Trust Badges ───────────────────────────────────────────────
function TrustBadges() {
  const badges = [
    { icon: '🔒', label: 'SSL Secured',     sub: '256-bit encryption'   },
    { icon: '🇪🇺', label: 'GDPR Compliant', sub: 'Full data protection' },
    { icon: '🛡️', label: 'eBay API Partner',sub: 'Official data source' },
    { icon: '⚡',  label: '99.9% Uptime',   sub: 'SLA guaranteed'       },
    { icon: '🔐', label: 'OAuth 2.0',       sub: 'Secure auth standard' },
    { icon: '💳', label: 'PCI Compliant',   sub: 'Safe payments'        },
  ]
  return (
    <section className="py-12 border-y" style={{ background: T.surface, borderColor: T.border }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-[11px] font-black tracking-[2px] mb-8" style={{ color: T.sage }}>
          ENTERPRISE-GRADE SECURITY & COMPLIANCE
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-center"
                 style={{ background: T.white, borderColor: T.border }}>
              <span className="text-[24px]">{b.icon}</span>
              <p className="text-[12px] font-black" style={{ color: T.carbon }}>{b.label}</p>
              <p className="text-[10px]" style={{ color: T.sage }}>{b.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Who Is Riazify For ─────────────────────────────────────────
function WhoIsItFor() {
  const personas = [
    { emoji: '🚀', title: 'New eBay Sellers',   pain: "You don't know which products to sell or how to avoid overcrowded niches that kill margins.", solution: "Riazify's saturation meter and AI demand forecasting tells you exactly where to start — before you spend a single dollar on inventory.", cta: 'Start for free →', stats: [{ val: '< 30 sec', label: 'to first niche scan' }, { val: '5 scans', label: 'free every day' }] },
    { emoji: '📈', title: 'Scaling Operators',  pain: "You're growing but flying blind — no reliable data on where demand is heading or when to restock.", solution: "Riazify's hybrid AI regressor gives you 7, 30, and 90-day forecasts with confidence scores — so you source ahead of the curve, not behind it.", cta: 'Upgrade to Pro →', stats: [{ val: '98%', label: 'AI forecast accuracy' }, { val: '$4.2M+', label: 'revenue protected' }], highlight: true },
    { emoji: '🏢', title: 'Agencies & Resellers',pain: 'Managing multiple eBay accounts with no centralized intelligence layer is burning time and leaving money on the table.', solution: 'Riazify Business gives you 5 user seats, API access, white-label reports, and a dedicated success manager — everything agencies need to deliver results at scale.', cta: 'Contact Sales →', stats: [{ val: '5 seats', label: 'per Business plan' }, { val: 'API', label: 'full access' }] },
  ]
  return (
    <section className="py-24" style={{ background: T.white }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
               style={{ background: T.limeTint, borderColor: T.accentBorder }}>
            <Users size={12} style={{ color: T.limeDeep }} />
            <span className="text-[11px] font-black tracking-wider" style={{ color: T.limeDeep }}>BUILT FOR EVERY STAGE</span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4" style={{ color: T.limeDeep }}>
            Who Is Riazify For?<br/><span style={{ color: T.carbon }}>Everyone Selling on eBay.</span>
          </h2>
          <p className="text-[17px] max-w-2xl mx-auto" style={{ color: T.sage }}>
            Whether you're listing your first item or managing a $1M/year operation — Riazify scales with you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p, i) => (
            <div key={i} className="rounded-3xl border p-8 flex flex-col gap-6 relative overflow-hidden"
                 style={{ background: p.highlight ? T.carbon : T.surface, borderColor: p.highlight ? T.lime : T.border,
                          boxShadow: p.highlight ? '0 20px 60px rgba(143,255,0,0.15)' : 'none' }}>
              {p.highlight && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black"
                     style={{ background: T.lime, color: T.black }}>MOST POPULAR</div>
              )}
              <div>
                <span className="text-[40px]">{p.emoji}</span>
                <h3 className="text-[22px] font-black mt-3 mb-4" style={{ color: p.highlight ? T.white : T.carbon }}>{p.title}</h3>
                <div className="p-3.5 rounded-xl mb-4" style={{ background: p.highlight ? 'rgba(239,68,68,0.1)' : '#FFF5F5', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-[12px] font-semibold" style={{ color: '#DC2626' }}>😤 The Problem:</p>
                  <p className="text-[13px] mt-1" style={{ color: p.highlight ? '#fca5a5' : '#7f1d1d' }}>{p.pain}</p>
                </div>
                <div className="p-3.5 rounded-xl" style={{ background: p.highlight ? 'rgba(143,255,0,0.08)' : T.limeTint, border: `1px solid ${T.accentBorder}` }}>
                  <p className="text-[12px] font-semibold" style={{ color: T.limeDeep }}>✅ The Riazify Fix:</p>
                  <p className="text-[13px] mt-1" style={{ color: p.highlight ? '#d4f5a0' : T.carbon }}>{p.solution}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {p.stats.map((s, j) => (
                  <div key={j} className="p-3 rounded-xl text-center"
                       style={{ background: p.highlight ? 'rgba(255,255,255,0.06)' : T.white, border: `1px solid ${p.highlight ? 'rgba(255,255,255,0.08)' : T.border}` }}>
                    <p className="text-[16px] font-black" style={{ color: p.highlight ? T.lime : T.limeDeep }}>{s.val}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: T.sage }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-3.5 rounded-xl font-black text-[14px] transition-all hover:scale-105 mt-auto"
                      style={{ background: p.highlight ? T.lime : T.limeTint, color: p.highlight ? T.black : T.limeDeep,
                               border: p.highlight ? 'none' : `1px solid ${T.accentBorder}` }}>
                {p.cta}
              </button>
              {p.highlight && (
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                     style={{ background: 'rgba(143,255,0,0.15)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Sticky Mobile CTA ──────────────────────────────────────────
function StickyMobileCTA() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
         style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ background: T.white, borderColor: T.border }}>
        <div>
          <p className="text-[13px] font-black" style={{ color: T.carbon }}>Free scan — no card needed</p>
          <p className="text-[11px]" style={{ color: T.sage }}>Join 12,000+ eBay sellers</p>
        </div>
        <button onClick={() => router.push('/auth/signup')}
          className="px-5 py-2.5 rounded-xl font-black text-[13px] shrink-0"
          style={{ background: T.lime, color: T.black }}>
          Get Started →
        </button>
      </div>
    </div>
  )
}

// ── Scroll Progress Bar ────────────────────────────────────────
function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    function update() {
      const el = document.documentElement
      const top = el.scrollTop || document.body.scrollTop
      const h = el.scrollHeight - el.clientHeight
      setProgress(h > 0 ? (top / h) * 100 : 0)
    }
    window.addEventListener('scroll', update)
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5" style={{ background: T.border }}>
      <div className="h-full transition-all duration-75"
           style={{ width: `${progress}%`, background: `linear-gradient(to right, ${T.limeDeep}, ${T.lime})`,
                    boxShadow: `0 0 8px rgba(143,255,0,0.6)` }} />
    </div>
  )
}

// ── Back To Top ────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 800)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-24 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      style={{ background: T.lime, color: T.black }}>
      <ChevronRight size={18} className="-rotate-90" />
    </button>
  )
}

// ── Results Showcase ───────────────────────────────────────────
function ResultsShowcase() {
  const results = [
    { avatar: 'M', name: 'Marcus T.', role: 'eBay Power Seller',  before: 'Spent 3 hours manually checking niches. Hit dead stock twice in one month.',                           after: 'Found a $12K/month niche in under 8 minutes on his first Riazify scan.',         metric: '$12K',     label: 'niche found in 8 min',  color: T.limeDeep              },
    { avatar: 'J', name: 'James R.',  role: '7-Figure eBay Seller',before: 'Almost ordered 500 units of a pet grooming line with hidden saturation.',                             after: 'Riazify flagged the spike. Saved $3,500 in dead inventory on day one.',           metric: '$3.5K',    label: 'dead stock avoided',    color: '#16a34a', highlight: true },
    { avatar: 'S', name: 'Sarah K.',  role: 'eBay Dropshipper',    before: 'Always sourcing reactively — buying after trends peaked and margins collapsed.',                      after: 'Used AI forecast to source 200 units 3 weeks early. Sold out in 4 days.',        metric: '200 units',label: 'sold out in 4 days',    color: T.limeMid               },
  ]
  return (
    <section className="py-24" style={{ background: T.surface }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
               style={{ background: T.limeTint, borderColor: T.accentBorder }}>
            <Star size={12} style={{ color: T.limeDeep }} className="fill-current" />
            <span className="text-[11px] font-black tracking-wider" style={{ color: T.limeDeep }}>REAL SELLERS. REAL NUMBERS.</span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4" style={{ color: T.limeDeep }}>
            Results That Speak<br/><span style={{ color: T.carbon }}>For Themselves.</span>
          </h2>
          <p className="text-[17px] max-w-2xl mx-auto" style={{ color: T.sage }}>
            Not marketing fluff. Actual outcomes from eBay operators using Riazify every day.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((r, i) => (
            <div key={i} className="rounded-3xl border flex flex-col overflow-hidden"
                 style={{ background: r.highlight ? T.carbon : T.white, borderColor: r.highlight ? T.lime : T.border,
                          boxShadow: r.highlight ? '0 20px 60px rgba(143,255,0,0.15)' : '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div className="p-6 border-b" style={{ borderColor: r.highlight ? 'rgba(255,255,255,0.08)' : T.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                       style={{ background: '#FEE2E2', color: '#DC2626' }}>✕</div>
                  <p className="text-[11px] font-black tracking-wider" style={{ color: '#DC2626' }}>BEFORE RIAZIFY</p>
                </div>
                <p className="text-[13px] leading-relaxed italic" style={{ color: r.highlight ? '#94a3b8' : T.sage }}>"{r.before}"</p>
              </div>
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                       style={{ background: T.limeTint, color: T.limeDeep }}>✓</div>
                  <p className="text-[11px] font-black tracking-wider" style={{ color: T.limeDeep }}>AFTER RIAZIFY</p>
                </div>
                <p className="text-[13px] leading-relaxed mb-6" style={{ color: r.highlight ? '#e2e8f0' : T.carbon }}>"{r.after}"</p>
                <div className="p-4 rounded-2xl text-center mb-5"
                     style={{ background: r.highlight ? 'rgba(143,255,0,0.08)' : T.limeTint, border: `1px solid ${T.accentBorder}` }}>
                  <p className="text-[32px] font-black" style={{ color: r.color }}>{r.metric}</p>
                  <p className="text-[11px] font-semibold" style={{ color: T.sage }}>{r.label}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px]"
                       style={{ background: T.limeTint, color: T.limeDeep }}>{r.avatar}</div>
                  <div>
                    <p className="text-[13px] font-black" style={{ color: r.highlight ? T.white : T.carbon }}>{r.name}</p>
                    <p className="text-[11px]" style={{ color: T.sage }}>{r.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} style={{ color: T.lime }} className="fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ──────────────────────────────────────────────────
function FinalCTA() {
  const router = useRouter()
  return (
    <section className="py-24" style={{ background: T.white }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="rounded-3xl border p-12 lg:p-20 relative overflow-hidden"
             style={{ background: T.surface, borderColor: T.border,
                      boxShadow: "0 20px 60px rgba(74,143,0,0.08)" }}>
          <h2 className="text-[36px] lg:text-[52px] font-black leading-tight mb-6" style={{ color: T.limeDeep }}>
            Start Selling Smarter<br/><span style={{ color: T.carbon }}>Today. Not Tomorrow.</span>
          </h2>
          <p className="text-[17px] mb-10 max-w-xl mx-auto" style={{ color: T.sage }}>
            Join thousands of eBay operators who replaced guesswork with intelligence. Your first scan is free — no card required.
          </p>
          <button onClick={() => router.push("/auth/signup")}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-[18px] transition-all hover:scale-105"
            style={{ background: T.lime, color: T.black, boxShadow: "0 8px 30px rgba(143,255,0,0.4)" }}>
            Get Started Free <ArrowRight size={20} />
          </button>
          <p className="mt-5 text-[13px]" style={{ color: T.sage }}>
            No credit card required to test scan. Cancel plan in one click.
          </p>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
               style={{ background: "rgba(143,255,0,0.12)" }} />
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
               style={{ background: "rgba(74,143,0,0.06)" }} />
        </div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────
function Footer() {
  const [email, setEmail] = useState("")
  return (
    <footer className="py-16 border-t" style={{ background: T.carbon, borderColor: "#1a2410" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: T.lime }}>
                <Activity size={13} style={{ color: T.black }} />
              </div>
              <span className="text-[16px] font-black text-white">Riazify</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: T.sage }}>
              Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers.
            </p>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(143,255,0,0.2)" }}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email..."
                className="flex-1 px-4 py-2.5 text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", color: T.white }} />
              <button className="px-4 py-2.5 text-[12px] font-black shrink-0"
                      style={{ background: T.lime, color: T.black }}>
                Subscribe
              </button>
            </div>
          </div>

          {[
            { title: "Product", links: [
                { label: "Features",         href: "#features"  },
                { label: "Pricing",          href: "#pricing"   },
                { label: "Changelog",        href: "#"          },
                { label: "Roadmap",          href: "/roadmap"   },
                { label: "Status",           href: "/status"    },
                { label: "Chrome Extension", href: "#"          },
              ]},
            { title: "Company", links: [
                { label: "About",     href: "#" },
                { label: "Blog",      href: "#" },
                { label: "Careers",   href: "#" },
                { label: "Press Kit", href: "#" },
              ]},
            { title: "Legal", links: [
                { label: "Privacy Policy",   href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy",    href: "#" },
                { label: "GDPR",             href: "#" },
              ]},
          ].map(col => (
            <div key={col.title}>
              <p className="text-[12px] font-black tracking-wider mb-4 text-white">{col.title.toUpperCase()}</p>
              <div className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <a key={l.label} href={l.href}
                     className="text-[13px] transition-opacity hover:opacity-100 opacity-60"
                     style={{ color: l.label === 'Roadmap' || l.label === 'Status' ? T.lime : T.sage }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t flex items-center justify-between flex-wrap gap-4"
             style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[12px]" style={{ color: T.sage }}>© 2026 Riazify — All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "YouTube", "Discord"].map(s => (
              <a key={s} href="#" className="text-[12px] font-semibold transition-opacity hover:opacity-100 opacity-50"
                 style={{ color: T.sage }}>{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <ScrollProgress />
      <BackToTop />
      <Navbar />
      <HeroSection />
      <SocialProofStrip />
      <AntiLossBanner />
      <ToolShowcase />
      <LiveStats />
      <BentoGrid />
      <TrustSection />
      <ResultsShowcase />
      <HowItWorks />
      <TrustBadges />
      <WhoIsItFor />
      <FAQ />
      <Pricing />
      <FinalCTA />
      <Footer />
      <StickyMobileCTA />
    </main>
  )
}