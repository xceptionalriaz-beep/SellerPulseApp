// app/careers/page.tsx
// Careers & Open Roles at Riazify — v2.0

import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import JobListings from '@/components/landing/JobListings'
import LifeAtRiazify from '@/components/landing/LifeAtRiazify'
import TypewriterText from '@/components/ui/TypewriterText'
import type { Metadata } from 'next'
import {
  MapPin, TrendingUp, Users, Zap, Code, Megaphone,
  Headphones, BarChart2, Briefcase, Mail, Shield,
  Target, ArrowRight, CheckCircle2, ChevronDown
} from 'lucide-react'

export const revalidate = 0

async function getJobs() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await (supabase.from('job_postings') as any)
      .select('*')
      .eq('is_published', true)
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

export const metadata: Metadata = {
  title: 'Careers — Build the Seller Operating System | Riazify',
  description: 'Join the remote-first team building the future of eBay selling, order intelligence, and margin optimization.',
}

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
}

const WHY = [
  { icon: MapPin, title: 'Remote-First Culture', desc: 'Work from anywhere in the world. We operate with high autonomy and asynchronous communication.' },
  { icon: TrendingUp, title: 'Meaningful Equity', desc: 'Own a tangible piece of the platform you build. Every early contributor shares direct upside.' },
  { icon: Users, title: 'High-Ownership Team', desc: 'Ship directly to 12,000+ merchants without convoluted approvals or corporate red tape.' },
  { icon: Zap, title: 'Massive Marketplace', desc: 'eBay powers over $70B in annual volume. We are building the definitive operating system.' },
]

const FUTURE_ROLES = [
  { icon: Code, role: 'Senior Full-Stack Engineer', type: 'Engineering', desc: 'Architect high-throughput eBay data pipelines, threat-scoring engines, and modern React interfaces.' },
  { icon: Megaphone, role: 'Growth & Lifecycle Marketer', type: 'Marketing', desc: 'Scale organic acquisition, YouTube creator partnerships, and developer community flywheels.' },
  { icon: Headphones, role: 'Seller Success Specialist', type: 'Support', desc: 'Directly guide top-tier sellers through order dispute protection, Cassini audits, and onboarding.' },
  { icon: BarChart2, role: 'Marketplace Data Analyst', type: 'Data / AI', desc: 'Extract predictive sold-velocity models and inventory demand forecasts across millions of listings.' },
]

const VALUES = [
  { icon: Target, title: 'Seller-Obsessed', desc: 'Every feature and line of code must improve an eBay merchant’s bottom line or protect their operational safety.' },
  { icon: Zap, title: 'Bias for Action', desc: 'We ship weekly. Thoughtful execution today beats theoretical perfection next month.' },
  { icon: Shield, title: 'Radical Candor', desc: 'Transparent feedback with zero politics. We tell the truth to sellers and to one another.' },
  { icon: Users, title: 'Founder Mentality', desc: 'Take complete ownership of your domain. Proactively identify bottlenecks and solve them.' },
]

const FAQS = [
  { q: 'Is Riazify a fully distributed team?', a: 'Yes. We are 100% remote-first with teammates across the Americas, Europe, and Asia. We prioritize async workflows over fixed meeting blocks.' },
  { q: 'When do you plan to open active hiring?', a: 'We plan our next engineering and growth cohort for Q3/Q4. Speculative applications submitted today receive priority review.' },
  { q: 'Can I submit a speculative portfolio or CV?', a: 'Yes! If you have proven experience scaling ecommerce SaaS, Cassini SEO tools, or high-volume scrapers, reach out directly at careers@riazify.com.' },
  { q: 'What does your technical hiring process look like?', a: 'A quick 20-minute intro chat, a realistic 2-hour take-home task representative of daily work, and a final architectural walkthrough with the founder.' },
]

export default async function CareersPage() {
  const jobs = await getJobs()

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. Hero Header ── */}
        <header className="border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.accent }} />
              <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                HIRING COHORT · 2026
              </span>
            </div>

            <h1 className="text-[36px] md:text-[52px] font-black leading-tight mb-6 font-syne text-white tracking-tight">
              <TypewriterText
                text="Join the team building the future of eBay selling"
                speed={40}
                delay={200}
                cursor={true}
                style={{ color: '#ffffff' }}
              />
            </h1>

            <p className="text-[16px] leading-relaxed max-w-2xl mx-auto mb-10 font-medium" style={{ color: C.textLight }}>
              We are a high-conviction, product-led team solving the hardest operational problems in marketplace commerce. If you value autonomy and direct impact, welcome home.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="#roles"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black font-syne text-[14px] transition-transform hover:scale-105 shadow-md cursor-pointer"
                style={{ backgroundColor: C.accent, color: C.dark }}
              >
                <Mail size={15} />
                <span>View Open Positions</span>
              </a>
              <a
                href="#why"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[14px] border transition-colors hover:bg-[#271c42] cursor-pointer"
                style={{ borderColor: C.borderDark, color: '#ffffff' }}
              >
                <span>Why Join Us ↓</span>
              </a>
            </div>

          </div>
        </header>

        {/* ── 2. Perks Strip ── */}
        <section className="border-b" style={{ backgroundColor: C.primary, borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {['100% Remote-First', 'Equity Allocation', 'High Ownership', 'Fast-Paced Growth'].map((perk, i) => (
                <p key={i} className="text-[12.5px] font-bold font-syne uppercase tracking-wider text-white">
                  {perk}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Why Work At Riazify ── */}
        <section id="why" className="py-20 border-b bg-white" style={{ borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-lg mx-auto mb-12">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-2" style={{ color: C.primary }}>
                CULTURE &amp; ENVIRONMENT
              </p>
              <h2 className="text-[30px] md:text-[36px] font-black font-syne tracking-tight" style={{ color: C.textDark }}>
                Where your code &amp; ideas directly shape the product
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {WHY.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-2xl border bg-[#f8f7ff] shadow-xs"
                  style={{ borderColor: C.border }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: C.surface, borderColor: C.border }}
                  >
                    <item.icon size={20} style={{ color: C.primary }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold font-syne mb-1" style={{ color: C.textDark }}>
                      {item.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Open Positions ── */}
        <section id="roles" className="py-20 border-b" style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-lg mx-auto mb-10">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-2" style={{ color: C.primary }}>
                CURRENT OPPORTUNITIES
              </p>
              <h2 className="text-[30px] md:text-[36px] font-black font-syne" style={{ color: C.textDark }}>
                Open positions
              </h2>
            </div>

            {jobs.length > 0 ? (
              <JobListings jobs={jobs} />
            ) : (
              <div
                className="rounded-2xl border p-12 text-center flex flex-col items-center gap-4 bg-white shadow-xs"
                style={{ borderColor: C.border }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border"
                  style={{ backgroundColor: C.primaryLight, borderColor: C.border }}
                >
                  <Briefcase size={26} style={{ color: C.primary }} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold font-syne mb-1" style={{ color: C.textDark }}>
                    No published listings right now
                  </h3>
                  <p className="text-[13.5px] max-w-md mx-auto leading-relaxed" style={{ color: C.muted }}>
                    We are preparing our next cohort of engineering and growth roles. You can submit a speculative application below to be contacted first.
                  </p>
                </div>
                <a
                  href="mailto:careers@riazify.com?subject=Speculative%20Application%20-%20Riazify"
                  className="px-6 py-2.5 rounded-lg text-[13px] font-bold font-syne text-white transition-opacity hover:opacity-90 mt-2"
                  style={{ backgroundColor: C.dark }}
                >
                  Submit Speculative CV →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ── 5. Future Roles Pipeline ── */}
        <section className="py-20 border-b bg-white" style={{ borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-lg mx-auto mb-12">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-2" style={{ color: C.primary }}>
                UPCOMING POSITIONS
              </p>
              <h2 className="text-[30px] md:text-[36px] font-black font-syne" style={{ color: C.textDark }}>
                Roles we will be opening
              </h2>
              <p className="text-[13.5px] mt-2" style={{ color: C.muted }}>
                If your expertise aligns with these areas, reach out ahead of public posting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {FUTURE_ROLES.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-2xl border bg-white shadow-xs hover:border-[#7530fb] transition-colors"
                  style={{ borderColor: C.border }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: C.primaryLight, borderColor: C.border }}
                  >
                    <item.icon size={20} style={{ color: C.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-[15px] font-bold font-syne truncate" style={{ color: C.textDark }}>
                        {item.role}
                      </h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md font-syne uppercase"
                        style={{ backgroundColor: C.primaryLight, color: C.primary }}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Values ── */}
        <section className="py-20 border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-lg mx-auto mb-12">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-2" style={{ color: C.accent }}>
                OPERATING PRINCIPLES
              </p>
              <h2 className="text-[30px] md:text-[36px] font-black font-syne text-white tracking-tight">
                Who thrives at Riazify
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {VALUES.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-2xl border shadow-sm"
                  style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}
                  >
                    <item.icon size={20} style={{ color: C.accent }} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold font-syne text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.textLight }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. Life At Riazify Component ── */}
        <LifeAtRiazify />

        {/* ── 8. FAQs Accordion ── */}
        <section className="py-20 border-b bg-white" style={{ borderColor: C.border }}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-1" style={{ color: C.primary }}>
                HIRING FAQ
              </p>
              <h2 className="text-[28px] md:text-[32px] font-black font-syne" style={{ color: C.textDark }}>
                Frequently asked questions
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {FAQS.map((item, i) => (
                <details
                  key={i}
                  className="rounded-2xl border bg-white overflow-hidden shadow-2xs group"
                  style={{ borderColor: C.border }}
                >
                  <summary
                    className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none select-none"
                    style={{ color: C.textDark }}
                  >
                    <span className="text-[14.5px] font-bold font-syne">{item.q}</span>
                    <span className="text-[18px] font-bold shrink-0 transition-transform group-open:rotate-45" style={{ color: C.primary }}>
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: C.border }}>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. Final Call to Action ── */}
        <section className="py-16" style={{ backgroundColor: C.bg }}>
          <div className="max-w-4xl mx-auto px-6">
            <div
              className="rounded-3xl p-10 md:p-12 text-center border shadow-xl relative overflow-hidden"
              style={{ backgroundColor: C.dark, borderColor: C.borderDark }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 border"
                style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}
              >
                <CheckCircle2 size={13} style={{ color: C.accent }} />
                <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                  JOIN OUR NETWORK
                </span>
              </div>

              <h2 className="text-[28px] md:text-[36px] font-black font-syne text-white tracking-tight mb-3">
                Not ready to apply just yet?
              </h2>

              <p className="text-[14.5px] mb-8 max-w-md mx-auto leading-relaxed" style={{ color: C.textLight }}>
                Follow our engineering and seller insights across social channels to stay updated on our roadmap.
              </p>

              <div className="flex items-center justify-center gap-3.5 flex-wrap">
                <a
                  href="https://twitter.com/riazify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-bold text-[13px] border transition-colors hover:bg-[#271c42]"
                  style={{ borderColor: C.borderDark, color: '#ffffff' }}
                >
                  Follow on X
                </a>
                <a
                  href="https://linkedin.com/company/riazify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-bold text-[13px] border transition-colors hover:bg-[#271c42]"
                  style={{ borderColor: C.borderDark, color: '#ffffff' }}
                >
                  Connect on LinkedIn
                </a>
                <Link
                  href="/about"
                  className="px-6 py-3 rounded-xl font-black font-syne text-[13px] transition-transform hover:scale-105"
                  style={{ backgroundColor: C.accent, color: C.dark }}
                >
                  Learn About Riazify →
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
