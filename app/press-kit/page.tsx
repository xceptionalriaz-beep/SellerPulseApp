// app/press-kit/page.tsx
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Download, Copy, Mail, Twitter, Linkedin, Youtube, ExternalLink, Shield, Search, DollarSign, Package, Eye, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Press Kit | Riazify',
  description: 'Brand assets, company information and press resources for Riazify.',
}

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
}

const LAST_UPDATED = 'July 5, 2026'

const QUICK_FACTS = [
  { label: 'Company Name',   value: 'Riazify LLC' },
  { label: 'Founded',        value: '2024' },
  { label: 'Headquarters',   value: 'United States' },
  { label: 'Product Type',   value: 'SaaS — eBay seller tools' },
  { label: 'Users',          value: '12,000+ eBay sellers' },
  { label: 'Website',        value: 'riazify.com' },
  { label: 'Press Contact',  value: 'hello@riazify.com' },
  { label: 'Last Updated',   value: LAST_UPDATED },
]

const BRAND_COLORS = [
  { name: 'Lime',      hex: '#8fff00', textColor: '#1a2410', desc: 'Primary brand color' },
  { name: 'Dark',      hex: '#1a2410', textColor: '#8fff00', desc: 'Background & text' },
  { name: 'Lime Deep', hex: '#4a8f00', textColor: '#ffffff', desc: 'Hover & accent' },
  { name: 'Lime Tint', hex: '#f4ffe6', textColor: '#1a2410', desc: 'Light background' },
]

const TOOLS = [
  { icon: Shield,     name: 'Order Protection',  desc: 'Risk-score every order using 47 data points' },
  { icon: Search,     name: 'Product Research',  desc: 'Find winning products before competitors' },
  { icon: DollarSign, name: 'Profit Calculator', desc: 'Real margins after all eBay fees' },
  { icon: Package,    name: 'Inventory Manager', desc: 'Stock control and demand forecasting' },
  { icon: Eye,        name: 'Competitor X-Ray',  desc: 'See exactly what any seller is listing' },
  { icon: FileText,   name: 'Title Builder',     desc: 'AI-optimised eBay titles that rank higher' },
]

const TIMELINE = [
  { year: '2024', event: 'Riazify founded', desc: 'Company incorporated as Riazify LLC' },
  { year: 'Early 2025', event: 'Beta launch', desc: 'First 100 sellers join the platform' },
  { year: 'Mid 2025', event: '6 tools live', desc: 'Full platform launches to the public' },
  { year: '2026', event: '12,000+ sellers', desc: 'Riazify becomes the go-to eBay seller platform' },
]

export default function PressKitPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>

        {/* ── 1. HERO ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                     style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.lime }}/>
                  <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>MEDIA RESOURCES</span>
                </div>
                <h1 className="text-[48px] md:text-[56px] font-black leading-tight mb-4" style={{ color: '#fff' }}>
                  Press Kit
                </h1>
                <p className="text-[16px] leading-relaxed max-w-xl mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Everything you need to write about Riazify — logos, brand assets, company facts and press contacts. All in one place.
                </p>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Last updated: {LAST_UPDATED}</p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a href="mailto:hello@riazify.com"
                   className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[13px] hover:opacity-90 transition-all"
                   style={{ backgroundColor: C.lime, color: C.dark }}>
                  <Mail size={16}/>
                  Press Enquiry
                </a>
                <a href="/founder.png" download
                   className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[13px] hover:opacity-90 transition-all"
                   style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Download size={16}/>
                  Download Assets
                </a>
                <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Response within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. STATS BAR ── */}
        <div style={{ backgroundColor: C.lime }}>
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: '12,000+', label: 'eBay sellers',     num: 12000, suffix: '+',  prefix: ''  },
                { val: '$2.4M+',  label: 'Profit generated', num: 2.4,   suffix: 'M+', prefix: '$' },
                { val: '98%',     label: 'Protection rate',  num: 98,    suffix: '%',  prefix: ''  },
                { val: '2024',    label: 'Founded',           num: 2024,  suffix: '',   prefix: ''  },
              ].map((s, i) => (
                <div key={i}>
                  <p className="stat-counter text-[28px] font-black leading-none"
                     data-num={s.num} data-suffix={s.suffix} data-prefix={s.prefix}
                     style={{ color: C.dark }}>{s.val}</p>
                  <p className="text-[11px] font-bold mt-1" style={{ color: 'rgba(26,36,16,0.6)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. QUICK FACTS + DESCRIPTIONS ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Quick facts */}
              <div>
                <p className="text-[11px] font-black tracking-wider mb-5" style={{ color: C.muted }}>QUICK FACTS</p>
                <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
                  {QUICK_FACTS.map((f, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3"
                         style={{ borderBottom: i < QUICK_FACTS.length - 1 ? `1px solid ${C.border}` : 'none', backgroundColor: i % 2 === 0 ? '#fff' : C.bg }}>
                      <span className="text-[12px] font-bold" style={{ color: C.muted }}>{f.label}</span>
                      <span className="text-[13px] font-black" style={{ color: C.dark }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company descriptions */}
              <div className="flex flex-col gap-5">
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>COMPANY DESCRIPTIONS</p>
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
                  <div key={i} className="p-5 rounded-2xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>{item.label}</span>
                      <button className="copy-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-70 transition-all"
                              data-text={item.text}
                              style={{ backgroundColor: C.dark, color: C.lime }}>
                        <Copy size={11}/>Copy
                      </button>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.dark }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. TAGLINE + BOILERPLATE ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-8" style={{ color: C.muted }}>OFFICIAL COPY</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>OFFICIAL TAGLINE</p>
                  <button className="copy-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-70"
                          data-text="Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers."
                          style={{ backgroundColor: C.dark, color: C.lime }}>
                    <Copy size={11}/>Copy
                  </button>
                </div>
                <p className="text-[18px] font-black leading-snug" style={{ color: C.dark }}>
                  "Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers."
                </p>
              </div>
              <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>PRESS BOILERPLATE</p>
                  <button className="copy-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-70"
                          data-text="About Riazify: Riazify LLC is a SaaS company that provides intelligence, protection and growth tools for eBay sellers. The platform's six-tool suite includes order protection, product research, profit calculation, inventory management, competitor analysis and AI-powered title optimisation. Riazify serves over 12,000 sellers in the USA, UK and internationally. For more information, visit riazify.com."
                          style={{ backgroundColor: C.dark, color: C.lime }}>
                    <Copy size={11}/>Copy
                  </button>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                  <strong style={{ color: C.dark }}>About Riazify:</strong> Riazify LLC is a SaaS company that provides intelligence, protection and growth tools for eBay sellers. The platform's six-tool suite includes order protection, product research, profit calculation, inventory management, competitor analysis and AI-powered title optimisation. Riazify serves over 12,000 sellers in the USA, UK and internationally. For more information, visit riazify.com.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. LOGO DOWNLOADS ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>LOGO DOWNLOADS</p>
            <p className="text-[13px] mb-8" style={{ color: C.muted }}>Please do not modify, distort or recolor the Riazify logo.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: 'Dark Background', bg: C.dark, textColor: C.lime, note: 'Use on dark backgrounds' },
                { label: 'Light Background', bg: C.bg, textColor: C.dark, note: 'Use on light backgrounds' },
                { label: 'Lime Background', bg: C.lime, textColor: C.dark, note: 'Use on lime backgrounds' },
              ].map((logo, i) => (
                <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
                  <div className="h-36 flex items-center justify-center" style={{ backgroundColor: logo.bg }}>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: logo.textColor === C.dark ? C.lime : C.dark }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke={logo.textColor === C.dark ? C.dark : C.lime} strokeWidth="2.5">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                      </div>
                      <span className="text-[20px] font-black" style={{ color: logo.textColor }}>Riazify</span>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
                    <div>
                      <p className="text-[12px] font-black" style={{ color: C.dark }}>{logo.label}</p>
                      <p className="text-[11px]" style={{ color: C.muted }}>{logo.note}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href="/founder.png"
                         className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:opacity-70"
                         style={{ backgroundColor: C.dark, color: C.lime }}>
                        <Download size={11}/>PNG
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] mt-4 text-center" style={{ color: C.muted }}>
              Need SVG or other formats? Email <a href="mailto:hello@riazify.com" style={{ color: C.limeDeep }}>hello@riazify.com</a>
            </p>
          </div>
        </div>

        {/* ── 6. BRAND COLORS ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>BRAND COLORS</p>
            <p className="text-[13px] mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Click any color to copy the hex code.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BRAND_COLORS.map((color, i) => (
                <button key={i} className="copy-btn group rounded-2xl overflow-hidden hover:scale-105 transition-all duration-200 text-left"
                        data-text={color.hex}
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="h-24" style={{ backgroundColor: color.hex }}/>
                  <div className="p-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderTop: color.hex === C.dark ? '2px solid rgba(143,255,0,0.5)' : '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[13px] font-black mb-0.5" style={{ color: '#fff' }}>{color.name}</p>
                    <p className="text-[12px] font-bold" style={{ color: C.lime }}>{color.hex}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{color.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. TYPOGRAPHY ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-8" style={{ color: C.muted }}>TYPOGRAPHY</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>PRIMARY FONT</p>
                <p className="text-[36px] font-black mb-2" style={{ color: C.dark, fontFamily: 'Inter, sans-serif' }}>Inter</p>
                <p className="text-[13px] mb-4" style={{ color: C.muted }}>Used for all headings, body text and UI elements across the Riazify platform and website.</p>
                <div className="flex flex-col gap-2">
                  {[
                    { weight: '900 — Black',  sample: 'eBay Intelligence' },
                    { weight: '700 — Bold',   sample: 'Order Protection' },
                    { weight: '400 — Regular', sample: 'Built by sellers, for sellers.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-[10px] font-bold w-28 shrink-0" style={{ color: C.muted }}>{item.weight}</span>
                      <span className="text-[14px]" style={{ color: C.dark, fontWeight: item.weight.includes('900') ? 900 : item.weight.includes('700') ? 700 : 400 }}>{item.sample}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>FONT USAGE</p>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Headings',   spec: 'Inter 900 (Black)',   example: 'Ready to sell smarter?' },
                    { label: 'Subheadings', spec: 'Inter 700 (Bold)',   example: 'Order Protection Tool' },
                    { label: 'Body text',  spec: 'Inter 400 (Regular)', example: 'Protect your eBay orders' },
                    { label: 'Labels',     spec: 'Inter 700 — Uppercase tracking', example: 'PRESS KIT' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-0.5 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: C.border }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black" style={{ color: C.dark }}>{item.label}</span>
                        <span className="text-[10px]" style={{ color: C.muted }}>{item.spec}</span>
                      </div>
                      <span className="text-[12px]" style={{ color: C.muted }}>{item.example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 8. PRODUCT SCREENSHOTS ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>PRODUCT SCREENSHOTS</p>
            <p className="text-[13px] mb-8" style={{ color: C.muted }}>High-resolution product screenshots for editorial use.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TOOLS.slice(0, 3).map((tool, i) => (
                <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                  <div className="h-44 flex flex-col items-center justify-center gap-3"
                       style={{ backgroundColor: C.dark, borderBottom: `1px solid ${C.border}` }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                         style={{ backgroundColor: 'rgba(143,255,0,0.15)' }}>
                      <tool.icon size={22} style={{ color: C.lime }}/>
                    </div>
                    <p className="text-[13px] font-black" style={{ color: '#fff' }}>{tool.name}</p>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold"
                          style={{ backgroundColor: 'rgba(143,255,0,0.1)', color: C.lime }}>
                      Screenshot coming soon
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <p className="text-[12px]" style={{ color: C.muted }}>{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] mt-4 text-center" style={{ color: C.muted }}>
              Request screenshots — <a href="mailto:hello@riazify.com" style={{ color: C.limeDeep }}>hello@riazify.com</a>
            </p>
          </div>
        </div>

        {/* ── 8. FOUNDER ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-8" style={{ color: C.muted }}>FOUNDER</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="rounded-3xl overflow-hidden aspect-square" style={{ border: `3px solid ${C.lime}`, maxWidth: 320 }}>
                <img src="/founder.png" alt="Reaz Uddin — Founder of Riazify" className="w-full h-full object-cover"/>
              </div>
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-[28px] font-black mb-1" style={{ color: C.dark }}>Reaz Uddin</h2>
                  <p className="text-[15px] font-bold mb-4" style={{ color: C.limeDeep }}>Founder & CEO, Riazify LLC</p>
                  <p className="text-[14px] leading-relaxed mb-4" style={{ color: C.muted }}>
                    Reaz Uddin is an eBay seller and ecommerce entrepreneur who founded Riazify after experiencing firsthand the lack of proper tools available to eBay sellers. Based in the United States, he also operates Reazify LLC, an Amazon FBA business. Riazify was built to give every eBay seller access to the intelligence and protection that only large operations could previously afford.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <a href="/founder.png" download
                     className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black w-fit hover:opacity-90 transition-all"
                     style={{ backgroundColor: C.dark, color: C.lime }}>
                    <Download size={15}/>Download Founder Photo
                  </a>
                  <p className="text-[11px]" style={{ color: C.muted }}>PNG · High resolution · Free for editorial use</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 9. TIMELINE ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-10" style={{ color: C.muted }}>COMPANY MILESTONES</p>
            <div className="relative">
              <div className="absolute left-0 right-0 top-5 h-px hidden md:block" style={{ backgroundColor: C.border }}/>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[12px] mb-4 relative z-10"
                         style={{ backgroundColor: C.lime, color: C.dark }}>{i + 1}</div>
                    <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.limeDeep }}>{item.year}</p>
                    <p className="text-[14px] font-black mb-1" style={{ color: C.dark }}>{item.event}</p>
                    <p className="text-[12px]" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 10. SOCIAL MEDIA ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-8" style={{ color: C.muted }}>SOCIAL MEDIA</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Twitter,      name: 'X (Twitter)', handle: '@riazify',     url: 'https://twitter.com/riazify',          color: '#000' },
                { icon: Linkedin,     name: 'LinkedIn',    handle: 'Riazify',      url: 'https://linkedin.com/company/riazify', color: '#0077b5' },
                { icon: Youtube,      name: 'YouTube',     handle: 'Riazify',      url: 'https://youtube.com/@riazify',         color: '#ff0000' },
                { icon: ExternalLink, name: 'Website',     handle: 'riazify.com',  url: 'https://riazify.com',                  color: C.limeDeep },
              ].map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                   className="flex flex-col gap-3 p-5 rounded-2xl border hover:shadow-lg transition-all duration-200"
                   style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ backgroundColor: `${s.color}18` }}>
                    <s.icon size={20} style={{ color: s.color }}/>
                  </div>
                  <div>
                    <p className="text-[13px] font-black" style={{ color: C.dark }}>{s.name}</p>
                    <p className="text-[12px]" style={{ color: C.muted }}>{s.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── 11. COVERAGE GUIDELINES ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-8" style={{ color: C.muted }}>COVERAGE GUIDELINES</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl border" style={{ borderColor: 'rgba(74,143,0,0.3)', backgroundColor: C.limeTint }}>
                <p className="text-[12px] font-black tracking-wider mb-4" style={{ color: C.limeDeep }}>✅ PLEASE DO</p>
                <div className="flex flex-col gap-3">
                  {[
                    'Refer to the company as "Riazify" or "Riazify LLC"',
                    'Use official logos from this press kit only',
                    'Use approved brand colors: #8fff00 and #1a2410',
                    'Credit product screenshots to "Riazify"',
                    'Link to riazify.com when mentioning the platform',
                    'Contact hello@riazify.com for interview requests',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                           style={{ backgroundColor: C.lime }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-[13px]" style={{ color: C.dark }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl border" style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: '#fef2f2' }}>
                <p className="text-[12px] font-black tracking-wider mb-4" style={{ color: '#b91c1c' }}>❌ PLEASE DON'T</p>
                <div className="flex flex-col gap-3">
                  {[
                    'Modify, distort or recolor the Riazify logo',
                    'Claim Riazify is affiliated with or endorsed by eBay',
                    'Use screenshots without permission',
                    'Represent Riazify as a free product (it has paid plans)',
                    'Use the Riazify name in domain names or app names',
                    'Publish inaccurate statistics or company facts',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                           style={{ backgroundColor: '#ef4444' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </div>
                      <p className="text-[13px]" style={{ color: '#1a1a1a' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 12. PRESS MENTIONS ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>PRESS MENTIONS</p>
            <p className="text-[13px] mb-8" style={{ color: C.muted }}>Recent articles and coverage about Riazify.</p>
            <div className="rounded-2xl border p-10 text-center" style={{ borderColor: C.border, borderStyle: 'dashed', backgroundColor: C.bg }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                   style={{ backgroundColor: C.dark }}>
                <FileText size={24} style={{ color: C.lime }}/>
              </div>
              <p className="text-[15px] font-black mb-2" style={{ color: C.dark }}>No press mentions yet</p>
              <p className="text-[13px] mb-4" style={{ color: C.muted }}>
                Be the first to cover Riazify. We'd love to be featured in your publication.
              </p>
              <a href="mailto:hello@riazify.com"
                 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[13px] hover:opacity-90 transition-all"
                 style={{ backgroundColor: C.dark, color: C.lime }}>
                <Mail size={14}/>Get in touch
              </a>
            </div>
          </div>
        </div>

        {/* ── 13. AWARDS PLACEHOLDER ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-4" style={{ color: C.muted }}>AWARDS & RECOGNITION</p>
            <div className="rounded-2xl border p-10 text-center" style={{ borderColor: C.border, backgroundColor: '#fff', borderStyle: 'dashed' }}>
              <p className="text-[15px] font-black mb-2" style={{ color: C.dark }}>No awards yet — but we're just getting started.</p>
              <p className="text-[13px]" style={{ color: C.muted }}>Check back as Riazify grows. Media mentions and recognition will be listed here.</p>
            </div>
          </div>
        </div>

        {/* ── 13. PRESS CONTACT ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div style={{ backgroundColor: C.dark, borderRadius: 32, position: 'relative', overflow: 'hidden', padding: '64px 48px' }}>
              <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
                <p className="text-[11px] font-black tracking-wider mb-4" style={{ color: C.muted }}>PRESS CONTACT</p>
                <h2 className="text-[32px] font-black mb-3" style={{ color: '#fff' }}>Ready to write about Riazify?</h2>
                <p className="text-[15px] mb-10 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  We respond to all press enquiries within 24 hours. We're happy to arrange interviews, provide additional assets or answer any questions.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <a href="mailto:hello@riazify.com"
                     className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[15px] hover:opacity-90 transition-all"
                     style={{ backgroundColor: C.lime, color: C.dark }}>
                    <Mail size={18}/>hello@riazify.com
                  </a>
                  <Link href="/about"
                     className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[15px] border hover:opacity-80 transition-all"
                     style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    Learn more about us →
                  </Link>
                </div>
                <p className="text-[12px] mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>Average response time: under 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: [
        '.fade-in-up { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }',
        '.fade-in-up.visible { opacity: 1; transform: translateY(0); }',
      ].join(' ') }} />

      {/* Copy + Counter + Scroll scripts */}
      <script dangerouslySetInnerHTML={{ __html:
        'function initPressKit() {' +
        '  var btns = document.querySelectorAll(".copy-btn");' +
        '  if(!btns.length){ setTimeout(initPressKit, 200); return; }' +
        '  btns.forEach(function(btn) {' +
        '    btn.addEventListener("click", function() {' +
        '      var text = btn.getAttribute("data-text");' +
        '      if(!text) return;' +
        '      navigator.clipboard.writeText(text).then(function() {' +
        '        var orig = btn.innerHTML;' +
        '        btn.innerHTML = "Copied ✓";' +
        '        btn.style.backgroundColor = "#4a8f00";' +
        '        setTimeout(function() { btn.innerHTML = orig; btn.style.backgroundColor = ""; }, 2000);' +
        '      });' +
        '    });' +
        '  });' +
        '  var allDivs = document.querySelectorAll(".max-w-5xl");' +
        '  allDivs.forEach(function(el) { el.classList.add("fade-in-up"); });' +
        '  var scrollObs = new IntersectionObserver(function(entries) {' +
        '    entries.forEach(function(e) { if(e.isIntersecting){ e.target.classList.add("visible"); scrollObs.unobserve(e.target); }});' +
        '  }, { threshold: 0.1 });' +
        '  allDivs.forEach(function(el) { scrollObs.observe(el); });' +
        '  var counters = document.querySelectorAll(".stat-counter");' +
        '  var cObs = new IntersectionObserver(function(entries) {' +
        '    entries.forEach(function(entry) {' +
        '      if(!entry.isIntersecting) return;' +
        '      var el = entry.target;' +
        '      var target = parseFloat(el.getAttribute("data-num"));' +
        '      var suffix = el.getAttribute("data-suffix") || "";' +
        '      var prefix = el.getAttribute("data-prefix") || "";' +
        '      var isDecimal = target % 1 !== 0;' +
        '      var duration = 1500; var start = null;' +
        '      function step(ts) {' +
        '        if(!start) start = ts;' +
        '        var progress = Math.min((ts-start)/duration,1);' +
        '        var ease = 1 - Math.pow(1-progress,3);' +
        '        var cur = target * ease;' +
        '        el.textContent = prefix + (isDecimal ? cur.toFixed(1) : Math.floor(cur).toLocaleString()) + suffix;' +
        '        if(progress < 1) requestAnimationFrame(step);' +
        '        else el.textContent = prefix + (isDecimal ? target.toFixed(1) : target.toLocaleString()) + suffix;' +
        '      }' +
        '      requestAnimationFrame(step);' +
        '      cObs.unobserve(el);' +
        '    });' +
        '  }, { threshold: 0.5 });' +
        '  counters.forEach(function(el) { cObs.observe(el); });' +
        '}' +
        'initPressKit();'
      }} />
    </div>
  )
}