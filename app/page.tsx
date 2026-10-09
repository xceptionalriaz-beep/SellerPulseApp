'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useBrand } from '@/hooks/useBrand'
import ToolsMegaMenu from '@/components/landing/ToolsMegaMenu'
import {
  Zap, TrendingUp, BarChart2, Shield, ArrowRight,
  ChevronRight, ChevronDown, Star, Menu, X,
  AlertTriangle, Target, Package, Search,
  DollarSign, ShoppingBag, Users, Eye, Cpu, Plus, Minus,
  ShieldCheck, Wand2, Palette
} from 'lucide-react'
import Pricing from '@/components/landing/Pricing'
import BlogStrip from '@/components/landing/BlogStrip'

// -- Riazify Color Role System Tokens ---------------------------
const T = {
  // Core Brand
  primary: '#7530fb',
  primaryHover: '#6020e0',
  primaryLight: '#f3eeff',
  accent: '#b8fa33',
  accentHover: '#a3e635',
  dark: '#1e1535',
  darkHover: '#2d1f4e',

  // Backgrounds
  bgApp: '#f8f7ff',
  bgWhite: '#ffffff',
  bgTint: '#f3eeff',

  // Text
  textPrimary: '#1f1d2e',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textWhite: '#ffffff',
  textPurple: '#7530fb',
  textDark: '#1e1535',

  // Borders
  border: '#ede9fe',
  borderInput: '#e5e0f5',
  borderFocus: '#7530fb',
  borderDark: '#2d1f4e',

  // Status & Utility
  success: '#16a34a',
  successBg: '#dcfce7',
  warning: '#d97706',
  warningBg: '#fef3c7',
  danger: '#ef4444',
  dangerBg: '#fee2e2',
  info: '#0ea5e9',
  infoBg: '#e0f2fe',
}

// -- Animated counter -------------------------------------------
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

// -- Navbar -----------------------------------------------------
function Navbar() {
  const router = useRouter()
  const { brand } = useBrand()
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToolsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setToolsOpen(false)
    }, 150)
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" role="navigation" aria-label="Main navigation"
      style={{
        background: T.dark,
        borderBottom: `1px solid ${T.borderDark}`,
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
          <img src={brand.logo_full_dark} alt={brand.brand_name} style={{ height: 32, width: 'auto' }} />
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div
            className="relative py-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-[14px] font-medium transition-colors" style={{ color: T.textWhite }}>
              Tools <ChevronDown size={14} className={`transition-transform duration-200 ${toolsOpen ? 'rotate-180 text-[#b8fa33]' : 'text-[#a89cc8]'}`} />
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 w-[780px] max-w-[90vw]">
                <div className="absolute -top-3 left-0 right-0 h-5 bg-transparent" />
                <ToolsMegaMenu onItemClick={() => setToolsOpen(false)} />
              </div>
            )}
          </div>
          {['Features', 'Pricing', 'How It Works', 'Blog'].map(item => (
            <a key={item}
              href={item === 'Pricing' ? '/pricing' : item === 'Features' ? '/features' : `#${item.toLowerCase().replace(' ', '-')}`}
              className="text-[14px] font-medium hover:text-[#b8fa33] transition-colors"
              style={{ color: '#a89cc8' }}>{item}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => router.push('/auth/login')}
            className="text-[14px] font-semibold px-4 py-2 rounded-xl text-white hover:bg-[#2d1f4e] transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Log in to your account">
            Log In
          </button>
          <button onClick={() => router.push('/auth/signup')}
            className="text-[14px] font-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 hover:bg-[#a3e635] shadow-md flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-lime-300"
            style={{ background: T.accent, color: T.dark }}
            aria-label="Sign up for free account">
            <span>Get Started Free</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(s => !s)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4 border-t"
          style={{ background: T.dark, borderColor: T.borderDark }}>
          {['Features', 'Tools', 'Pricing', 'How It Works', 'Blog'].map(item => (
            <a key={item}
              href={item === 'Pricing' ? '/pricing' : item === 'Features' ? '/features' : `#${item.toLowerCase().replace(' ', '-')}`}
              className="text-[15px] font-medium py-1 text-white hover:text-[#b8fa33]"
              onClick={() => setOpen(false)}>{item}</a>
          ))}
          <button onClick={() => router.push('/auth/signup')}
            className="mt-2 py-3 rounded-xl font-black text-[15px] cursor-pointer"
            style={{ background: T.accent, color: T.dark }}>
            Get Started Free →
          </button>
        </div>
      )}
    </nav>
  )
}

// -- Hero -------------------------------------------------------
function HeroSection() {
  const router = useRouter()
  const [niche, setNiche] = useState('')

  function handleScan() {
    if (!niche.trim()) return
    router.push(`/dashboard/product-research?q=${encodeURIComponent(niche)}`)
  }

  return (
    <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: '#ffffff' }}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf9ff] to-white pointer-events-none" />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full text-center">

          {/* Simple badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-gray-200 bg-white shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Trusted by 12,000+ eBay sellers</span>
          </div>

          {/* Clean headline - Auto responsive */}
          <h1 className="text-[clamp(2rem,5vw,4rem)] font-black mb-6 tracking-tight leading-[1.15] max-w-[90vw] mx-auto" style={{ color: T.textPrimary }}>
            The{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-ai-gradient font-black">
                AI-Powered
              </span>
              <span className="absolute -top-1.5 -right-5 text-[0.22em] font-black tracking-tight px-1.5 py-0.5 rounded-full bg-purple-600 text-white whitespace-nowrap shadow-sm">
                NEW
              </span>
            </span>
            {' '}eBay Intelligence Platform.{' '}
            <span style={{ color: T.primary }}>Find Winners.</span>{' '}
            <span style={{ color: T.textPrimary }}>List Faster.</span>{' '}
            <span style={{ color: T.primary }}>Protect Profit.</span>
          </h1>

          {/* Simple subheadline */}
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Real-time market insights, AI-powered listing creation, smart order management, and inventory tracking — everything you need to scale your eBay business without the guesswork.
          </p>

          <style jsx>{`
            @keyframes ai-gradient {
              0% {
                background-position: 0% 50%;
                filter: hue-rotate(0deg);
              }
              50% {
                background-position: 100% 50%;
                filter: hue-rotate(20deg);
              }
              100% {
                background-position: 0% 50%;
                filter: hue-rotate(0deg);
              }
            }
            .animate-ai-gradient {
              background-size: 200% 200%;
              animation: ai-gradient 4s ease-in-out infinite;
            }
          `}</style>

          {/* Clean search input */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-gray-200 p-2 shadow-sm hover:border-gray-300 transition-colors focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Enter an eBay product or niche (e.g., iPhone 14 cases)"
                className="flex-1 px-4 py-3 text-base outline-none bg-transparent"
                style={{ color: T.textPrimary }}
                aria-label="Product or niche search"
              />
              <button
                onClick={handleScan}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-purple-300"
                style={{ background: T.primary, color: 'white' }}
                aria-label="Analyze product niche"
              >
                Analyze Now
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Free analysis • No credit card required</p>
          </div>

          {/* Simple trust indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-gray-400" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-gray-400" />
              <span>30-second setup</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-400" />
              <span>98% AI accuracy</span>
            </div>
          </div>

          {/* Clean stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mt-16 pt-12 border-t border-gray-200">
            <div className="text-center">
              <p className="text-3xl font-bold mb-1" style={{ color: T.primary }}>12K+</p>
              <p className="text-sm text-gray-600">Active sellers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1" style={{ color: T.primary }}>$4.2M+</p>
              <p className="text-sm text-gray-600">Revenue protected</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1" style={{ color: T.primary }}>98%</p>
              <p className="text-sm text-gray-600">Forecast accuracy</p>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8f7ff] to-transparent pointer-events-none" />
    </section>
  )
}

// -- Social Proof Strip -----------------------------------------
function SocialProofStrip() {
  const items = [
    '12,000+ Active Sellers', '$4.2M+ Revenue Protected', '98% AI Accuracy',
    '50K+ Niches Tracked Daily', '4.9/5 Average Rating', '30-Second Setup',
    'Zero Dead Stock Guarantee', 'US, UK, DE, IT Markets',
  ]
  const doubled = [...items, ...items]
  return (
    <div className="py-4 border-y overflow-hidden group" style={{ background: T.dark, borderColor: T.borderDark }}>
      <div className="flex gap-12 whitespace-nowrap group-hover:[animation-play-state:paused]" style={{ animation: 'marquee 30s linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} className="text-[13px] font-black shrink-0 flex items-center gap-2 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b8fa33]" />
            <span>{item}</span>
            <span className="mx-6 text-[#2d1f4e]">|</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  )
}

// -- Anti-Loss Banner -------------------------------------------
function AntiLossBanner() {
  return (
    <section className="py-24" style={{ background: T.bgApp }}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
          style={{ background: T.primaryLight, borderColor: T.border }}>
          <Shield size={12} style={{ color: T.primary }} />
          <span className="text-[11px] font-black tracking-wider" style={{ color: T.primary }}>DEAD STOCK PREVENTION ENGINE</span>
        </div>
        <h2 className="text-[36px] lg:text-[48px] font-black leading-tight mb-6 font-syne" style={{ color: T.textDark }}>
          Know Before You Buy.<br /><span style={{ color: T.primary }}>Not After You're Stuck.</span>
        </h2>
        <p className="text-[17px] leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: T.textSecondary }}>
          Before you deploy capital, Riazify cross-references{' '}
          <span className="font-bold px-1.5 py-0.5 rounded" style={{ background: T.accent, color: T.textDark }}>active wholesale listing counts</span>{' '}
          against historical sell-through velocity to calculate true seller competition — in real time.
        </p>
        <div className="rounded-3xl border p-8 lg:p-12 max-w-3xl mx-auto bg-white shadow-xl"
          style={{ borderColor: T.border, boxShadow: '0 12px 40px rgba(117,48,251,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-bold" style={{ color: T.textSecondary }}>Market Saturation Pulse Meter</p>
            <span className="text-[11px] font-black px-3 py-1 rounded-full" style={{ background: T.primaryLight, color: T.primary }}>LIVE</span>
          </div>
          <div className="h-4 rounded-full relative overflow-hidden mb-3" style={{ background: T.primaryLight }}>
            <div className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: '24%', background: `linear-gradient(to right, ${T.primary}, ${T.accent})`, boxShadow: `0 0 12px rgba(184,250,51,0.6)` }} />
          </div>
          <div className="flex items-center justify-between mb-8">
            <span className="text-[11px]" style={{ color: T.textSecondary }}>Oversaturated</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: T.accent, boxShadow: `0 0 6px ${T.accent}` }} />
              <span className="text-[13px] font-black" style={{ color: T.primary }}>Saturation: Low (Ideal) — 24%</span>
            </div>
            <span className="text-[11px]" style={{ color: T.textSecondary }}>Wide open</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Sellers', value: '312', sub: 'in this niche' },
              { label: 'Avg Sell-Through', value: '48.2%', sub: 'last 30 days' },
              { label: 'Market Vol.', value: '$45.2K', sub: 'monthly est.' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-2xl text-center border" style={{ background: T.bgApp, borderColor: T.border }}>
                <p className="text-[22px] font-black font-syne mb-0.5" style={{ color: T.primary }}>{s.value}</p>
                <p className="text-[11px] font-bold mb-0.5" style={{ color: T.textDark }}>{s.label}</p>
                <p className="text-[10px]" style={{ color: T.textSecondary }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// -- Tool Showcase ----------------------------------------------
function ToolShowcase() {
  const router = useRouter()
  const tools = [
    { icon: BarChart2, name: 'Title Builder', desc: 'AI-powered eBay title generator with keyword injection, VeRO protection, and unlimited variations.', badge: 'AI Powered', link: '/tools/title-builder' },
    { icon: Palette, name: 'Templates Studio', desc: 'Design beautiful custom eBay listing templates with drag-and-drop and HTML builders.', badge: 'Design', link: '/tools/templates-studio' },
    { icon: Wand2, name: 'Listing Generator', desc: 'Create beautiful, SEO-optimized eBay listings in seconds with AI-driven descriptions.', badge: 'New', link: '/tools/listing-generator' },
    { icon: ShoppingBag, name: 'Orders Manager', desc: 'Risk-scored order management with buyer profile analysis and dispute protection.', badge: 'Essential', link: '/tools/orders' },
    { icon: DollarSign, name: 'Profit Calculator', desc: 'Calculate true eBay net profit with fees, shipping, FX rates, and ad costs in real-time.', badge: 'Pro Tool', link: '/tools/profit-calculator' },
    { icon: Package, name: 'Inventory Manager', desc: 'Track your full inventory pipeline with AI forecasting, reorder alerts, and dead stock warnings.', badge: 'New', link: '/tools/inventory' },
  ]
  return (
    <section id="features" className="py-24" style={{ background: T.bgWhite }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
            style={{ background: T.primaryLight, borderColor: T.border }}>
            <Cpu size={12} style={{ color: T.primary }} />
            <span className="text-[11px] font-black tracking-wider" style={{ color: T.primary }}>THE COMPLETE TOOLKIT</span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4 font-syne" style={{ color: T.textDark }}>
            Every Tool You Need.<br /><span style={{ color: T.primary }}>Nothing You Don't.</span>
          </h2>
          <p className="text-[17px] max-w-2xl mx-auto" style={{ color: T.textSecondary }}>
            Six purpose-built intelligence tools. One unified dashboard. Zero subscription bloat.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => {
            const Icon = tool.icon
            return (
              <div key={i}
                onClick={() => router.push(tool.link)}
                className="group rounded-3xl border p-8 flex flex-col gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white"
                style={{ borderColor: T.border, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(117,48,251,0.12)';
                  e.currentTarget.style.borderColor = T.primary
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = T.border
                }}>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: T.primaryLight, border: `1px solid ${T.border}` }}>
                    <Icon size={22} style={{ color: T.primary }} />
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase"
                    style={{ background: T.accent, color: T.textDark }}>{tool.badge}</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-black font-syne mb-2" style={{ color: T.textDark }}>{tool.name}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: T.textSecondary }}>{tool.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-auto text-[13px] font-bold" style={{ color: T.primary }}>
                  <span>Explore tool</span>
                  <ChevronRight size={15} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// -- Live Stats -------------------------------------------------
function LiveStats() {
  const stats = [
    { val: 48392, label: 'Niche Scans Today', suffix: '+', icon: Search },
    { val: 127, label: 'Niches Tracked Live', suffix: 'K', icon: TrendingUp },
    { val: 12841, label: 'Sellers Active Now', suffix: '+', icon: Users },
    { val: 4200, label: 'Revenue Protected', prefix: '$', suffix: 'K+', icon: ShieldCheck },
  ]
  return (
    <section className="py-20" style={{ background: T.dark }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-[12px] font-black tracking-[2px] mb-10 text-[#a89cc8]">
          RIAZIFY BY THE NUMBERS — LIVE
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="text-center p-8 rounded-3xl border"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: T.borderDark }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: T.primaryLight }}>
                  <Icon size={18} style={{ color: T.primary }} />
                </div>
                <p className="text-[32px] font-black font-syne mb-1 text-white">
                  <Counter to={s.val} prefix={s.prefix ?? ''} suffix={s.suffix} />
                </p>
                <p className="text-[13px] font-semibold text-[#a89cc8]">{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// -- Bento Grid -------------------------------------------------
function BentoGrid() {
  return (
    <section className="py-24" style={{ background: T.bgApp }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4 font-syne" style={{ color: T.textDark }}>
            Three Pillars.<br /><span style={{ color: T.primary }}>One Unfair Advantage.</span>
          </h2>
          <p className="text-[17px] max-w-2xl mx-auto" style={{ color: T.textSecondary }}>
            Every intelligence layer in Riazify is engineered around one obsession — getting you to the right product before everyone else.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-3xl border p-8 flex flex-col gap-6 bg-white shadow-sm"
            style={{ borderColor: T.border }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: T.primaryLight, border: `1px solid ${T.border}` }}>
                <AlertTriangle size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <p className="text-[13px] font-black" style={{ color: T.textDark }}>Supply Chain Shockwaves</p>
                <p className="text-[11px]" style={{ color: T.textSecondary }}>Event Intelligence Engine</p>
              </div>
            </div>
            <div className="rounded-2xl p-4 border" style={{ background: T.bgApp, borderColor: T.border }}>
              <svg viewBox="0 0 280 70" className="w-full">
                <defs>
                  <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7530fb" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#7530fb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,50 C30,45 50,40 80,42 C110,44 120,30 130,52 C140,58 160,55 190,48 C220,40 250,35 280,32 L280,70 L0,70 Z" fill="url(#bg1)" />
                <path d="M0,50 C30,45 50,40 80,42 C110,44 120,30 130,52 C140,58 160,55 190,48 C220,40 250,35 280,32" fill="none" stroke="#7530fb" strokeWidth="2" strokeLinecap="round" />
                <line x1="128" y1="0" x2="128" y2="70" stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1.5" />
                <rect x="84" y="3" width="88" height="16" rx="4" fill="#fee2e2" />
                <text x="128" y="14" fontSize="7" fill="#b91c1c" textAnchor="middle" fontWeight="bold">Price Drop Event</text>
                <circle cx="128" cy="52" r="3.5" fill="#ef4444" />
              </svg>
            </div>
            <div>
              <h3 className="text-[18px] font-black font-syne mb-2" style={{ color: T.textDark }}>
                Auto-flag supplier anomalies <span style={{ color: T.primary }}>before they tank your rank.</span>
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: T.textSecondary }}>
                Riazify monitors price drop events, stock spikes, and listing velocity changes in real time — alerting you the moment your niche is disrupted.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-3xl border p-8 bg-white shadow-sm" style={{ borderColor: T.border }}>
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: T.primaryLight, border: `1px solid ${T.border}` }}>
                      <TrendingUp size={18} style={{ color: T.primary }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black" style={{ color: T.textDark }}>Forward-Looking Demand</p>
                      <p className="text-[11px]" style={{ color: T.textSecondary }}>AI Forecasting Model</p>
                    </div>
                  </div>
                  <h3 className="text-[18px] font-black font-syne mb-2" style={{ color: T.textDark }}>
                    Stop driving by <span style={{ color: T.primary }}>looking in the rearview mirror.</span>
                  </h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: T.textSecondary }}>
                    Legacy tools show where demand was. Riazify shows where it's going — with AI projection nodes extending 7, 30, and 90 days forward.
                  </p>
                </div>
                <div className="rounded-2xl p-3 shrink-0 w-full lg:w-48 border"
                  style={{ background: T.bgApp, borderColor: T.border }}>
                  <svg viewBox="0 0 140 60" className="w-full">
                    <defs>
                      <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7530fb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#7530fb" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,45 C20,40 40,35 60,30 C80,25 90,28 100,25 L100,60 L0,60 Z" fill="url(#bg2)" />
                    <path d="M0,45 C20,40 40,35 60,30 C80,25 90,28 100,25" fill="none" stroke="#7530fb" strokeWidth="2" strokeLinecap="round" />
                    <line x1="100" y1="0" x2="100" y2="60" stroke="#9ca3af" strokeDasharray="2 2" strokeWidth="1" />
                    <text x="97" y="8" fontSize="6" fill="#9ca3af" textAnchor="end" fontWeight="bold">TODAY</text>
                    <path d="M100,25 C115,22 125,20 140,18" fill="none" stroke="#b8fa33" strokeDasharray="5 3" strokeWidth="2" />
                    <circle cx="140" cy="18" r="3" fill="white" stroke="#7530fb" strokeWidth="1.5" />
                  </svg>
                  <p className="text-[9px] font-black text-center mt-1" style={{ color: T.primary }}>AI Projection Active</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border p-8 bg-white shadow-sm" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: T.primaryLight, border: `1px solid ${T.border}` }}>
                  <Package size={18} style={{ color: T.primary }} />
                </div>
                <div>
                  <p className="text-[13px] font-black" style={{ color: T.textDark }}>MAP Compliance Tracker</p>
                  <p className="text-[11px]" style={{ color: T.textSecondary }}>Wholesale Intelligence</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: T.border }}>
                <div className="grid grid-cols-4 px-4 py-2.5 text-[10px] font-black tracking-wider text-white"
                  style={{ background: T.dark }}>
                  {['BRAND', 'MAP PRICE', 'YOUR PRICE', 'STATUS'].map(h => <span key={h}>{h}</span>)}
                </div>
                {[
                  ['Anker', '$29.99', '$28.50', 'Below MAP', '#ef4444', '#fee2e2'],
                  ['Belkin', '$49.99', '$52.00', 'Compliant', '#16a34a', '#dcfce7'],
                  ['Aukey', '$19.99', '$19.99', 'Compliant', '#16a34a', '#dcfce7'],
                ].map(([brand, map, price, status, statusColor, statusBg], i) => (
                  <div key={i} className="grid grid-cols-4 px-4 py-2.5 text-[11px] border-t"
                    style={{ borderColor: T.border, background: i % 2 === 0 ? T.bgWhite : T.bgApp }}>
                    <span className="font-bold" style={{ color: T.textDark }}>{brand}</span>
                    <span style={{ color: T.textSecondary }}>{map}</span>
                    <span className="font-bold" style={{ color: T.textDark }}>{price}</span>
                    <span className="font-bold text-[10px] px-2 py-0.5 rounded w-fit"
                      style={{ color: statusColor, background: statusBg }}>{status}</span>
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

// -- Trust Section ----------------------------------------------
function TrustSection() {
  return (
    <section className="py-24" style={{ background: T.bgWhite }}>
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-[12px] font-black tracking-[2px] mb-10" style={{ color: T.textSecondary }}>
          DATA INTEGRITY PIPELINES CONNECTED TO
        </p>
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap mb-20">
          {['eBay API', 'Supabase', 'Amazon SP', 'AliExpress', 'Google Trends', 'PayPal'].map(p => (
            <div key={p} className="px-5 py-2.5 rounded-xl border text-[13px] font-bold"
              style={{ background: T.bgApp, borderColor: T.border, color: T.textSecondary }}>{p}</div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: '"Riazify flagged a hidden saturation spike on a pet grooming line I was about to buy in bulk. Saved my business over $3,500 in dead inventory on day one."', name: 'James R.', role: '7-Figure eBay Seller — Pet Supplies', rating: 5 },
            { quote: '"The AI forecast is scary accurate. I sourced 200 units of a trending product 3 weeks before it went viral on eBay. Sold out in 4 days."', name: 'Sarah K.', role: 'eBay Dropshipper — Electronics', rating: 5 },
            { quote: '"Finally a tool built for eBay operators, not Amazon sellers. The Title Builder alone saved me 10 hours a week."', name: 'Marcus T.', role: 'eBay Power Seller — Home & Garden', rating: 5 },
          ].map((t, i) => (
            <div key={i} className="rounded-3xl border p-8 flex flex-col gap-5 relative overflow-hidden bg-white shadow-xs"
              style={{ borderColor: T.border }}>
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} style={{ color: '#fbbf24' }} className="fill-current" />
                ))}
              </div>
              <p className="text-[14px] leading-relaxed font-medium" style={{ color: T.textPrimary }}>{t.quote}</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px]"
                  style={{ background: T.primaryLight, color: T.primary }}>{t.name[0]}</div>
                <div>
                  <p className="font-black text-[13px]" style={{ color: T.textDark }}>{t.name}</p>
                  <p className="text-[11px]" style={{ color: T.textSecondary }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// -- How It Works -----------------------------------------------
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Enter Your Niche', desc: 'Type any product or keyword. Riazify instantly pulls live eBay market data, saturation scores, and trend velocity.', icon: Target },
    { n: '02', title: 'Read the Intelligence', desc: 'See historical actuals, AI forecast projections, competitor analysis, and MAP compliance — all in one unified dashboard.', icon: BarChart2 },
    { n: '03', title: 'Move with Confidence', desc: 'Source the right products, set the right prices, and scale your eBay business with predictive intelligence — not guesswork.', icon: TrendingUp },
  ]
  return (
    <section id="how-it-works" className="py-24" style={{ background: T.bgApp }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4 font-syne" style={{ color: T.textDark }}>
            Up and Running<br /><span style={{ color: T.primary }}>in 30 Seconds.</span>
          </h2>
          <p className="text-[17px]" style={{ color: T.textSecondary }}>No technical setup. No API keys. Just results.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="rounded-3xl border p-8 h-full bg-white shadow-sm" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[40px] font-black font-syne" style={{ color: T.primary }}>{s.n}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.primaryLight }}>
                    <Icon size={18} style={{ color: T.primary }} />
                  </div>
                </div>
                <h3 className="text-[18px] font-black font-syne mb-3" style={{ color: T.textDark }}>{s.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: T.textSecondary }}>{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// -- FAQ --------------------------------------------------------
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: 'Is Riazify only for eBay sellers?', a: "Currently yes — Riazify is purpose-built for eBay operators. We're expanding to Amazon and Walmart in Q4 2026. eBay-focused tools mean deeper data, better accuracy, and zero feature bloat from other marketplaces." },
    { q: 'How accurate is the AI forecast?', a: 'Our hybrid regressor model achieves 98% accuracy on 7-day forecasts and 91% on 30-day projections, validated against 18 months of live eBay sales data. Each prediction comes with a confidence score so you always know how much to trust it.' },
    { q: 'What does the free plan include?', a: "The free plan includes 5 niche scans per day, basic trend charts, a saturation meter, and the profit calculator. No credit card required. Upgrade to Pro when you're ready to scale." },
    { q: 'Can I cancel my subscription anytime?', a: 'Absolutely. Cancel in one click from your account settings. No lock-in contracts, no cancellation fees, no questions asked. Your data remains accessible for 30 days after cancellation.' },
    { q: 'How does Riazify get its eBay data?', a: "We connect directly to the official eBay Partner API, refreshing market data every 4 hours. Combined with our AI processing layer, you get both real-time accuracy and forward-looking intelligence that raw API data alone can't provide." },
    { q: 'Is my eBay account information safe?', a: 'Riazify never stores your eBay login credentials. We use OAuth 2.0 for secure read-only market data access. Your account data is encrypted at rest and in transit using AES-256 and TLS 1.3.' },
  ]
  return (
    <section className="py-24" style={{ background: T.bgWhite }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4 font-syne" style={{ color: T.textDark }}>
            Questions?<br /><span style={{ color: T.primary }}>We've Got Answers.</span>
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden transition-all bg-white shadow-xs"
              style={{ borderColor: open === i ? T.primary : T.border }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-[#faf9ff]" style={{ color: T.textDark }}>
                <span className="text-[15px] font-bold pr-4 font-syne">{faq.q}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: open === i ? T.primary : T.primaryLight, color: open === i ? '#ffffff' : T.primary }}>
                  {open === i ? <Minus size={12} /> : <Plus size={12} />}
                </div>
              </button>
              {open === i && (
                <div className="px-6 pb-6 pt-1">
                  <p className="text-[14px] leading-relaxed" style={{ color: T.textSecondary }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// -- Trust Badges -----------------------------------------------
function TrustBadges() {
  const badges = [
    { label: 'SSL Secured', sub: '256-bit encryption' },
    { label: 'GDPR Compliant', sub: 'Full data protection' },
    { label: 'eBay API Partner', sub: 'Official data source' },
    { label: '99.9% Uptime', sub: 'SLA guaranteed' },
    { label: 'OAuth 2.0', sub: 'Secure auth standard' },
    { label: 'PCI Compliant', sub: 'Safe payments' },
  ]
  return (
    <section className="py-12 border-y" style={{ background: T.bgApp, borderColor: T.border }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-[11px] font-black tracking-[2px] mb-8" style={{ color: T.textSecondary }}>
          ENTERPRISE-GRADE SECURITY &amp; COMPLIANCE
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border text-center bg-white shadow-xs"
              style={{ borderColor: T.border }}>
              <ShieldCheck size={22} style={{ color: T.primary }} />
              <p className="text-[12px] font-black mt-1" style={{ color: T.textDark }}>{b.label}</p>
              <p className="text-[10px]" style={{ color: T.textSecondary }}>{b.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// -- Who Is Riazify For -----------------------------------------
function WhoIsItFor() {
  const router = useRouter()
  const personas = [
    { title: 'New eBay Sellers', pain: "You don't know which products to sell or how to avoid overcrowded niches that kill margins.", solution: "Riazify's saturation meter and AI demand forecasting tells you exactly where to start — before you spend a single dollar on inventory.", cta: 'Start for free →', stats: [{ val: '< 30 sec', label: 'to first niche scan' }, { val: '5 scans', label: 'free every day' }], link: '/auth/signup' },
    { title: 'Scaling Operators', pain: "You're growing but flying blind — no reliable data on where demand is heading or when to restock.", solution: "Riazify's hybrid AI regressor gives you 7, 30, and 90-day forecasts with confidence scores — so you source ahead of the curve, not behind it.", cta: 'Upgrade to Pro →', stats: [{ val: '98%', label: 'AI forecast accuracy' }, { val: '$4.2M+', label: 'revenue protected' }], highlight: true, link: '/pricing' },
    { title: 'Agencies & Resellers', pain: 'Managing multiple eBay accounts with no centralized intelligence layer is burning time and leaving money on the table.', solution: 'Riazify Business gives you 5 user seats, API access, white-label reports, and a dedicated success manager — everything agencies need to deliver results at scale.', cta: 'Contact Sales →', stats: [{ val: '5 seats', label: 'per Business plan' }, { val: 'API', label: 'full access' }], link: '/contact' },
  ]
  return (
    <section className="py-24" style={{ background: T.bgWhite }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
            style={{ background: T.primaryLight, borderColor: T.border }}>
            <Users size={12} style={{ color: T.primary }} />
            <span className="text-[11px] font-black tracking-wider" style={{ color: T.primary }}>BUILT FOR EVERY STAGE</span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4 font-syne" style={{ color: T.textDark }}>
            Who Is Riazify For?<br /><span style={{ color: T.primary }}>Everyone Selling on eBay.</span>
          </h2>
          <p className="text-[17px] max-w-2xl mx-auto" style={{ color: T.textSecondary }}>
            Whether you're listing your first item or managing a $1M/year operation — Riazify scales with you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p, i) => (
            <div key={i} className="rounded-3xl border p-8 flex flex-col gap-6 relative overflow-hidden transition-all"
              style={{
                background: p.highlight ? T.dark : T.bgWhite, borderColor: p.highlight ? T.primary : T.border,
                boxShadow: p.highlight ? '0 20px 60px rgba(117,48,251,0.2)' : '0 2px 8px rgba(0,0,0,0.02)'
              }}>
              {p.highlight && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase"
                  style={{ background: T.accent, color: T.textDark }}>MOST POPULAR</div>
              )}
              <div>
                <h3 className="text-[22px] font-black font-syne mb-4" style={{ color: p.highlight ? T.textWhite : T.textDark }}>{p.title}</h3>
                <div className="p-3.5 rounded-xl mb-4" style={{ background: p.highlight ? 'rgba(239,68,68,0.15)' : '#FFF5F5', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-[12px] font-bold" style={{ color: '#ef4444' }}>The Problem:</p>
                  <p className="text-[13px] mt-1" style={{ color: p.highlight ? '#fca5a5' : '#7f1d1d' }}>{p.pain}</p>
                </div>
                <div className="p-3.5 rounded-xl" style={{ background: p.highlight ? 'rgba(117,48,251,0.25)' : T.primaryLight, border: `1px solid ${p.highlight ? T.borderDark : T.border}` }}>
                  <p className="text-[12px] font-bold" style={{ color: p.highlight ? T.accent : T.primary }}>The Riazify Fix:</p>
                  <p className="text-[13px] mt-1" style={{ color: p.highlight ? '#d4caf7' : T.textDark }}>{p.solution}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {p.stats.map((s, j) => (
                  <div key={j} className="p-3 rounded-xl text-center"
                    style={{ background: p.highlight ? 'rgba(255,255,255,0.06)' : T.bgApp, border: `1px solid ${p.highlight ? T.borderDark : T.border}` }}>
                    <p className="text-[16px] font-black font-syne" style={{ color: p.highlight ? T.accent : T.primary }}>{s.val}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: p.highlight ? '#a89cc8' : T.textSecondary }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push(p.link)}
                className="w-full py-3.5 rounded-xl font-black text-[14px] transition-all hover:scale-105 mt-auto cursor-pointer"
                style={{
                  background: p.highlight ? T.accent : T.primaryLight, color: p.highlight ? T.textDark : T.primary,
                  border: p.highlight ? 'none' : `1px solid ${T.border}`
                }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// -- Sticky Mobile CTA ------------------------------------------
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
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ background: T.bgWhite, borderColor: T.border }}>
        <div>
          <p className="text-[13px] font-black font-syne" style={{ color: T.textDark }}>Free scan — no card needed</p>
          <p className="text-[11px]" style={{ color: T.textSecondary }}>Join 12,000+ eBay sellers</p>
        </div>
        <button onClick={() => router.push('/auth/signup')}
          className="px-5 py-2.5 rounded-xl font-black text-[13px] shrink-0 cursor-pointer"
          style={{ background: T.accent, color: T.textDark }}>
          Get Started →
        </button>
      </div>
    </div>
  )
}

// -- Scroll Progress Bar ----------------------------------------
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
        style={{
          width: `${progress}%`, background: `linear-gradient(to right, ${T.primary}, ${T.accent})`,
          boxShadow: `0 0 8px rgba(117,48,251,0.6)`
        }} />
    </div>
  )
}

// -- Back To Top ------------------------------------------------
function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 800)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-24 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-lime-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      style={{ background: T.accent, color: T.textDark }}
      aria-label="Back to top">
      <ChevronRight size={18} className="-rotate-90" />
    </button>
  )
}

// -- Results Showcase -------------------------------------------
function ResultsShowcase() {
  const results = [
    { avatar: 'M', name: 'Marcus T.', role: 'eBay Power Seller', before: 'Spent 3 hours manually checking niches. Hit dead stock twice in one month.', after: 'Found a $12K/month niche in under 8 minutes on his first Riazify scan.', metric: '$12K', label: 'niche found in 8 min', color: T.primary },
    { avatar: 'J', name: 'James R.', role: '7-Figure eBay Seller', before: 'Almost ordered 500 units of a pet grooming line with hidden saturation.', after: 'Riazify flagged the spike. Saved $3,500 in dead inventory on day one.', metric: '$3.5K', label: 'dead stock avoided', color: '#16a34a', highlight: true },
    { avatar: 'S', name: 'Sarah K.', role: 'eBay Dropshipper', before: 'Always sourcing reactively — buying after trends peaked and margins collapsed.', after: 'Used AI forecast to source 200 units 3 weeks early. Sold out in 4 days.', metric: '200 units', label: 'sold out in 4 days', color: T.primary },
  ]
  return (
    <section className="py-24" style={{ background: T.bgApp }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
            style={{ background: T.primaryLight, borderColor: T.border }}>
            <Star size={12} style={{ color: T.primary }} className="fill-current" />
            <span className="text-[11px] font-black tracking-wider" style={{ color: T.primary }}>REAL SELLERS. REAL NUMBERS.</span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-black mb-4 font-syne" style={{ color: T.textDark }}>
            Results That Speak<br /><span style={{ color: T.primary }}>For Themselves.</span>
          </h2>
          <p className="text-[17px] max-w-2xl mx-auto" style={{ color: T.textSecondary }}>
            Not marketing fluff. Actual outcomes from eBay operators using Riazify every day.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((r, i) => (
            <div key={i} className="rounded-3xl border flex flex-col overflow-hidden transition-all"
              style={{
                background: r.highlight ? T.dark : T.bgWhite, borderColor: r.highlight ? T.primary : T.border,
                boxShadow: r.highlight ? '0 20px 60px rgba(117,48,251,0.2)' : '0 2px 8px rgba(0,0,0,0.03)'
              }}>
              <div className="p-6 border-b" style={{ borderColor: r.highlight ? T.borderDark : T.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: '#fee2e2', color: '#ef4444' }}>✕</div>
                  <p className="text-[11px] font-black tracking-wider" style={{ color: '#ef4444' }}>BEFORE RIAZIFY</p>
                </div>
                <p className="text-[13px] leading-relaxed italic" style={{ color: r.highlight ? '#a89cc8' : T.textSecondary }}>"{r.before}"</p>
              </div>
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: r.highlight ? T.accent : T.primaryLight, color: r.highlight ? T.textDark : T.primary }}>✓</div>
                  <p className="text-[11px] font-black tracking-wider" style={{ color: r.highlight ? T.accent : T.primary }}>AFTER RIAZIFY</p>
                </div>
                <p className="text-[13px] leading-relaxed mb-6" style={{ color: r.highlight ? T.textWhite : T.textPrimary }}>"{r.after}"</p>
                <div className="p-4 rounded-2xl text-center mb-5 border"
                  style={{ background: r.highlight ? 'rgba(255,255,255,0.05)' : T.primaryLight, borderColor: r.highlight ? T.borderDark : T.border }}>
                  <p className="text-[32px] font-black font-syne" style={{ color: r.highlight ? T.accent : r.color }}>{r.metric}</p>
                  <p className="text-[11px] font-semibold" style={{ color: r.highlight ? '#a89cc8' : T.textSecondary }}>{r.label}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px]"
                    style={{ background: r.highlight ? T.primary : T.primaryLight, color: r.highlight ? '#ffffff' : T.primary }}>{r.avatar}</div>
                  <div>
                    <p className="text-[13px] font-black font-syne" style={{ color: r.highlight ? T.textWhite : T.textDark }}>{r.name}</p>
                    <p className="text-[11px]" style={{ color: r.highlight ? '#a89cc8' : T.textSecondary }}>{r.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} style={{ color: '#fbbf24' }} className="fill-current" />
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

// -- Final CTA --------------------------------------------------
function FinalCTA() {
  const router = useRouter()
  return (
    <section className="py-24" style={{ background: T.bgWhite }}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="rounded-3xl border p-12 lg:p-20 relative overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${T.dark} 0%, #271c42 100%)`,
            borderColor: T.borderDark,
          }}>
          <h2 className="text-[36px] lg:text-[52px] font-black leading-tight mb-6 font-syne text-white">
            Start Selling Smarter<br /><span style={{ color: T.accent }}>Today. Not Tomorrow.</span>
          </h2>
          <p className="text-[17px] mb-10 max-w-xl mx-auto text-[#d4caf7]">
            Join thousands of eBay operators who replaced guesswork with intelligence. Your first scan is free — no card required.
          </p>
          <button onClick={() => router.push("/auth/signup")}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-[18px] transition-all hover:scale-105 hover:bg-[#a3e635] shadow-lg cursor-pointer focus:outline-none focus:ring-4 focus:ring-lime-300"
            style={{ background: T.accent, color: T.textDark }}
            aria-label="Sign up for free account">
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </button>
          <p className="mt-5 text-[13px] text-[#a89cc8]">
            No credit card required to test scan. Cancel plan in one click.
          </p>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(117,48,251,0.3)' }} />
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(184,250,51,0.15)' }} />
        </div>
      </div>
    </section>
  )
}

// -- Footer -----------------------------------------------------
function Footer() {
  const [email, setEmail] = useState("")
  return (
    <footer className="py-16 border-t" style={{ background: T.dark, borderColor: T.borderDark }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-syne font-black text-xs"
                style={{ background: T.primary, color: T.accent }}>
                R
              </div>
              <span className="text-[18px] font-black text-white font-syne">Riazify</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-5 text-[#a89cc8]">
              Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers.
            </p>
            <div className="flex rounded-xl overflow-hidden border p-0.5 bg-[#271c42]" style={{ borderColor: T.borderDark }}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email..."
                className="flex-1 px-4 py-2.5 text-[13px] outline-none bg-transparent text-white" />
              <button className="px-5 py-2.5 text-[12px] font-black rounded-lg transition-colors cursor-pointer"
                style={{ background: T.accent, color: T.textDark }}>
                Subscribe
              </button>
            </div>
          </div>

          {[
            {
              title: "Product", links: [
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "/pricing" },
                { label: "Changelog", href: "/changelog" },
                { label: "Roadmap", href: "/roadmap" },
                { label: "Status", href: "/status" },
                { label: "Chrome Extension", href: "#" },
              ]
            },
            {
              title: "Company", links: [
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Careers", href: "/careers" },
                { label: "Press Kit", href: "/press-kit" },
                { label: "Affiliates", href: "/affiliate" },
              ]
            },
            {
              title: "Legal", links: [
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Cookie Policy", href: "/cookie-policy" },
                { label: "GDPR", href: "/gdpr" },
              ]
            },
          ].map(col => (
            <div key={col.title}>
              <p className="text-[12px] font-black tracking-wider mb-4 text-white font-syne">{col.title.toUpperCase()}</p>
              <div className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <a key={l.label} href={l.href}
                    className="text-[13px] transition-colors hover:text-[#b8fa33]"
                    style={{ color: '#a89cc8' }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t flex items-center justify-between flex-wrap gap-4"
          style={{ borderColor: T.borderDark }}>
          <p className="text-[12px] text-[#a89cc8]">© {new Date().getFullYear()} Riazify • All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "YouTube", "Discord"].map(s => (
              <a key={s} href="#" className="text-[12px] font-semibold transition-colors hover:text-[#b8fa33] text-[#a89cc8]">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// -- Main Page --------------------------------------------------
export default function LandingPage() {
  return (
    <main style={{ background: T.bgApp, fontFamily: "'DM Sans', sans-serif" }}>
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
      <BlogStrip />
      <Footer />
      <StickyMobileCTA />
    </main>
  )
}
