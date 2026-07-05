// app/about/page.tsx
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Target, BarChart2, Shield, Zap, Search,
  DollarSign, Package, Eye, FileText, MapPin,
  AlertTriangle, Clock, TrendingDown, Users,
  ArrowRight, Mail
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Us | Riazify',
  description: 'Learn about Riazify — built by an eBay seller, for eBay sellers.',
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

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>

        {/* ── 1. HERO ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-24 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
                 style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.lime }}/>
              <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>ABOUT RIAZIFY</span>
            </div>
            <h1 className="text-[48px] md:text-[64px] font-black leading-[1.05] mb-6" style={{ color: '#fff' }}>
              We're on a mission to<br/>
              <span style={{ color: C.lime }}>level the playing field</span><br/>
              for eBay sellers.
            </h1>
            <p className="text-[17px] leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
              eBay gives buyers all the power. Riazify gives it back to sellers — with the intelligence, protection and tools to compete and win on the world's biggest marketplace.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/auth/signup"
                className="px-8 py-3.5 rounded-xl font-black text-[14px] hover:opacity-90 transition-all"
                style={{ backgroundColor: C.lime, color: C.dark }}>
                Start Free →
              </Link>
              <Link href="/blog"
                className="px-8 py-3.5 rounded-xl font-bold text-[14px] border hover:opacity-80 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                Read our Blog
              </Link>
            </div>
            {/* Scroll indicator */}
            <div className="mt-10 flex flex-col items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <p className="text-[11px] font-bold tracking-widest">SCROLL</p>
              <div className="scroll-bounce w-5 h-5 rounded-full border flex items-center justify-center"
                   style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>
        </div>
        {/* ── 2. NUMBERS BAR ── */}
        <div style={{ backgroundColor: C.lime }}>
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: '12,000+', label: 'eBay sellers',     num: 12000, suffix: '+',  prefix: ''  },
                { val: '$2.4M+',  label: 'Profit generated', num: 2.4,   suffix: 'M+', prefix: '$' },
                { val: '98%',     label: 'Protection rate',  num: 98,    suffix: '%',  prefix: ''  },
                { val: '6',       label: 'Powerful tools',   num: 6,     suffix: '',   prefix: ''  },
              ].map((s, i) => (
                <div key={i}>
                  <p className="counter text-[32px] font-black leading-none"
                     data-num={s.num} data-suffix={s.suffix} data-prefix={s.prefix}
                     style={{ color: C.dark }}>{s.val}</p>
                  <p className="text-[12px] font-bold mt-1" style={{ color: 'rgba(26,36,16,0.6)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. ORIGIN STORY ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
              {/* Photo */}
              <div className="relative">
                <div className="rounded-3xl overflow-hidden aspect-square"
                     style={{ border: `3px solid ${C.lime}` }}>
                  <img
                    src="/founder.png"
                    alt="Reaz Uddin — Founder of Riazify"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Badge */}
                <div className="absolute -bottom-5 -right-5 px-5 py-3 rounded-2xl shadow-xl"
                     style={{ backgroundColor: C.lime }}>
                  <p className="text-[12px] font-black" style={{ color: C.dark }}>eBay Seller</p>
                  <p className="text-[12px] font-black" style={{ color: C.dark }}>& Founder</p>
                </div>
              </div>

              {/* Story */}
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>THE FOUNDER STORY</p>
                  <h2 className="text-[32px] font-black leading-tight mb-5" style={{ color: C.dark }}>
                    I built the tool I wish existed when I started selling
                  </h2>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-0">
                  {[
                    { year: 'The Problem', text: 'I started selling on eBay while building my ecommerce business in the USA. Every day I faced the same frustrating reality — fraudulent buyers, unknown profit margins, hours wasted manually researching products.' },
                    { year: 'The Search', text: 'I looked everywhere for a tool that could help. Everything I found was built for Amazon sellers. eBay sellers were an afterthought — if they were thought of at all.' },
                    { year: 'The Solution', text: 'So I built Riazify. Starting with order protection — the feature I needed most — and expanding into the full intelligence platform it is today. Every feature solves a problem I personally experienced.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 pb-6">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: C.lime }}/>
                        {i < 2 && <div className="w-px flex-1 mt-2" style={{ backgroundColor: C.border }}/>}
                      </div>
                      <div className="pb-2">
                        <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.limeDeep }}>{item.year}</p>
                        <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-[16px]"
                       style={{ backgroundColor: C.lime, color: C.dark }}>R</div>
                  <div>
                    <p className="text-[14px] font-black" style={{ color: C.dark }}>Reaz Uddin</p>
                    <p className="text-[12px]" style={{ color: C.muted }}>Founder & CEO, Riazify LLC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. MISSION + VISION ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>WHO WE ARE</p>
            <h2 className="text-[32px] font-black text-center mb-12" style={{ color: '#fff' }}>
              Purpose built for <span style={{ color: C.lime }}>eBay operators</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  label: 'OUR MISSION',
                  title: 'What we do today',
                  desc: 'To give every eBay seller the intelligence, protection and tools they need to compete and win — regardless of the size of their operation.',
                  icon: Target,
                },
                {
                  label: 'OUR VISION',
                  title: 'Where we\'re going',
                  desc: 'A world where any motivated eBay seller has access to enterprise-grade tools — the same data, protection and insights that only big operations could afford before.',
                  icon: TrendingDown,
                },
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                       style={{ backgroundColor: 'rgba(143,255,0,0.15)' }}>
                    <item.icon size={22} style={{ color: C.lime }}/>
                  </div>
                  <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.lime }}>{item.label}</p>
                  <h3 className="text-[20px] font-black mb-3" style={{ color: '#fff' }}>{item.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PULL QUOTE ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill={C.lime} style={{ margin: '0 auto 16px' }}>
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
            <p className="text-[24px] md:text-[32px] font-black leading-tight mb-6" style={{ color: C.dark }}>
              eBay sellers deserve the same quality of tools that Amazon sellers have had for years. That's exactly what we're building.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[14px]"
                   style={{ backgroundColor: C.lime, color: C.dark }}>R</div>
              <div className="text-left">
                <p className="text-[14px] font-black" style={{ color: C.dark }}>Reaz Uddin</p>
                <p className="text-[12px]" style={{ color: C.muted }}>Founder, Riazify</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. THE PROBLEM WE SOLVE ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>THE PROBLEM</p>
            <h2 className="text-[32px] font-black text-center mb-4" style={{ color: C.dark }}>
              eBay selling is harder than it looks
            </h2>
            <p className="text-[15px] text-center max-w-xl mx-auto mb-12" style={{ color: C.muted }}>
              Most sellers quit within 12 months. Not because they lack hustle — but because they lack the right tools.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: AlertTriangle,
                  title: 'Fraudulent buyers',
                  desc: 'Chargebacks, false "item not received" claims and return fraud cost eBay sellers millions every year. Most have no way to see it coming.',
                },
                {
                  icon: BarChart2,
                  title: 'No real profit data',
                  desc: 'Sellers buy stock based on gut feel and listed prices — not actual sold data. By the time they realise something isn\'t profitable, it\'s too late.',
                },
                {
                  icon: Clock,
                  title: 'Hours wasted on research',
                  desc: 'Finding winning products manually takes hours every day. By the time a seller spots a trend, someone else has already cornered the market.',
                },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                       style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                    <item.icon size={22} style={{ color: '#b91c1c' }}/>
                  </div>
                  <h3 className="text-[16px] font-black mb-2" style={{ color: C.dark }}>{item.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. HOW WE SOLVE IT ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>THE SOLUTION</p>
            <h2 className="text-[32px] font-black text-center mb-4" style={{ color: '#fff' }}>
              Six tools. <span style={{ color: C.lime }}>One platform.</span>
            </h2>
            <p className="text-[15px] text-center max-w-xl mx-auto mb-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Everything a serious eBay seller needs — built into one dashboard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Shield,      title: 'Order Protection',   desc: 'Every order risk-scored using 47 data points before you ship' },
                { icon: Search,      title: 'Product Research',   desc: 'Find winning products before your competitors do' },
                { icon: DollarSign,  title: 'Profit Calculator',  desc: 'Real margins after all eBay fees, shipping and costs' },
                { icon: Package,     title: 'Inventory Manager',  desc: 'Stock control, reorder alerts and demand forecasting' },
                { icon: Eye,         title: 'Competitor X-Ray',   desc: 'See exactly what any eBay seller is listing and selling' },
                { icon: FileText,    title: 'Title Builder',      desc: 'AI-optimised eBay titles that rank higher in search' },
              ].map((item, i) => (
                <div key={i} className="group p-5 rounded-2xl hover:scale-[1.02] transition-all duration-200"
                     style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                       style={{ backgroundColor: 'rgba(143,255,0,0.15)' }}>
                    <item.icon size={20} style={{ color: C.lime }}/>
                  </div>
                  <p className="text-[15px] font-black mb-1" style={{ color: '#fff' }}>{item.title}</p>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. VALUES ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>OUR VALUES</p>
            <h2 className="text-[32px] font-black text-center mb-12" style={{ color: C.dark }}>What we stand for</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: Target,   title: 'Seller First',         desc: 'Every feature we build starts with one question — does this make an eBay seller\'s life easier? We never build for the sake of building.' },
                { icon: BarChart2, title: 'Data Over Guesswork', desc: 'Selling decisions should be driven by real data — sell-through rates, margins, competitor patterns. Not gut feel or guesswork.' },
                { icon: Shield,   title: 'Protection First',     desc: 'We built order protection before anything else. Protecting your revenue is the foundation everything else is built on.' },
                { icon: Zap,      title: 'Always Improving',     desc: 'Riazify ships updates every week. We listen to sellers, identify pain points and build solutions fast. Done is better than perfect.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-5 p-6 rounded-2xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.dark }}>
                    <item.icon size={20} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p className="text-[16px] font-black mb-2" style={{ color: C.dark }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 8. MILESTONES ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>OUR JOURNEY</p>
            <h2 className="text-[32px] font-black text-center mb-14" style={{ color: C.dark }}>How we got here</h2>
            <div className="relative">
              {/* Line */}
              <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: C.border }}/>
              <div className="flex flex-col gap-8">
                {[
                  { date: '2023', title: 'The Idea',           desc: 'After years of selling on eBay and experiencing firsthand the lack of proper tools, the idea for Riazify was born.' },
                  { date: '2024', title: 'Building Begins',    desc: 'Development starts. Order Protection is built first — the most critical need for any eBay seller.' },
                  { date: 'Early 2025', title: 'Beta Launch',  desc: 'First 100 sellers join Riazify. Feedback shapes the product week by week.' },
                  { date: 'Mid 2025', title: '6 Tools Live',   desc: 'Full platform launches — Order Protection, Product Research, Profit Calculator, Inventory, Competitor X-Ray and Title Builder.' },
                  { date: '2026', title: '12,000+ Sellers',    desc: 'Riazify becomes the go-to platform for serious eBay operators across the USA, UK and internationally.' },
                ].map((item, i) => (
                  <div key={i} className={`flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-10 md:text-right' : 'md:pl-10 md:text-left'} hidden md:block`}>
                      <div className={`inline-block p-5 rounded-2xl border ${i % 2 === 0 ? '' : ''}`}
                           style={{ backgroundColor: '#fff', borderColor: C.border }}>
                        <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.limeDeep }}>{item.date}</p>
                        <p className="text-[15px] font-black mb-1" style={{ color: C.dark }}>{item.title}</p>
                        <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                      </div>
                    </div>
                    {/* Dot */}
                    <div className="relative flex items-start pt-5 shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[12px] z-10"
                           style={{ backgroundColor: C.lime, color: C.dark }}>{i + 1}</div>
                    </div>
                    {/* Mobile / right side */}
                    <div className="flex-1 md:flex-1 pl-2 md:pl-10 md:text-left block md:block">
                      <div className="p-5 rounded-2xl border md:inline-block" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                        <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.limeDeep }}>{item.date}</p>
                        <p className="text-[15px] font-black mb-1" style={{ color: C.dark }}>{item.title}</p>
                        <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 9. TESTIMONIALS ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>WHAT SELLERS SAY</p>
            <h2 className="text-[32px] font-black text-center mb-12" style={{ color: '#fff' }}>
              Real sellers. <span style={{ color: C.lime }}>Real results.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { quote: 'Riazify flagged a high-risk buyer before I shipped a £400 order. Saved me from a certain chargeback. The order protection alone is worth every penny.', name: 'James R.', role: '7-Figure eBay Seller · UK', initial: 'J' },
                { quote: 'I used the product scanner to find a niche 3 weeks before it went viral on eBay. Sold 200 units in 4 days. The research tools paid for themselves 100x over.', name: 'Sarah K.', role: 'eBay Dropshipper · USA', initial: 'S' },
                { quote: 'Finally a tool built for eBay operators. The Title Builder and Competitor X-Ray have completely changed how I approach sourcing and listing.', name: 'Marcus T.', role: 'eBay Power Seller · USA', initial: 'M' },
              ].map((t, i) => (
                <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl"
                     style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={C.lime} stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-[13px] leading-relaxed flex-1 italic" style={{ color: 'rgba(255,255,255,0.65)' }}>"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[13px] shrink-0"
                         style={{ backgroundColor: C.lime, color: C.dark }}>{t.initial}</div>
                    <div>
                      <p className="text-[13px] font-black" style={{ color: '#fff' }}>{t.name}</p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 10. TEAM ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-20 text-center">
            <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>THE TEAM</p>
            <h2 className="text-[32px] font-black mb-3" style={{ color: C.dark }}>Small team. Big mission.</h2>
            <p className="text-[15px] max-w-lg mx-auto mb-12" style={{ color: C.muted }}>
              Riazify is currently founder-led. Every feature, every line of code, every support reply comes from someone who genuinely cares about eBay sellers winning.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-5">
              {/* Founder card */}
              <div className="p-6 rounded-2xl border flex items-center gap-4"
                   style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-[24px] shrink-0"
                     style={{ backgroundColor: C.lime, color: C.dark }}>R</div>
                <div className="text-left">
                  <p className="text-[16px] font-black" style={{ color: C.dark }}>Reaz Uddin</p>
                  <p className="text-[13px]" style={{ color: C.limeDeep }}>Founder & CEO</p>
                  <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>eBay seller · Builder · Riazify LLC</p>
                </div>
              </div>
              {/* Hiring card */}
              <div className="p-6 rounded-2xl border flex items-center gap-4"
                   style={{ backgroundColor: C.dark, borderColor: 'rgba(143,255,0,0.2)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                     style={{ backgroundColor: 'rgba(143,255,0,0.1)', border: '2px dashed rgba(143,255,0,0.3)' }}>
                  <Users size={24} style={{ color: C.lime }}/>
                </div>
                <div className="text-left">
                  <p className="text-[16px] font-black" style={{ color: '#fff' }}>We're growing</p>
                  <p className="text-[13px]" style={{ color: C.lime }}>Positions coming soon</p>
                  <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Stay tuned for openings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 11. CONTACT ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>GET IN TOUCH</p>
            <h2 className="text-[32px] font-black text-center mb-3" style={{ color: C.dark }}>We'd love to hear from you</h2>
            <p className="text-[15px] text-center max-w-md mx-auto mb-12" style={{ color: C.muted }}>
              Question, feedback or partnership idea — reach out anytime.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'General Support', email: 'support@riazify.com', desc: 'Questions about the platform', icon: Mail },
                { label: 'Business & Press', email: 'hello@riazify.com', desc: 'Partnerships and media enquiries', icon: Users },
                { label: 'Privacy & Legal', email: 'privacy@riazify.com', desc: 'Data and legal matters', icon: Shield },
              ].map((c, i) => (
                <a key={i} href={`mailto:${c.email}`}
                   className="flex flex-col gap-3 p-6 rounded-2xl border hover:shadow-md transition-all group"
                   style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                       style={{ backgroundColor: C.dark }}>
                    <c.icon size={18} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.muted }}>{c.label}</p>
                    <p className="text-[14px] font-black group-hover:text-[#4a8f00] transition-colors" style={{ color: C.dark }}>{c.email}</p>
                    <p className="text-[12px] mt-1" style={{ color: C.muted }}>{c.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-auto" style={{ color: C.limeDeep }}>
                    <ArrowRight size={14}/>
                    <span className="text-[12px] font-bold">Send email</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── 12. PRESS / MEDIA ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-3xl border"
                 style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <div className="flex-1">
                <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>PRESS & MEDIA</p>
                <h2 className="text-[24px] font-black mb-2" style={{ color: C.dark }}>Writing about Riazify?</h2>
                <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>
                  We'd love to help. For press enquiries, interview requests, brand assets and company information — our team responds within 24 hours.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a href="mailto:hello@riazify.com"
                   className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[13px] hover:opacity-90 transition-all"
                   style={{ backgroundColor: C.dark, color: C.lime }}>
                  <Mail size={15}/>
                  hello@riazify.com
                </a>
                <p className="text-[11px] text-center" style={{ color: C.muted }}>Press Kit coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 13. TRUST BADGES ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="text-[11px] font-black tracking-wider mb-8 text-center" style={{ color: C.muted }}>TRUST & COMPLIANCE</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield,    title: 'Riazify LLC',         desc: 'US Registered Business' },
                { icon: MapPin,    title: 'United States',       desc: 'Headquartered in USA' },
                { icon: FileText,  title: 'GDPR Compliant',      desc: 'Full EU & UK compliance' },
                { icon: Zap,       title: 'SSL Secured',         desc: '256-bit encryption' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center"
                     style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                       style={{ backgroundColor: 'rgba(143,255,0,0.15)' }}>
                    <b.icon size={22} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p className="text-[13px] font-black" style={{ color: '#fff' }}>{b.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 14. FAQ ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-3xl mx-auto px-6 py-16">
            <p className="text-[11px] font-black tracking-wider mb-3 text-center" style={{ color: C.muted }}>QUICK ANSWERS</p>
            <h2 className="text-[28px] font-black text-center mb-10" style={{ color: C.dark }}>Frequently asked questions</h2>
            <div className="flex flex-col gap-3">
              {[
                {
                  q: 'Is Riazify affiliated with eBay?',
                  a: 'No. Riazify is an independent platform and is not affiliated with, endorsed by, or officially connected to eBay Inc. We are a third-party tool built to help eBay sellers succeed on the platform.'
                },
                {
                  q: 'Where is Riazify based?',
                  a: 'Riazify is operated by Riazify LLC, a company registered in the United States. Our platform serves sellers in the USA, UK and internationally.'
                },
                {
                  q: 'Is my eBay account data safe?',
                  a: 'Absolutely. We take data security seriously — all data is encrypted in transit and at rest. We never share your data with third parties and you remain in full control of your information at all times.'
                },
                {
                  q: 'Do you offer a free trial?',
                  a: 'Yes — Riazify offers a free plan with access to core features. No credit card required to get started. Paid plans unlock the full platform.'
                },
              ].map((item, i) => (
                <div key={i} className="faq-item rounded-2xl border overflow-hidden"
                     style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <button
                    className="faq-btn w-full flex items-center justify-between gap-4 p-5 text-left"
                    style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span className="text-[15px] font-black" style={{ color: C.dark }}>{item.q}</span>
                    <span className="faq-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[20px] font-bold transition-transform"
                          style={{ backgroundColor: C.lime, color: C.dark }}>+</span>
                  </button>
                  <div className="faq-answer px-5 overflow-hidden" style={{ maxHeight: 0, transition: 'max-height 0.3s ease' }}>
                    <p className="pb-5 text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes bounce-scroll { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } } .scroll-bounce { animation: bounce-scroll 1.5s ease-in-out infinite; } .fade-in-up { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; } .fade-in-up.visible { opacity: 1; transform: translateY(0); }' }} />
        <script dangerouslySetInnerHTML={{ __html: `
          function initFAQ() {
            var items = document.querySelectorAll('.faq-item');
            if(!items.length){ setTimeout(initFAQ, 100); return; }
            items.forEach(function(item) {
              var btn = item.querySelector('.faq-btn');
              var answer = item.querySelector('.faq-answer');
              var icon = item.querySelector('.faq-icon');
              btn.addEventListener('click', function() {
                var isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
                document.querySelectorAll('.faq-answer').forEach(function(a) { a.style.maxHeight = '0px'; });
                document.querySelectorAll('.faq-icon').forEach(function(ic) { ic.textContent = '+'; });
                if (!isOpen) {
                  answer.style.maxHeight = answer.scrollHeight + 'px';
                  icon.textContent = '×';
                }
              });
            });
          }
          initFAQ();
          // Scroll fade animations
          var allDivs = document.querySelectorAll('.max-w-5xl, .max-w-4xl, .max-w-3xl');
          allDivs.forEach(function(el) { el.classList.add('fade-in-up'); });
          var scrollObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) { if(e.isIntersecting){ e.target.classList.add('visible'); scrollObserver.unobserve(e.target); }});
          }, { threshold: 0.1 });
          allDivs.forEach(function(el) { scrollObserver.observe(el); });
          // Counter animations
          function initCounters() {
            var counters = document.querySelectorAll('.counter');
            if(!counters.length){ setTimeout(initCounters, 200); return; }
            var cObs = new IntersectionObserver(function(entries) {
              entries.forEach(function(entry) {
                if(!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseFloat(el.getAttribute('data-num'));
                var suffix = el.getAttribute('data-suffix') || '';
                var prefix = el.getAttribute('data-prefix') || '';
                var duration = 1500; var start = null;
                var isDecimal = target % 1 !== 0;
                function step(ts) {
                  if(!start) start = ts;
                  var progress = Math.min((ts-start)/duration,1);
                  var ease = 1 - Math.pow(1-progress,3);
                  var cur = target * ease;
                  el.textContent = prefix + (isDecimal ? cur.toFixed(1) : Math.floor(cur).toLocaleString()) + suffix;
                  if(progress < 1) requestAnimationFrame(step);
                  else el.textContent = prefix + (isDecimal ? target.toFixed(1) : target.toLocaleString()) + suffix;
                }
                requestAnimationFrame(step);
                cObs.unobserve(el);
              });
            }, { threshold: 0.5 });
            counters.forEach(function(el) { cObs.observe(el); });
          }
          initCounters();
        `}} />

        {/* ── 15. CTA ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div style={{ backgroundColor: C.dark, borderRadius: 32, position: 'relative', overflow: 'hidden', padding: '64px 48px' }}>
              {/* Content */}
              <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                     style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.lime }}/>
                  <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>JOIN 12,000+ SELLERS</span>
                </div>
                <h2 className="text-[36px] md:text-[44px] font-black mb-4" style={{ color: '#fff' }}>
                  Ready to sell smarter?
                </h2>
                <p className="text-[16px] mb-10 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Join thousands of eBay sellers using Riazify to protect orders, research products and grow profits — starting today.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link href="/auth/signup"
                    className="px-8 py-4 rounded-xl font-black text-[15px] hover:opacity-90 transition-all"
                    style={{ backgroundColor: C.lime, color: C.dark }}>
                    Start Free — No Card Needed
                  </Link>
                  <Link href="/pricing"
                    className="px-8 py-4 rounded-xl font-bold text-[15px] border hover:opacity-80 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    View Pricing
                  </Link>
                </div>
                <p className="text-[12px] mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No credit card required · Cancel anytime · 7-day money back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />

      </div>
    </div>
  )
}