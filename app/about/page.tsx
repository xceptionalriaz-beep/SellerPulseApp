'use client'

// app/about/page.tsx
// About Riazify — Mission, Origin Story & Team

import { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import {
  Target, BarChart2, Shield, Zap, Search,
  DollarSign, Package, Eye, FileText, MapPin,
  AlertTriangle, Clock, TrendingUp, Users,
  ArrowRight, Mail, CheckCircle2, ChevronDown
} from 'lucide-react'

// ── Riazify Color Role Tokens (v2.0) ──────────────────────────
const C = {
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
  red: '#dc2626',
}

const FAQS = [
  {
    q: 'Is Riazify affiliated with eBay?',
    a: 'No. Riazify is an independent intelligence and order protection platform and is not affiliated with, endorsed by, or officially connected to eBay Inc. We build third-party software specifically engineered to empower individual sellers.'
  },
  {
    q: 'Where is Riazify headquartered?',
    a: 'Riazify is operated by Riazify LLC, a company incorporated in the United States. Our cloud platform serves active sellers across the USA, UK, Canada, Australia, and European marketplaces.'
  },
  {
    q: 'How is store and order data secured?',
    a: 'We implement industry-standard 256-bit encryption in transit and at rest. We never sell, monetize, or expose your private listing margins, order histories, or store intelligence to third parties.'
  },
  {
    q: 'Can I start using Riazify for free?',
    a: 'Yes. Riazify offers a free exploratory tier with essential order protection and research quotas. No credit card is required to create an account.'
  },
]

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. HERO ── */}
        <section className="border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.accent }} />
              <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                ABOUT RIAZIFY
              </span>
            </div>

            <h1 className="text-[38px] md:text-[54px] font-black leading-[1.08] mb-6 font-syne text-white tracking-tight">
              We are on a mission to<br />
              <span style={{ color: C.accent }}>level the playing field</span><br />
              for eBay sellers.
            </h1>

            <p className="text-[16px] md:text-[17px] leading-relaxed max-w-2xl mx-auto mb-10 font-medium" style={{ color: C.textLight }}>
              Marketplaces traditionally give buyers all the leverage. Riazify rebalances the equation with real-time risk protection, margin auditing, and Cassini intelligence.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/auth/signup"
                className="px-8 py-3.5 rounded-xl font-black text-[14px] font-syne transition-transform hover:scale-105 shadow-md cursor-pointer"
                style={{ backgroundColor: C.accent, color: C.dark }}
              >
                Start Free Workspace →
              </Link>
              <Link
                href="/blog"
                className="px-8 py-3.5 rounded-xl font-bold text-[14px] border transition-colors hover:bg-[#271c42] cursor-pointer"
                style={{ borderColor: C.borderDark, color: '#ffffff' }}
              >
                Read Seller Guides
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. METRICS DATA STRIP ── */}
        <section className="border-b" style={{ backgroundColor: C.primary, borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: '12,000+', label: 'Active eBay Sellers' },
                { val: '$2.4M+', label: 'Fraud & Fees Prevented' },
                { val: '98.4%', label: 'Dispute Win Protection' },
                { val: '6 Tools', label: 'Unified Engine' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-[28px] md:text-[32px] font-black font-syne leading-none text-white">{s.val}</p>
                  <p className="text-[11.5px] font-bold uppercase tracking-wider font-syne mt-1" style={{ color: C.accent }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. FOUNDER & ORIGIN ── */}
        <section className="py-20 border-b" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">

              {/* Photo Card */}
              <div className="md:col-span-5 relative">
                <div className="rounded-3xl overflow-hidden border aspect-square shadow-sm" style={{ borderColor: C.border }}>
                  <img
                    src="/founder.png"
                    alt="Reaz Uddin — Founder of Riazify"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  {/* Fallback avatar if local image missing */}
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: C.primaryLight }}>
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-[28px] font-black font-syne mb-3" style={{ backgroundColor: C.primary, color: '#fff' }}>
                      RU
                    </div>
                    <p className="text-[18px] font-black font-syne" style={{ color: C.textDark }}>Reaz Uddin</p>
                    <p className="text-[13px] font-medium" style={{ color: C.muted }}>eBay Operator &amp; Founder</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl shadow-md border" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
                  <p className="text-[11px] font-black font-syne uppercase" style={{ color: C.accent }}>Built by a Seller</p>
                </div>
              </div>

              {/* Story Details */}
              <div className="md:col-span-7 flex flex-col gap-5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-2" style={{ color: C.primary }}>
                    THE ORIGIN STORY
                  </p>
                  <h2 className="text-[28px] md:text-[34px] font-black font-syne leading-tight" style={{ color: C.textDark }}>
                    Built from the frustration of selling without real tooling
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <p className="text-[12px] font-black font-syne uppercase mb-1" style={{ color: C.primary }}>The Problem</p>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: C.textDark }}>
                      While scaling an ecommerce storefront on eBay US, everyday operations were consumed by unpredictable buyer disputes, opaque category fee changes, and hours of manual product research.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <p className="text-[12px] font-black font-syne uppercase mb-1" style={{ color: C.primary }}>The Disconnect</p>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: C.textDark }}>
                      Nearly all modern ecommerce software catered exclusively to Amazon FBA or Shopify brands. eBay operators—managing millions in daily trade—were treated as an afterthought.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <p className="text-[12px] font-black font-syne uppercase mb-1" style={{ color: C.primary }}>The Solution</p>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: C.textDark }}>
                      Riazify was built to give independent sellers institutional-grade leverage: automated high-risk buyer scoring, verified fee ledgers, and algorithmic Cassini ranking optimization.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[15px] font-syne"
                    style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                    RU
                  </div>
                  <div>
                    <p className="text-[14px] font-bold font-syne" style={{ color: C.textDark }}>Reaz Uddin</p>
                    <p className="text-[12px]" style={{ color: C.muted }}>Founder &amp; Lead Builder, Riazify LLC</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 4. MISSION & VISION ── */}
        <section className="py-20 border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <p className="text-[11px] font-black tracking-wider uppercase font-syne mb-2" style={{ color: C.accent }}>
                CORE ARCHITECTURE
              </p>
              <h2 className="text-[30px] md:text-[36px] font-black font-syne text-white tracking-tight">
                Purpose-built for serious eBay merchants
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 rounded-2xl border shadow-md" style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border"
                  style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
                  <Target size={20} style={{ color: C.accent }} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-1" style={{ color: C.accent }}>OUR MISSION</p>
                <h3 className="text-[19px] font-bold font-syne text-white mb-2">Automate Merchant Protection</h3>
                <p className="text-[13.5px] leading-relaxed font-normal" style={{ color: C.textLight }}>
                  Equip every eBay seller with proactive threat detection, transparent fee auditing, and automated workflows so they can operate with institutional confidence.
                </p>
              </div>

              <div className="p-7 rounded-2xl border shadow-md" style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border"
                  style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
                  <TrendingUp size={20} style={{ color: C.accent }} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-1" style={{ color: C.accent }}>OUR VISION</p>
                <h3 className="text-[19px] font-bold font-syne text-white mb-2">The Standard Seller Operating System</h3>
                <p className="text-[13.5px] leading-relaxed font-normal" style={{ color: C.textLight }}>
                  Establish the definitive global intelligence layer for marketplace merchants—turning fragmented seller operations into predictable, high-margin businesses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. THE SIX TOOLS SUITE ── */}
        <section className="py-20 border-b" style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-lg mx-auto mb-12">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-2" style={{ color: C.primary }}>
                PRODUCT ECOSYSTEM
              </p>
              <h2 className="text-[30px] md:text-[36px] font-black font-syne" style={{ color: C.textDark }}>
                Six dedicated tools. One unified workspace.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: 'Order Protection', desc: 'Risk-scores every incoming order against known fraudulent patterns before shipping.' },
                { icon: Search, title: 'Product Research', desc: 'Discovers verified sold velocity and low-competition item niches in real-time.' },
                { icon: DollarSign, title: 'Profit Calculator', desc: 'Audits actual net take-home profit across 14 countries, tiers, and ad rates.' },
                { icon: Package, title: 'Inventory Velocity', desc: 'Monitors restock cycles, dead stock alerts, and demand projections.' },
                { icon: Eye, title: 'Competitor X-Ray', desc: 'Analyzes competitor pricing strategies, sold quantities, and restock timing.' },
                { icon: FileText, title: 'Cassini Title Builder', desc: 'Generates SEO-dense 80-character eBay listing titles that maximize organic visibility.' },
              ].map((tool, i) => (
                <div key={i} className="p-5 rounded-2xl border bg-white shadow-xs transition-colors hover:border-[#7530fb]" style={{ borderColor: C.border }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 border"
                    style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                    <tool.icon size={19} style={{ color: C.primary }} />
                  </div>
                  <h3 className="text-[15px] font-bold font-syne mb-1" style={{ color: C.textDark }}>{tool.title}</h3>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: C.muted }}>{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. VALUES ── */}
        <section className="py-20 border-b" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-lg mx-auto mb-12">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-2" style={{ color: C.primary }}>
                GUIDING PRINCIPLES
              </p>
              <h2 className="text-[30px] md:text-[36px] font-black font-syne" style={{ color: C.textDark }}>
                How we build &amp; operate
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: Target, title: 'Seller-First Utility', desc: 'Every feature must solve a proven operational pain point for an eBay merchant. We reject vanity features.' },
                { icon: BarChart2, title: 'Verified Sold Data', desc: 'We prioritize verified marketplace transaction data over speculative metrics or guesswork.' },
                { icon: Shield, title: 'Uncompromised Security', desc: 'Store datasets and customer records are protected with bank-grade encryption and zero third-party sharing.' },
                { icon: Zap, title: 'Rapid Deployment', desc: 'We release weekly improvements directly inspired by feedback from active community operators.' },
              ].map((v, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl border bg-[#f8f7ff]" style={{ borderColor: C.border }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: C.surface, borderColor: C.border }}>
                    <v.icon size={19} style={{ color: C.primary }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold font-syne mb-1" style={{ color: C.textDark }}>{v.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. TRUST & COMPLIANCE BADGES ── */}
        <section className="py-16 border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-8 text-center" style={{ color: C.accent }}>
              ENTERPRISE COMPLIANCE &amp; SECURITY
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, title: 'Riazify LLC', desc: 'US Registered Entity' },
                { icon: MapPin, title: 'United States', desc: 'Global Cloud Architecture' },
                { icon: FileText, title: 'GDPR / CCPA', desc: 'Strict Data Privacy' },
                { icon: Zap, title: '256-Bit SSL', desc: 'Encrypted Telemetry' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl border text-center"
                  style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5 border"
                    style={{ backgroundColor: 'rgba(117,48,251,0.2)', borderColor: C.primary }}>
                    <item.icon size={18} style={{ color: C.accent }} />
                  </div>
                  <p className="text-[13px] font-bold font-syne text-white">{item.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.textLight }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. FAQ ACCORDION ── */}
        <section className="py-20 border-b" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-1" style={{ color: C.primary }}>
                QUESTIONS &amp; ANSWERS
              </p>
              <h2 className="text-[28px] md:text-[32px] font-black font-syne" style={{ color: C.textDark }}>
                Frequently asked questions
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i
                return (
                  <div key={i} className="rounded-2xl border bg-white overflow-hidden shadow-2xs" style={{ borderColor: C.border }}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-[14.5px] font-bold font-syne" style={{ color: C.textDark }}>{faq.q}</span>
                      <ChevronDown
                        size={17}
                        className="shrink-0 transition-transform duration-200"
                        style={{ color: C.primary, transform: isOpen ? 'rotate(180deg)' : 'none' }}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: C.border }}>
                        <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 9. FINAL CTA BANNER ── */}
        <section className="py-16" style={{ backgroundColor: C.bg }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="rounded-3xl p-10 md:p-12 text-center border shadow-xl relative overflow-hidden"
              style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 border"
                style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
                <CheckCircle2 size={13} style={{ color: C.accent }} />
                <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                  JOIN 12,000+ MERCHANTS
                </span>
              </div>

              <h2 className="text-[30px] md:text-[40px] font-black font-syne text-white tracking-tight mb-3">
                Ready to protect and scale your store?
              </h2>

              <p className="text-[15px] mb-8 max-w-md mx-auto leading-relaxed" style={{ color: C.textLight }}>
                Get instant access to order risk analysis, live profit calculators, and automated title optimization.
              </p>

              <div className="flex items-center justify-center gap-3.5 flex-wrap">
                <Link
                  href="/auth/signup"
                  className="px-8 py-3.5 rounded-xl font-black text-[14px] font-syne transition-transform hover:scale-105 shadow-md cursor-pointer"
                  style={{ backgroundColor: C.accent, color: C.dark }}
                >
                  Start Free — No Card Required
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-3.5 rounded-xl font-bold text-[14px] border transition-colors hover:bg-[#271c42] cursor-pointer"
                  style={{ borderColor: C.borderDark, color: '#ffffff' }}
                >
                  View Plan Tiers
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
