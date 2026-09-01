import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Download, Copy, Mail, Twitter, Linkedin, Youtube,
  ExternalLink, Shield, Search, DollarSign, Package, Eye,
  FileText, Activity
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Press Kit | Riazify',
  description: 'Brand assets, company information and press resources for Riazify.',
}

// -- Riazify Color Role Tokens (v2.0) ---------------------------
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
}

const LAST_UPDATED = 'July 5, 2026'

const QUICK_FACTS = [
  { label: 'Company Name', value: 'Riazify LLC' },
  { label: 'Founded', value: '2024' },
  { label: 'Headquarters', value: 'United States' },
  { label: 'Product Type', value: 'SaaS — eBay seller tools' },
  { label: 'Active Sellers', value: '12,000+ eBay operators' },
  { label: 'Official Domain', value: 'riazify.com' },
  { label: 'Press Contact', value: 'hello@riazify.com' },
  { label: 'Last Updated', value: LAST_UPDATED },
]

const BRAND_COLORS = [
  { name: 'Electric Violet', hex: '#7530fb', textColor: '#ffffff', desc: 'Primary brand identity' },
  { name: 'Soft Lime', hex: '#b8fa33', textColor: '#1e1535', desc: 'High-contrast accent' },
  { name: 'Deep Purple Dark', hex: '#1e1535', textColor: '#ffffff', desc: 'Dark hero & footers' },
  { name: 'Purple White', hex: '#f8f7ff', textColor: '#1e1535', desc: 'Light canvas background' },
]

const TOOLS = [
  { icon: Shield, name: 'Order Protection', desc: 'Risk-score every order using 47 data points' },
  { icon: Search, name: 'Product Research', desc: 'Find winning products before competitors' },
  { icon: DollarSign, name: 'Profit Calculator', desc: 'Real margins after all eBay fees' },
  { icon: Package, name: 'Inventory Manager', desc: 'Stock control and demand forecasting' },
  { icon: Eye, name: 'Competitor X-Ray', desc: 'See exactly what any seller is listing' },
  { icon: FileText, name: 'Title Builder', desc: 'AI-optimised eBay titles that rank higher' },
]

const TIMELINE = [
  { year: '2024', event: 'Riazify founded', desc: 'Company incorporated as Riazify LLC' },
  { year: 'Early 2025', event: 'Beta launch', desc: 'First 100 sellers join the private cohort' },
  { year: 'Mid 2025', event: '6 tools live', desc: 'Full platform launches globally' },
  { year: '2026', event: '12,000+ sellers', desc: 'Riazify becomes the premier eBay operator platform' },
]

export default function PressKitPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. HERO ── */}
        <div style={{ backgroundColor: C.dark, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 450, height: 450, borderRadius: '50%', background: 'rgba(117,48,251,0.18)', pointerEvents: 'none' }} />
          <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border"
                  style={{ backgroundColor: 'rgba(117,48,251,0.2)', borderColor: C.primary }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.accent }} />
                  <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>MEDIA RESOURCES</span>
                </div>
                <h1 className="text-[44px] md:text-[56px] font-black leading-tight mb-4 font-syne text-white tracking-tight">
                  Press Kit
                </h1>
                <p className="text-[16px] leading-relaxed max-w-xl mb-3" style={{ color: C.textLight }}>
                  Everything you need to write about Riazify — official logos, brand assets, verified metrics, and press contacts.
                </p>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Last updated: {LAST_UPDATED}</p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a href="mailto:hello@riazify.com"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-[13px] hover:scale-105 transition-all shadow-md cursor-pointer"
                  style={{ backgroundColor: C.accent, color: C.dark }}>
                  <Mail size={16} />
                  <span>Press Enquiry</span>
                </a>
                <a href="/founder.png" download
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-[13px] hover:bg-[#2d1f4e] transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', border: `1px solid ${C.borderDark}` }}>
                  <Download size={16} />
                  <span>Download Assets</span>
                </a>
                <p className="text-[11px] text-center" style={{ color: C.textLight }}>Response within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. STATS BAR ── */}
        <div style={{ backgroundColor: C.primary }}>
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: '12,000+', label: 'eBay Sellers', num: 12000, suffix: '+', prefix: '' },
                { val: '$2.4M+', label: 'Profit Generated', num: 2.4, suffix: 'M+', prefix: '$' },
                { val: '98%', label: 'Protection Rate', num: 98, suffix: '%', prefix: '' },
                { val: '2024', label: 'Founded', num: 2024, suffix: '', prefix: '' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="stat-counter text-[28px] md:text-[32px] font-black leading-none font-syne"
                    data-num={s.num} data-suffix={s.suffix} data-prefix={s.prefix}
                    style={{ color: C.accent }}>{s.val}</p>
                  <p className="text-[12px] font-bold mt-1 text-white opacity-90 uppercase tracking-wide font-syne">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. QUICK FACTS + DESCRIPTIONS ── */}
        <div style={{ backgroundColor: C.surface }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Quick facts */}
              <div>
                <p className="text-[11px] font-black tracking-wider mb-5 font-syne uppercase" style={{ color: C.primary }}>QUICK FACTS</p>
                <div className="rounded-2xl border overflow-hidden shadow-xs" style={{ borderColor: C.border }}>
                  {QUICK_FACTS.map((f, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: i < QUICK_FACTS.length - 1 ? `1px solid ${C.border}` : 'none', backgroundColor: i % 2 === 0 ? '#fff' : C.bg }}>
                      <span className="text-[12px] font-bold font-syne" style={{ color: C.muted }}>{f.label}</span>
                      <span className="text-[13px] font-black" style={{ color: C.textDark }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company descriptions */}
              <div className="flex flex-col gap-5">
                <p className="text-[11px] font-black tracking-wider font-syne uppercase" style={{ color: C.primary }}>COMPANY DESCRIPTIONS</p>
                {[
                  {
                    label: 'ONE SENTENCE',
                    text: 'Riazify is a SaaS platform that gives eBay sellers the intelligence, protection and tools they need to grow their business.'
                  },
                  {
                    label: 'ONE PARAGRAPH',
                    text: 'Riazify is a next-generation SaaS platform built for eBay sellers. Founded in 2024 by an eBay seller who experienced the lack of proper tools firsthand, Riazify provides six powerful tools in one dashboard: order protection, product research, profit calculation, inventory management, competitor analysis and title optimisation. With over 12,000 active sellers and $2.4M+ in profit generated, Riazify is the go-to platform for serious eBay operators in the USA, UK and internationally.'
                  },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl border shadow-xs" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black tracking-wider font-syne uppercase" style={{ color: C.primary }}>{item.label}</span>
                      <button className="copy-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all hover:scale-105 cursor-pointer shadow-xs"
                        data-text={item.text}
                        style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                        <Copy size={11} />Copy
                      </button>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.textDark }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. TAGLINE + BOILERPLATE ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-6 font-syne uppercase" style={{ color: C.primary }}>OFFICIAL COPY</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border shadow-xs" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-black tracking-wider font-syne uppercase" style={{ color: C.primary }}>OFFICIAL TAGLINE</p>
                  <button className="copy-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black hover:scale-105 transition-all cursor-pointer"
                    data-text="Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers."
                    style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                    <Copy size={11} />Copy
                  </button>
                </div>
                <p className="text-[17px] font-black leading-snug font-syne" style={{ color: C.textDark }}>
                  &ldquo;Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers.&rdquo;
                </p>
              </div>
              <div className="p-6 rounded-2xl border shadow-xs" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-black tracking-wider font-syne uppercase" style={{ color: C.primary }}>PRESS BOILERPLATE</p>
                  <button className="copy-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black hover:scale-105 transition-all cursor-pointer"
                    data-text="About Riazify: Riazify LLC is a SaaS company that provides intelligence, protection and growth tools for eBay sellers. The platform's six-tool suite includes order protection, product research, profit calculation, inventory management, competitor analysis and AI-powered title optimisation. Riazify serves over 12,000 sellers in the USA, UK and internationally. For more information, visit riazify.com."
                    style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                    <Copy size={11} />Copy
                  </button>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                  <strong style={{ color: C.textDark }}>About Riazify:</strong> Riazify LLC is a SaaS company that provides intelligence, protection and growth tools for eBay sellers. The platform&apos;s six-tool suite includes order protection, product research, profit calculation, inventory management, competitor analysis and AI-powered title optimisation. Riazify serves over 12,000 sellers globally. For more information, visit riazify.com.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. LOGO DOWNLOADS ── */}
        <div style={{ backgroundColor: C.surface }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-2 font-syne uppercase" style={{ color: C.primary }}>LOGO DOWNLOADS</p>
            <p className="text-[13px] mb-8" style={{ color: C.muted }}>Please do not modify, distort or recolor the Riazify logo.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Dark Background', bg: C.dark, iconBg: C.primary, iconColor: C.accent, textColor: '#ffffff', note: 'Use on dark backgrounds' },
                { label: 'Light Background', bg: C.bg, iconBg: C.primary, iconColor: '#ffffff', textColor: C.textDark, note: 'Use on light backgrounds' },
                { label: 'Violet Canvas', bg: C.primary, iconBg: '#ffffff', iconColor: C.primary, textColor: '#ffffff', note: 'Use on brand colored backgrounds' },
              ].map((logo, i) => (
                <div key={i} className="rounded-2xl border overflow-hidden shadow-xs" style={{ borderColor: C.border }}>
                  <div className="h-36 flex items-center justify-center" style={{ backgroundColor: logo.bg }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                        style={{ backgroundColor: logo.iconBg }}>
                        <Activity size={20} style={{ color: logo.iconColor }} />
                      </div>
                      <span className="text-[22px] font-black font-syne tracking-tight" style={{ color: logo.textColor }}>Riazify</span>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}`, backgroundColor: '#fff' }}>
                    <div>
                      <p className="text-[12px] font-black font-syne" style={{ color: C.textDark }}>{logo.label}</p>
                      <p className="text-[11px]" style={{ color: C.muted }}>{logo.note}</p>
                    </div>
                    <a href="/founder.png"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all hover:scale-105 cursor-pointer shadow-xs"
                      style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                      <Download size={12} />PNG
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] mt-6 text-center" style={{ color: C.muted }}>
              Need SVG or high-res vector formats? Email <a href="mailto:hello@riazify.com" style={{ color: C.primary, fontWeight: 700 }}>hello@riazify.com</a>
            </p>
          </div>
        </div>

        {/* ── 6. BRAND COLORS ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-2 font-syne uppercase" style={{ color: C.accent }}>BRAND COLOR PALETTE (v2.0)</p>
            <p className="text-[13px] mb-8" style={{ color: C.textLight }}>Click any color to copy the hex code directly to your clipboard.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BRAND_COLORS.map((color, i) => (
                <button key={i} className="copy-btn group rounded-2xl overflow-hidden hover:scale-105 transition-all duration-200 text-left cursor-pointer border"
                  data-text={color.hex}
                  style={{ borderColor: C.borderDark }}>
                  <div className="h-24" style={{ backgroundColor: color.hex }} />
                  <div className="p-4" style={{ backgroundColor: C.darkCard, borderTop: `1px solid ${C.borderDark}` }}>
                    <p className="text-[13px] font-black mb-0.5 font-syne" style={{ color: '#fff' }}>{color.name}</p>
                    <p className="text-[12px] font-bold" style={{ color: C.accent }}>{color.hex}</p>
                    <p className="text-[10px] mt-1" style={{ color: C.textLight }}>{color.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. TYPOGRAPHY ── */}
        <div style={{ backgroundColor: C.surface }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-6 font-syne uppercase" style={{ color: C.primary }}>TYPOGRAPHY</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border shadow-xs" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[11px] font-black tracking-wider mb-2 font-syne uppercase" style={{ color: C.primary }}>DISPLAY & HEADINGS</p>
                <p className="text-[32px] font-black mb-2 font-syne" style={{ color: C.textDark }}>Syne & DM Sans</p>
                <p className="text-[13px] mb-4" style={{ color: C.muted }}>Used for distinctive geometric headlines paired with DM Sans for clean baseline reading.</p>
                <div className="flex flex-col gap-2.5">
                  {[
                    { weight: 'Syne 900 — Black', sample: 'Cassini-Optimized Intelligence', isSyne: true },
                    { weight: 'Syne 700 — Bold', sample: 'High-Converting Listing Engines', isSyne: true },
                    { weight: 'DM Sans 400 — Regular', sample: 'Built by sellers, for sellers worldwide.', isSyne: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-[10px] font-bold w-36 shrink-0" style={{ color: C.muted }}>{item.weight}</span>
                      <span className={`text-[13px] ${item.isSyne ? 'font-syne font-black' : ''}`} style={{ color: C.textDark }}>{item.sample}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl border shadow-xs" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[11px] font-black tracking-wider mb-3 font-syne uppercase" style={{ color: C.primary }}>FONT USAGE HIERARCHY</p>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Main Headlines', spec: 'Syne 900 (Black)', example: 'Everything you need to scale on eBay' },
                    { label: 'Section Headings', spec: 'Syne 800 (ExtraBold)', example: 'Order Protection & VeRO Engine' },
                    { label: 'Body Text', spec: 'DM Sans 400 (Regular)', example: 'Analyze real sell-through rates before you invest.' },
                    { label: 'Interactive Labels', spec: 'Syne 800 (Uppercase)', example: 'MEDIA RESOURCES · PRESS KIT' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-0.5 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: C.border }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black font-syne" style={{ color: C.textDark }}>{item.label}</span>
                        <span className="text-[10px] font-bold" style={{ color: C.primary }}>{item.spec}</span>
                      </div>
                      <span className="text-[12px]" style={{ color: C.muted }}>{item.example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 8. FOUNDER ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-8 font-syne uppercase" style={{ color: C.primary }}>FOUNDER & LEADERSHIP</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="rounded-3xl overflow-hidden aspect-square border-4 shadow-xl" style={{ borderColor: C.primary, maxWidth: 320 }}>
                <img src="/founder.png" alt="Reaz Uddin — Founder of Riazify" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-[28px] font-black mb-1 font-syne" style={{ color: C.textDark }}>Reaz Uddin</h2>
                  <p className="text-[14px] font-bold mb-4" style={{ color: C.primary }}>Founder & CEO, Riazify LLC</p>
                  <p className="text-[14px] leading-relaxed mb-4" style={{ color: C.muted }}>
                    Reaz Uddin is an active eBay seller and e-commerce entrepreneur who founded Riazify after experiencing firsthand the lack of purpose-built intelligence tools for eBay operators. Based in the United States, Riazify was built to give every eBay seller access to the predictive algorithms, Cassini SEO models, and automated VeRO risk protections previously reserved for enterprise operations.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <a href="/founder.png" download
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-black w-fit hover:scale-105 transition-all shadow-sm cursor-pointer"
                    style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                    <Download size={15} />Download Founder Photo
                  </a>
                  <p className="text-[11px]" style={{ color: C.muted }}>PNG · High resolution · Certified free for editorial use</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 9. TIMELINE ── */}
        <div style={{ backgroundColor: C.surface }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-10 font-syne uppercase" style={{ color: C.primary }}>COMPANY MILESTONES</p>
            <div className="relative">
              <div className="absolute left-0 right-0 top-5 h-0.5 hidden md:block" style={{ backgroundColor: C.border }} />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[13px] mb-4 relative z-10 shadow-md font-syne"
                      style={{ backgroundColor: C.primary, color: '#ffffff' }}>{i + 1}</div>
                    <p className="text-[11px] font-black tracking-wider mb-1 font-syne" style={{ color: C.primary }}>{item.year}</p>
                    <p className="text-[14px] font-black mb-1 font-syne" style={{ color: C.textDark }}>{item.event}</p>
                    <p className="text-[12px]" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 10. SOCIAL CHANNELS ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-8 font-syne uppercase" style={{ color: C.accent }}>OFFICIAL SOCIAL CHANNELS</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Twitter, name: 'X (Twitter)', handle: '@riazify', url: 'https://twitter.com/riazify', color: '#1da1f2' },
                { icon: Linkedin, name: 'LinkedIn', handle: 'Riazify', url: 'https://linkedin.com/company/riazify', color: '#0077b5' },
                { icon: Youtube, name: 'YouTube', handle: 'Riazify', url: 'https://youtube.com/@riazify', color: '#ff0000' },
                { icon: ExternalLink, name: 'Platform', handle: 'riazify.com', url: 'https://riazify.com', color: C.primary },
              ].map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col gap-3 p-5 rounded-2xl border hover:-translate-y-1 transition-all duration-200"
                  style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}20` }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black font-syne" style={{ color: '#ffffff' }}>{s.name}</p>
                    <p className="text-[12px]" style={{ color: C.textLight }}>{s.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── 11. PRESS CONTACT CALLOUT ── */}
        <div style={{ backgroundColor: C.bg, paddingBottom: '40px' }}>
          <div className="max-w-5xl mx-auto px-6 pt-12">
            <div style={{ backgroundColor: C.dark, borderRadius: 28, position: 'relative', overflow: 'hidden', padding: '60px 40px', border: `1px solid ${C.borderDark}` }}>
              <div className="text-center relative z-10">
                <p className="text-[11px] font-black tracking-wider mb-4 font-syne uppercase" style={{ color: C.accent }}>PRESS INQUIRIES</p>
                <h2 className="text-[30px] md:text-[38px] font-black mb-3 font-syne text-white">Ready to write about Riazify?</h2>
                <p className="text-[15px] mb-8 max-w-lg mx-auto" style={{ color: C.textLight }}>
                  We respond to all media enquiries within 24 hours. We arrange founder interviews, customized data extracts, and high-res screenshot packages.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <a href="mailto:hello@riazify.com"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[14px] hover:scale-105 transition-all shadow-md cursor-pointer"
                    style={{ backgroundColor: C.accent, color: C.dark }}>
                    <Mail size={18} />hello@riazify.com
                  </a>
                  <Link href="/about"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[14px] border hover:bg-[#2d1f4e] transition-all"
                    style={{ borderColor: C.borderDark, color: '#fff' }}>
                    Learn more about us →
                  </Link>
                </div>
                <p className="text-[12px] mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Guaranteed response time: under 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Interactive Copy Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
        function initPressKit() {
          var btns = document.querySelectorAll('.copy-btn');
          btns.forEach(function(btn) {
            btn.addEventListener('click', function() {
              var text = btn.getAttribute('data-text');
              if (!text) return;
              navigator.clipboard.writeText(text).then(function() {
                var orig = btn.innerHTML;
                btn.innerHTML = 'Copied ✓';
                btn.style.backgroundColor = '#b8fa33';
                btn.style.color = '#1e1535';
                setTimeout(function() {
                  btn.innerHTML = orig;
                  btn.style.backgroundColor = '';
                  btn.style.color = '';
                }, 2000);
              });
            });
          });
        }
        if (typeof window !== 'undefined') {
          setTimeout(initPressKit, 100);
        }
      ` }} />
    </div>
  )
}
