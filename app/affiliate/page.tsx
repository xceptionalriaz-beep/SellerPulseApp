'use client'

// app/affiliate/page.tsx
import { useEffect, useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import {
  DollarSign, Users, TrendingUp, Shield, Zap, BarChart2,
  Youtube, FileText, MessageCircle, Mail, CheckCircle2,
  ArrowRight, CreditCard, Link2, Package,
  Megaphone, BookOpen
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
}

const STEPS = [
  { n: '01', icon: FileText, title: 'Apply in 2 minutes', desc: 'Fill out a short application. We review and approve within 24 hours.' },
  { n: '02', icon: Link2, title: 'Get your unique link', desc: 'You\'ll receive a personal tracking link and access to your affiliate dashboard.' },
  { n: '03', icon: Megaphone, title: 'Share with your audience', desc: 'Promote Riazify through your YouTube, blog, newsletter or social channels.' },
  { n: '04', icon: DollarSign, title: 'Earn every month', desc: 'Get paid recurring commission for up to 12 months per referral.' },
]

const WHO = [
  { icon: Youtube, title: 'eBay YouTubers', desc: 'Creators who teach eBay selling strategies to their audience.' },
  { icon: BookOpen, title: 'eBay Bloggers', desc: 'Writers who publish guides, reviews and tips for eBay sellers.' },
  { icon: MessageCircle, title: 'Facebook Group Admins', desc: 'Admins of eBay selling communities with engaged audiences.' },
  { icon: Mail, title: 'Newsletter Writers', desc: 'eCommerce newsletter operators with an eBay seller readership.' },
]

const WHAT_YOU_GET = [
  { icon: BarChart2, title: 'Real-time dashboard', desc: 'Track clicks, signups and earnings live from your affiliate dashboard.' },
  { icon: Link2, title: 'Unique tracking links', desc: 'Custom links with 30-day cookie tracking so you never miss a commission.' },
  { icon: Package, title: 'Marketing materials', desc: 'Banners, email templates and social graphics — ready to use.' },
  { icon: Shield, title: 'Dedicated support', desc: 'Direct access to our affiliate team whenever you need help.' },
  { icon: CreditCard, title: 'Monthly payouts', desc: 'Get paid every month via PayPal or bank transfer. No delays.' },
  { icon: TrendingUp, title: 'Performance bonuses', desc: 'Top affiliates unlock higher commission rates and exclusive bonuses.' },
]

const FAQS = [
  { q: 'How much can I earn?', a: 'You earn 25% recurring commission on every subscription. If a seller you refer pays $49/month, you earn $14.70 for up to 12 months. Top affiliates earn $500–$2,000+ per month.' },
  { q: 'When and how do I get paid?', a: 'Payouts are sent monthly (on the 15th) via PayPal or bank transfer. Check the commission details section above for the current minimum payout threshold.' },
  { q: 'How long is the cookie window?', a: 'We use a cookie window that tracks referrals so you get commission even if they don\'t sign up immediately. Check our current program details above.' },
  { q: 'Who can apply?', a: 'Anyone with an audience of eBay sellers or eCommerce enthusiasts. YouTubers, bloggers, newsletter writers, Facebook group admins and podcasters are all welcome to apply.' },
  { q: 'What marketing materials do you provide?', a: 'We provide banners in multiple sizes, email templates, social media graphics, and product screenshots. Everything you need to promote Riazify professionally.' },
  { q: 'How do I track my performance?', a: 'You\'ll have access to a real-time dashboard showing clicks, signups, active subscribers and total earnings. Updated daily.' },
]

const TESTIMONIALS = [
  { name: 'James K.', role: 'eBay YouTuber · 45K subscribers', text: 'I mentioned Riazify in one video and made $340 that month. The 30-day cookie means I still get commission from people who watched 3 months ago.', earn: '$280/mo', initial: 'J' },
  { name: 'Sarah M.', role: 'eBay Selling Blog · 12K readers', text: 'I wrote one review post and it still pays me every single month. Riazify converts incredibly well because it solves a real problem eBay sellers have.', earn: '$430/mo', initial: 'S' },
  { name: 'Tom R.', role: 'Facebook Group · 8K members', text: 'My group loves it. The tool actually works which makes recommending it easy. Best affiliate program I\'ve joined for the eBay niche.', earn: '$175/mo', initial: 'T' },
]

export default function AffiliatePage() {
  const [settings, setSettings] = useState({
    commission_rate: 0.25,
    commission_months: 12,
    min_payout: 50,
    cookie_days: 30,
    is_program_active: true,
    default_discount: 50,
  })
  const [calcPlans, setCalcPlans] = useState([
    { id: 'starter', name: 'Starter', price: 49 },
    { id: 'growth', name: 'Growth', price: 99 },
  ])

  // Derived display values
  const commPct = Math.round(settings.commission_rate * 100)
  const cookieDays = settings.cookie_days
  const minPayout = settings.min_payout
  const commMonths = settings.commission_months
  const perReferral = parseFloat((49 * settings.commission_rate).toFixed(2))
  const starterRef = parseFloat((29 * settings.commission_rate).toFixed(2))

  useEffect(() => {
    fetch('/api/affiliate/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) setSettings(d.settings)
        if (d.calcPlans && d.calcPlans.length > 0) setCalcPlans(d.calcPlans)
      })
      .catch(() => { })
  }, [])

  useEffect(() => {
    // Inject CSS
    const style = document.createElement('style')
    style.textContent = '.fade-in-up { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; } .fade-in-up.visible { opacity: 1; transform: translateY(0); }'
    document.head.appendChild(style)

    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item')
    faqItems.forEach((item) => {
      const btn = item.querySelector('.faq-btn') as HTMLElement
      const answer = item.querySelector('.faq-answer') as HTMLElement
      const icon = item.querySelector('.faq-icon') as HTMLElement
      if (!btn || !answer || !icon) return
      btn.addEventListener('click', () => {
        const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px'
        document.querySelectorAll<HTMLElement>('.faq-answer').forEach(a => { a.style.maxHeight = '0px' })
        document.querySelectorAll<HTMLElement>('.faq-icon').forEach(ic => {
          ic.textContent = '+'
          ic.style.backgroundColor = '#f3eeff'
          ic.style.color = '#7530fb'
        })
        if (!isOpen) {
          answer.style.maxHeight = answer.scrollHeight + 'px'
          icon.textContent = '×'
          icon.style.backgroundColor = '#7530fb'
          icon.style.color = '#ffffff'
        }
      })
    })

    // Calculator - same formula as user affiliate dashboard
    const slider = document.getElementById('calc-slider') as HTMLInputElement
    const refsEl = document.getElementById('calc-refs')
    const month1El = document.getElementById('calc-month1')
    const monthlyEl = document.getElementById('calc-monthly')
    const annualEl = document.getElementById('calc-annual')
    let activePlan = calcPlans[0]?.price ?? 49
    const discPct = (settings.default_discount ?? 50) / 100
    const discMonths = 1
    const commRate = settings.commission_rate ?? 0.25
    const commMo = settings.commission_months ?? 12

    const updateCalc = () => {
      if (!slider || !refsEl || !month1El || !monthlyEl || !annualEl) return
      const refs = parseInt(slider.value)
      const discountedPrice = activePlan * (1 - discPct)
      const month1Earn = discountedPrice * commRate
      const monthFullEarn = activePlan * commRate
      const total = refs * (month1Earn * discMonths + monthFullEarn * (commMo - discMonths))
      refsEl.textContent = String(refs)
      month1El.textContent = '$' + (refs * month1Earn).toFixed(2)
      monthlyEl.textContent = '$' + (refs * monthFullEarn).toFixed(2)
      annualEl.textContent = '$' + total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    if (slider) slider.addEventListener('input', updateCalc)
    updateCalc()

    // Plan buttons
    calcPlans.forEach(p => {
      const btn = document.getElementById(`plan-${p.id}`)
      if (!btn) return
      btn.addEventListener('click', () => {
        activePlan = p.price
        calcPlans.forEach(pp => {
          const b = document.getElementById(`plan-${pp.id}`) as HTMLElement
          if (!b) return
          b.style.backgroundColor = pp.id === p.id ? '#7530fb' : 'rgba(255,255,255,0.06)'
          b.style.color = pp.id === p.id ? '#ffffff' : 'rgba(255,255,255,0.6)'
          b.style.border = pp.id === p.id ? '1px solid #7530fb' : '1px solid rgba(255,255,255,0.1)'
        })
        updateCalc()
      })
    })

    // Scroll animations
    const allDivs = document.querySelectorAll('.max-w-6xl, .max-w-4xl, .max-w-3xl')
    const scrollObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); scrollObs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    allDivs.forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.top > window.innerHeight * 0.9) { el.classList.add('fade-in-up') }
      else { el.classList.add('visible') }
      scrollObs.observe(el)
    })

    // Counter animations
    const counters = document.querySelectorAll('.aff-counter')
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        const target = parseFloat(el.getAttribute('data-num') || '0')
        const suffix = el.getAttribute('data-suffix') || ''
        const prefix = el.getAttribute('data-prefix') || ''
        const isDecimal = target % 1 !== 0
        let start: number | null = null
        const step = (ts: number) => {
          if (!start) start = ts
          const progress = Math.min((ts - start) / 1500, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          const cur = target * ease
          el.textContent = prefix + (isDecimal ? cur.toFixed(1) : Math.floor(cur).toLocaleString()) + suffix
          if (progress < 1) requestAnimationFrame(step)
          else el.textContent = prefix + (isDecimal ? target.toFixed(1) : target.toLocaleString()) + suffix
        }
        requestAnimationFrame(step)
        cObs.unobserve(el)
      })
    }, { threshold: 0.5 })
    counters.forEach(el => cObs.observe(el))

    return () => { style.remove(); scrollObs.disconnect(); cObs.disconnect() }
  }, [settings, calcPlans])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }} suppressHydrationWarning>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. HERO ── */}
        <div style={{ backgroundColor: C.dark, position: 'relative', overflow: 'hidden' }}>
          {/* Radial brand glow */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 480, height: 480, borderRadius: '50%', background: 'rgba(117,48,251,0.18)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(184,250,51,0.06)', pointerEvents: 'none' }} />

          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24" style={{ position: 'relative', zIndex: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              {/* Left — Text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border"
                  style={{ backgroundColor: 'rgba(117,48,251,0.2)', borderColor: C.primary }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.accent }} />
                  <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                    PARTNER PROGRAM · NOW LIVE
                  </span>
                </div>
                <h1 className="text-[34px] md:text-[52px] font-black leading-tight mb-5 font-syne text-white tracking-tight">
                  Earn <span style={{ color: C.accent }}>{commPct}% recurring</span> commission promoting Riazify
                </h1>
                <p className="text-[16px] leading-relaxed mb-8" style={{ color: C.textLight }}>
                  Refer eBay sellers to the intelligence tool they actually need — and earn {commPct}% recurring monthly commission for up to {commMonths} months per subscriber. No caps. No limits.
                </p>
                <div className="flex items-center gap-4 flex-wrap justify-start">
                  <Link href="/affiliate/apply"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[15px] hover:scale-105 transition-all shadow-md cursor-pointer"
                    style={{ backgroundColor: C.accent, color: C.dark }}>
                    <span>Start Earning Now</span>
                    <ArrowRight size={16} className="stroke-[2.5]" />
                  </Link>
                  <a href="#how-it-works"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[15px] border hover:bg-[#2d1f4e] transition-all"
                    style={{ borderColor: C.borderDark, color: '#fff' }}>
                    See how it works ↓
                  </a>
                </div>
                <p className="text-[12px] mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Free to join · No minimum traffic · Approved within 24 hours
                </p>
              </div>

              {/* Right — Earnings Card */}
              <div className="flex flex-col gap-4">
                <div className="p-6 sm:p-7 rounded-3xl border shadow-xl"
                  style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                  <p className="text-[11px] font-black tracking-wider mb-4 font-syne uppercase" style={{ color: C.accent }}>
                    ESTIMATED RECURRING MONTHLY PAYOUT
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      { refs: '5 referrals', plan: `Starter ($29)`, earn: `$${(5 * starterRef).toFixed(2)}/mo` },
                      { refs: '20 referrals', plan: `Growth ($49)`, earn: `$${(20 * perReferral).toFixed(0)}/mo` },
                      { refs: '50 referrals', plan: `Growth ($49)`, earn: `$${(50 * perReferral).toFixed(0)}/mo` },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all"
                        style={{
                          backgroundColor: i === 1 ? 'rgba(117,48,251,0.2)' : 'rgba(255,255,255,0.03)',
                          borderColor: i === 1 ? C.primary : 'rgba(255,255,255,0.06)'
                        }}>
                        <div>
                          <p className="text-[13px] font-bold font-syne" style={{ color: '#fff' }}>{row.refs}</p>
                          <p className="text-[11px]" style={{ color: C.textLight }}>{row.plan} / subscriber</p>
                        </div>
                        <p className="text-[19px] font-black font-syne" style={{ color: i === 1 ? C.accent : '#fff' }}>{row.earn}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] mt-4 text-center font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Paid out every single month · No cap on referred volume
                  </p>
                </div>

                {/* 3 Quick Highlight Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: `${commPct}%`, label: 'Commission' },
                    { val: `${cookieDays}d`, label: 'Cookie Window' },
                    { val: `$${minPayout}`, label: 'Min Payout' },
                  ].map((s, i) => (
                    <div key={i} className="text-center p-4 rounded-2xl border"
                      style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                      <p className="text-[22px] font-black font-syne" style={{ color: C.accent }}>{s.val}</p>
                      <p className="text-[11px] uppercase tracking-wider font-syne mt-0.5" style={{ color: C.textLight }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. TRUST STATS STRIP ── */}
        <div style={{ backgroundColor: C.primary }}>
          <div className="max-w-6xl mx-auto px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { val: '$500+', label: 'Avg Monthly (Top Partners)', num: 500, suffix: '+', prefix: '$' },
                { val: `${commPct}%`, label: 'Recurring Commission', num: commPct, suffix: '%', prefix: '' },
                { val: `${cookieDays} days`, label: 'Attribution Cookie', num: cookieDays, suffix: ' days', prefix: '' },
                { val: '12,000+', label: 'Active eBay Sellers', num: 12000, suffix: '+', prefix: '' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="aff-counter text-[24px] md:text-[26px] font-black font-syne leading-none text-white"
                    data-num={s.num} data-suffix={s.suffix} data-prefix={s.prefix}>
                    {s.val}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider font-syne mt-1" style={{ color: C.accent }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. HOW IT WORKS ── */}
        <div id="how-it-works" style={{ backgroundColor: C.surface }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center font-syne uppercase" style={{ color: C.primary }}>HOW IT WORKS</p>
            <h2 className="text-[32px] md:text-[38px] font-black text-center mb-3 font-syne" style={{ color: C.textDark }}>
              Start earning in 4 simple steps
            </h2>
            <p className="text-[15px] text-center max-w-lg mx-auto mb-14" style={{ color: C.muted }}>
              No complex setup. No application fees. Apply, share with your audience, and build recurring revenue.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connecting line */}
              <div className="absolute top-8 left-[12.5%] right-[12.5%] h-0.5 hidden md:block"
                style={{ backgroundColor: C.border }} />
              {STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-4 relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10 shadow-md border"
                    style={{ backgroundColor: C.primary, borderColor: C.border }}>
                    <step.icon size={24} style={{ color: C.accent }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-wider mb-1 font-syne" style={{ color: C.primary }}>{step.n}</p>
                    <p className="text-[16px] font-black mb-1.5 font-syne" style={{ color: C.textDark }}>{step.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link href="/affiliate/apply"
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[14px] hover:scale-105 transition-all shadow-sm cursor-pointer"
                style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                <span>Apply for Partner Access</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 4. COMMISSION DETAILS ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center font-syne uppercase" style={{ color: C.accent }}>COMMISSION STRUCTURE</p>
            <h2 className="text-[32px] md:text-[38px] font-black text-center mb-14 font-syne" style={{ color: '#fff' }}>
              Transparent terms. <span style={{ color: C.accent }}>Guaranteed monthly payouts.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Rules */}
              <div className="p-8 rounded-3xl border shadow-xl"
                style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                    style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
                    <DollarSign size={22} style={{ color: C.accent }} />
                  </div>
                  <p className="text-[18px] font-black font-syne" style={{ color: '#fff' }}>What You Earn</p>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Commission Rate', value: `${commPct}% recurring`, highlight: true },
                    { label: 'Cookie Duration', value: `${cookieDays} days`, highlight: false },
                    { label: 'Commission Window', value: `${commMonths}-month recurring`, highlight: false },
                    { label: 'Starter Plan Payout', value: `$${starterRef.toFixed(2)}/mo per seller`, highlight: false },
                    { label: 'Growth Plan Payout', value: `$${perReferral.toFixed(2)}/mo per seller`, highlight: false },
                    { label: 'Max Earnings Cap', value: 'No limit — uncapped', highlight: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-[13px]" style={{ color: C.textLight }}>{item.label}</p>
                      <p className="text-[13px] font-black font-syne" style={{ color: item.highlight ? C.accent : '#fff' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payout Logistics */}
              <div className="p-8 rounded-3xl border shadow-xl"
                style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                    style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
                    <CreditCard size={22} style={{ color: C.accent }} />
                  </div>
                  <p className="text-[18px] font-black font-syne" style={{ color: '#fff' }}>How Payouts Work</p>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Payout Schedule', value: 'Monthly (15th of each month)' },
                    { label: 'Minimum Threshold', value: `$${minPayout} balance` },
                    { label: 'Payment Channels', value: 'PayPal · Direct Bank Transfer' },
                    { label: 'Disbursement Currency', value: 'USD' },
                    { label: 'Processing Speed', value: '1–3 business days' },
                    { label: 'Analytics Portal', value: 'Real-time click & conversion portal' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-[13px]" style={{ color: C.textLight }}>{item.label}</p>
                      <p className="text-[13px] font-black font-syne" style={{ color: '#fff' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. WHO IT'S FOR ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center font-syne uppercase" style={{ color: C.primary }}>PARTNER PROFILES</p>
            <h2 className="text-[32px] md:text-[38px] font-black text-center mb-3 font-syne" style={{ color: C.textDark }}>
              Built for eBay content creators & community leaders
            </h2>
            <p className="text-[15px] text-center max-w-lg mx-auto mb-12" style={{ color: C.muted }}>
              If your followers sell on eBay, Riazify solves their biggest challenges.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {WHO.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-2xl border shadow-xs transition-colors hover:border-[#7530fb]"
                  style={{ backgroundColor: C.surface, borderColor: C.border }}>
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                    <item.icon size={22} style={{ color: C.primary }} />
                  </div>
                  <div>
                    <p className="text-[16px] font-black mb-1 font-syne" style={{ color: C.textDark }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-5 rounded-2xl text-center border" style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
              <p className="text-[14px] font-bold font-syne" style={{ color: C.primary }}>
                Don&apos;t see your format above? Apply anyway — our partnerships team reviews every creator individually.
              </p>
            </div>
          </div>
        </div>

        {/* ── 6. WHAT YOU GET ── */}
        <div style={{ backgroundColor: C.surface }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center font-syne uppercase" style={{ color: C.primary }}>PARTNER TOOLKIT</p>
            <h2 className="text-[32px] md:text-[38px] font-black text-center mb-3 font-syne" style={{ color: C.textDark }}>
              Everything you need to convert
            </h2>
            <p className="text-[15px] text-center max-w-lg mx-auto mb-12" style={{ color: C.muted }}>
              We furnish high-converting assets, real-time analytics, and personalized affiliate support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {WHAT_YOU_GET.map((item, i) => (
                <div key={i} className="flex flex-col gap-3.5 p-6 rounded-2xl border shadow-xs"
                  style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center border"
                    style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                    <item.icon size={20} style={{ color: C.primary }} />
                  </div>
                  <div>
                    <p className="text-[15px] font-black mb-1 font-syne" style={{ color: C.textDark }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. EARNINGS CALCULATOR ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-black tracking-wider mb-2 font-syne uppercase" style={{ color: C.accent }}>EARNINGS ESTIMATOR</p>
            <h2 className="text-[32px] md:text-[38px] font-black mb-3 font-syne text-white">
              Calculate your projected revenue
            </h2>
            <p className="text-[15px] mb-10" style={{ color: C.textLight }}>
              Interactive projection based on real Riazify plan conversion benchmarks.
            </p>
            <div className="p-6 md:p-8 rounded-3xl border shadow-2xl"
              style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
              <div className="flex flex-col gap-6">
                {/* Plan Toggle */}
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <p className="text-[12px] font-bold uppercase tracking-wider font-syne" style={{ color: C.textLight }}>Plan Tier:</p>
                  {calcPlans.map(p => (
                    <button key={p.id} id={`plan-${p.id}`}
                      className="px-4 py-1.5 rounded-lg text-[12px] font-black font-syne transition-all cursor-pointer"
                      style={{
                        backgroundColor: p.id === calcPlans[0]?.id ? C.primary : 'rgba(255,255,255,0.06)',
                        color: p.id === calcPlans[0]?.id ? '#ffffff' : 'rgba(255,255,255,0.6)',
                        border: p.id === calcPlans[0]?.id ? `1px solid ${C.primary}` : '1px solid rgba(255,255,255,0.1)'
                      }}>
                      ${p.price} Plan
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-bold font-syne uppercase tracking-wider" style={{ color: C.textLight }}>Active Referrals</p>
                    <p id="calc-refs" className="text-[22px] font-black font-syne" style={{ color: C.accent }}>1</p>
                  </div>
                  <input id="calc-slider" type="range" min="1" max="100" defaultValue="1" suppressHydrationWarning
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: C.accent, backgroundColor: 'rgba(255,255,255,0.15)' }} />
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>1 seller</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>100 sellers</span>
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Month 1 Welcome Payout', id: 'calc-month1', val: '$9.80', highlight: false },
                    { label: 'Monthly Recurring Payout', id: 'calc-monthly', val: '$12.25', highlight: true },
                    { label: `${commMonths}-Month Total Earned`, id: 'calc-annual', val: '$144.55', highlight: false },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl text-center border"
                      style={{
                        backgroundColor: item.highlight ? 'rgba(117,48,251,0.25)' : 'rgba(255,255,255,0.03)',
                        borderColor: item.highlight ? C.primary : 'rgba(255,255,255,0.06)'
                      }}>
                      <p id={item.id} className="text-[24px] font-black font-syne" style={{ color: item.highlight ? C.accent : '#fff' }}>{item.val}</p>
                      <p className="text-[11px] mt-1 font-bold font-syne uppercase tracking-wide" style={{ color: C.textLight }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <p id="calc-note" className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Based on ${calcPlans[0]?.price ?? 49} plan × {commPct}% commission × {commMonths} months. Month 1 factors welcome promo pricing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 8. TESTIMONIALS ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center font-syne uppercase" style={{ color: C.primary }}>AFFILIATE STORIES</p>
            <h2 className="text-[32px] md:text-[38px] font-black text-center mb-12 font-syne" style={{ color: C.textDark }}>
              Real creators. Real recurring income.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl border shadow-xs"
                  style={{ backgroundColor: C.surface, borderColor: C.border }}>
                  <div className="flex gap-1 text-[#eab308]">
                    {[...Array(5)].map((_, si) => (
                      <span key={si}>★</span>
                    ))}
                  </div>
                  <p className="text-[13.5px] leading-relaxed flex-1 italic" style={{ color: C.textDark }}>&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center justify-between pt-3.5 border-t" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[13px] font-syne"
                        style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                        {t.initial}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold font-syne" style={{ color: C.textDark }}>{t.name}</p>
                        <p className="text-[11px]" style={{ color: C.muted }}>{t.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black font-syne" style={{ color: C.primary }}>{t.earn}</p>
                      <p className="text-[10px] uppercase font-syne font-bold" style={{ color: C.muted }}>Avg Payout</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 9. FAQ ── */}
        <div style={{ backgroundColor: C.surface }}>
          <div className="max-w-3xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center font-syne uppercase" style={{ color: C.primary }}>FAQ</p>
            <h2 className="text-[32px] md:text-[38px] font-black text-center mb-10 font-syne" style={{ color: C.textDark }}>
              Frequently asked questions
            </h2>
            <div className="flex flex-col gap-3">
              {FAQS.map((item, i) => (
                <div key={i} className="faq-item rounded-2xl border overflow-hidden shadow-xs"
                  style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <button className="faq-btn w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
                    style={{ backgroundColor: 'transparent', border: 'none' }}>
                    <span className="text-[15px] font-bold font-syne" style={{ color: C.textDark }}>{item.q}</span>
                    <span className="faq-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[18px] font-bold border transition-colors"
                      style={{ backgroundColor: C.primaryLight, borderColor: C.border, color: C.primary }}>+</span>
                  </button>
                  <div className="faq-answer px-5 overflow-hidden" style={{ maxHeight: 0, transition: 'max-height 0.3s ease' }}>
                    <p className="pb-5 text-[13.5px] leading-relaxed pt-1" style={{ color: C.muted }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 10. FINAL CTA ── */}
        <div style={{ backgroundColor: C.bg, paddingBottom: 40 }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden border shadow-2xl"
              style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(117,48,251,0.25)', pointerEvents: 'none' }} />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border"
                  style={{ backgroundColor: 'rgba(117,48,251,0.2)', borderColor: C.primary }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.accent }} />
                  <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                    JOIN 500+ CREATORS
                  </span>
                </div>
                <h2 className="text-[32px] md:text-[44px] font-black mb-4 font-syne text-white tracking-tight">
                  Ready to start earning recurring revenue?
                </h2>
                <p className="text-[16px] mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: C.textLight }}>
                  Apply today and begin earning 25% recurring monthly commission on every eBay seller you introduce to Riazify.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap mb-7">
                  <Link href="/affiliate/apply"
                    className="flex items-center gap-2 px-10 py-4 rounded-xl font-black text-[15px] hover:scale-105 transition-all shadow-lg cursor-pointer"
                    style={{ backgroundColor: C.accent, color: C.dark }}>
                    <span>Apply to Become a Partner</span>
                    <ArrowRight size={16} className="stroke-[2.5]" />
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  {['Free to join', 'Approved in 24hrs', 'No minimum traffic', '25% recurring payouts'].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} style={{ color: C.accent }} />
                      <span className="text-[12px] font-bold" style={{ color: C.textLight }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
