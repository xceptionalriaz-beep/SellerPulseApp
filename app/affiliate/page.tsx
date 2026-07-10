'use client'
// app/affiliate/page.tsx
import { useEffect, useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import {
  DollarSign, Users, TrendingUp, Shield, Zap, BarChart2,
  Youtube, FileText, MessageCircle, Mail, CheckCircle,
  ArrowRight, CreditCard, Link2, Package,
  Megaphone, BookOpen
} from 'lucide-react'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
}

const STEPS = [
  { n: '01', icon: FileText,   title: 'Apply in 2 minutes',    desc: 'Fill out a short application. We review and approve within 24 hours.' },
  { n: '02', icon: Link2,      title: 'Get your unique link',  desc: 'You\'ll receive a personal tracking link and access to your affiliate dashboard.' },
  { n: '03', icon: Megaphone,  title: 'Share with your audience', desc: 'Promote Riazify through your YouTube, blog, newsletter or social channels.' },
  { n: '04', icon: DollarSign, title: 'Earn every month',      desc: 'Get paid recurring commission for up to 12 months per referral.' },
]

const WHO = [
  { icon: Youtube,       title: 'eBay YouTubers',       desc: 'Creators who teach eBay selling strategies to their audience.' },
  { icon: BookOpen,      title: 'eBay Bloggers',        desc: 'Writers who publish guides, reviews and tips for eBay sellers.' },
  { icon: MessageCircle, title: 'Facebook Group Admins', desc: 'Admins of eBay selling communities with engaged audiences.' },
  { icon: Mail,          title: 'Newsletter Writers',    desc: 'eCommerce newsletter operators with an eBay seller readership.' },
]

const WHAT_YOU_GET = [
  { icon: BarChart2,   title: 'Real-time dashboard',     desc: 'Track clicks, signups and earnings live from your affiliate dashboard.' },
  { icon: Link2,       title: 'Unique tracking links',   desc: 'Custom links with 30-day cookie tracking so you never miss a commission.' },
  { icon: Package,     title: 'Marketing materials',     desc: 'Banners, email templates and social graphics — ready to use.' },
  { icon: Shield,      title: 'Dedicated support',       desc: 'Direct access to our affiliate team whenever you need help.' },
  { icon: CreditCard,  title: 'Monthly payouts',         desc: 'Get paid every month via PayPal or bank transfer. No delays.' },
  { icon: TrendingUp,  title: 'Performance bonuses',     desc: 'Top affiliates unlock higher commission rates and exclusive bonuses.' },
]

const FAQS = [
  { q: 'How much can I earn?',             a: 'You earn 25% recurring commission on every subscription. If a seller you refer pays $49/month, you earn $14.70 for up to 12 months. Top affiliates earn $500–$2,000+ per month.' },
  { q: 'When and how do I get paid?',      a: 'Payouts are sent monthly (on the 15th) via PayPal or bank transfer. Check the commission details section above for the current minimum payout threshold.' },
  { q: 'How long is the cookie window?',   a: 'We use a cookie window that tracks referrals so you get commission even if they don\'t sign up immediately. Check our current program details above.' },
  { q: 'Who can apply?',                   a: 'Anyone with an audience of eBay sellers or eCommerce enthusiasts. YouTubers, bloggers, newsletter writers, Facebook group admins and podcasters are all welcome to apply.' },
  { q: 'What marketing materials do you provide?', a: 'We provide banners in multiple sizes, email templates, social media graphics, and product screenshots. Everything you need to promote Riazify professionally.' },
  { q: 'How do I track my performance?',   a: 'You\'ll have access to a real-time dashboard showing clicks, signups, active subscribers and total earnings. Updated daily.' },
]

const TESTIMONIALS = [
  { name: 'James K.', role: 'eBay YouTuber · 45K subscribers', text: 'I mentioned Riazify in one video and made $340 that month. The 30-day cookie means I still get commission from people who watched 3 months ago.', earn: '$280/mo', initial: 'J' },
  { name: 'Sarah M.', role: 'eBay Selling Blog · 12K readers',  text: 'I wrote one review post and it still pays me every single month. Riazify converts incredibly well because it solves a real problem eBay sellers have.', earn: '$430/mo', initial: 'S' },
  { name: 'Tom R.',   role: 'Facebook Group · 8K members',       text: 'My group loves it. The tool actually works which makes recommending it easy. Best affiliate program I\'ve joined for the eBay niche.', earn: '$175/mo', initial: 'T' },
]

export default function AffiliatePage() {
  const [settings, setSettings] = useState({
    commission_rate:   0.25,
    commission_months: 12,
    min_payout:        50,
    cookie_days:       30,
    is_program_active: true,
    default_discount:  50,
  })
  const [calcPlans, setCalcPlans] = useState([
    { id: 'starter', name: 'Starter', price: 49 },
    { id: 'growth',  name: 'Growth',  price: 99 },
  ])

  // Derived display values
  const commPct     = Math.round(settings.commission_rate * 100)
  const cookieDays  = settings.cookie_days
  const minPayout   = settings.min_payout
  const commMonths  = settings.commission_months
  const perReferral = parseFloat((49 * settings.commission_rate).toFixed(2))
  const starterRef  = parseFloat((29 * settings.commission_rate).toFixed(2))

  useEffect(() => {
    fetch('/api/affiliate/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) setSettings(d.settings)
        if (d.calcPlans && d.calcPlans.length > 0) setCalcPlans(d.calcPlans)
      })
      .catch(() => {})
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
        document.querySelectorAll<HTMLElement>('.faq-icon').forEach(ic => { ic.textContent = '+' })
        if (!isOpen) { answer.style.maxHeight = answer.scrollHeight + 'px'; icon.textContent = '×' }
      })
    })

    // Calculator
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
          b.style.backgroundColor = pp.id === p.id ? '#1a2410' : 'rgba(255,255,255,0.08)'
          b.style.color = pp.id === p.id ? '#8fff00' : 'rgba(255,255,255,0.5)'
          b.style.border = pp.id === p.id ? '1px solid #8fff00' : '1px solid rgba(255,255,255,0.1)'
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
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }} suppressHydrationWarning>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. HERO ── */}
        <div style={{ backgroundColor: C.dark, position: 'relative', overflow: 'hidden' }}>
          {/* Background grid pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(143,255,0,0.08) 1px, transparent 0)`, backgroundSize: '32px 32px', pointerEvents: 'none' }}/>
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-24" style={{ position: 'relative', zIndex: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* Left — text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                     style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.lime }}/>
                  <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>AFFILIATE PROGRAM — NOW OPEN</span>
                </div>
                <h1 className="text-[28px] md:text-[52px] font-black leading-tight mb-5" style={{ color: '#fff' }}>
                  Earn <span style={{ color: C.lime }}>{commPct}% recurring</span> commission promoting Riazify
                </h1>
                <p className="text-[16px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Refer eBay sellers to the tool they actually need — and earn {commPct}% commission for up to {commMonths} months per customer. No caps. No limits.
                </p>
                <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                  <Link href="/affiliate/apply"
                        className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[15px] hover:opacity-90 transition-all"
                        style={{ backgroundColor: C.lime, color: C.dark }}>
                    Start Earning Now <ArrowRight size={16}/>
                  </Link>
                  <a href="#how-it-works"
                     className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[15px] border hover:opacity-80 transition-all"
                     style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    See how it works ↓
                  </a>
                </div>
                <p className="text-[12px] mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Free to join · No minimum traffic · Approved within 24 hours
                </p>
              </div>

              {/* Right — earnings card */}
              <div className="flex flex-col gap-4">
                {/* Main earnings card */}
                <div className="p-6 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(143,255,0,0.2)' }}>
                  <p className="text-[12px] font-black tracking-wider mb-4" style={{ color: C.muted }}>EXAMPLE MONTHLY EARNINGS</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { refs: '5 referrals',  plan: `Starter ($29)`,  earn: `$${(5 * starterRef).toFixed(2)}/mo` },
                      { refs: '20 referrals', plan: `Growth ($49)`,   earn: `$${(20 * perReferral).toFixed(0)}/mo`   },
                      { refs: '50 referrals', plan: `Growth ($49)`,   earn: `$${(50 * perReferral).toFixed(0)}/mo`   },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                           style={{ backgroundColor: i === 1 ? 'rgba(143,255,0,0.12)' : 'rgba(255,255,255,0.04)', border: i === 1 ? '1px solid rgba(143,255,0,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <p className="text-[13px] font-bold" style={{ color: '#fff' }}>{row.refs}</p>
                          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{row.plan}/subscriber</p>
                        </div>
                        <p className="text-[18px] font-black" style={{ color: i === 1 ? C.lime : '#fff' }}>{row.earn}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] mt-4 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Recurring every month · No cap on earnings
                  </p>
                </div>

                {/* 3 quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: `${commPct}%`,    label: 'Commission' },
                    { val: '90',     label: 'Day cookie' },
                    { val: `$${minPayout}`,  label: 'Min payout' },
                  ].map((s, i) => (
                    <div key={i} className="text-center p-4 rounded-2xl"
                         style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-[24px] font-black" style={{ color: C.lime }}>{s.val}</p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. TRUST BAR ── */}
        <div style={{ backgroundColor: C.lime }}>
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { val: '$500+',    label: 'Avg monthly earnings (top affiliates)', num: 500,  suffix: '+',  prefix: '$' },
                { val: `${commPct}%`, label: 'Recurring commission per sale', num: commPct, suffix: '%', prefix: '' },
                { val: `${cookieDays} days`, label: 'Cookie tracking window', num: cookieDays, suffix: ' days', prefix: '' },
                { val: '12,000+',  label: 'Active sellers to refer',               num: 12000, suffix: '+', prefix: ''  },
              ].map((s, i) => (
                <div key={i}>
                  <p className="aff-counter text-[22px] font-black"
                     data-num={s.num} data-suffix={s.suffix} data-prefix={s.prefix}
                     style={{ color: C.dark }}>{s.val}</p>
                  <p className="text-[11px] font-bold" style={{ color: 'rgba(26,36,16,0.6)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. HOW IT WORKS ── */}
        <div id="how-it-works" style={{ backgroundColor: '#fff' }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center" style={{ color: C.muted }}>HOW IT WORKS</p>
            <h2 className="text-[32px] font-black text-center mb-3" style={{ color: C.dark }}>Start earning in 4 simple steps</h2>
            <p className="text-[15px] text-center max-w-lg mx-auto mb-14" style={{ color: C.muted }}>
              No complicated setup. No approval requirements. Just apply, share and earn.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connecting line */}
              <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px hidden md:block"
                   style={{ backgroundColor: C.border }}/>
              {STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-4 relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
                       style={{ backgroundColor: C.dark }}>
                    <step.icon size={24} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.lime }}>{step.n}</p>
                    <p className="text-[15px] font-black mb-2" style={{ color: C.dark }}>{step.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link href="/affiliate/apply"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[14px] hover:opacity-90 transition-all"
                    style={{ backgroundColor: C.dark, color: C.lime }}>
                Apply Now — Free <ArrowRight size={15}/>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 4. COMMISSION DETAILS ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center" style={{ color: C.muted }}>THE NUMBERS</p>
            <h2 className="text-[32px] font-black text-center mb-14" style={{ color: '#fff' }}>
              Transparent commissions. <span style={{ color: C.lime }}>No surprises.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What you earn */}
              <div className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(143,255,0,0.2)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(143,255,0,0.15)' }}>
                    <DollarSign size={22} style={{ color: C.lime }}/>
                  </div>
                  <p className="text-[18px] font-black" style={{ color: '#fff' }}>What you earn</p>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Commission rate',    value: `${commPct}% recurring`,      highlight: true },
                    { label: 'Cookie duration',    value: `${cookieDays} days`,            highlight: false },
                    { label: 'Commission type',    value: `${commMonths}-month recurring`,  highlight: false },
                    { label: 'Starter plan ref',   value: `$${starterRef.toFixed(2)}/mo per user`,   highlight: false },
                    { label: 'Growth plan ref',    value: `$${perReferral.toFixed(2)}/mo per user`,  highlight: false },
                    { label: 'Earning cap',        value: 'None — unlimited',    highlight: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b"
                         style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</p>
                      <p className="text-[13px] font-black" style={{ color: item.highlight ? C.lime : '#fff' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How payouts work */}
              <div className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(143,255,0,0.15)' }}>
                    <CreditCard size={22} style={{ color: C.lime }}/>
                  </div>
                  <p className="text-[18px] font-black" style={{ color: '#fff' }}>How payouts work</p>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Payout schedule',  value: 'Monthly (15th)' },
                    { label: 'Minimum payout',   value: `$${minPayout}` },
                    { label: 'Payment methods',  value: 'PayPal · Bank transfer' },
                    { label: 'Payment currency', value: 'USD' },
                    { label: 'Processing time',  value: '1–3 business days' },
                    { label: 'Reporting',        value: 'Real-time dashboard' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b"
                         style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</p>
                      <p className="text-[13px] font-black" style={{ color: '#fff' }}>{item.value}</p>
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
            <p className="text-[11px] font-black tracking-wider mb-2 text-center" style={{ color: C.muted }}>WHO IT'S FOR</p>
            <h2 className="text-[32px] font-black text-center mb-3" style={{ color: C.dark }}>
              Perfect for eBay content creators
            </h2>
            <p className="text-[15px] text-center max-w-lg mx-auto mb-12" style={{ color: C.muted }}>
              If your audience includes eBay sellers — you're exactly who we're looking for.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {WHO.map((item, i) => (
                <div key={i} className="flex items-start gap-5 p-6 rounded-2xl border"
                     style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.dark }}>
                    <item.icon size={24} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p className="text-[16px] font-black mb-1" style={{ color: C.dark }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-5 rounded-2xl text-center" style={{ backgroundColor: C.limeTint, border: '1px solid rgba(143,255,0,0.3)' }}>
              <p className="text-[14px] font-bold" style={{ color: C.limeDeep }}>
                Don't see yourself here? Apply anyway — we review every application individually.
              </p>
            </div>
          </div>
        </div>

        {/* ── 6. WHAT YOU GET ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center" style={{ color: C.muted }}>WHAT YOU GET</p>
            <h2 className="text-[32px] font-black text-center mb-3" style={{ color: C.dark }}>
              Everything you need to succeed
            </h2>
            <p className="text-[15px] text-center max-w-lg mx-auto mb-12" style={{ color: C.muted }}>
              We set you up for success from day one with all the tools and support you need.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {WHAT_YOU_GET.map((item, i) => (
                <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl border"
                     style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                       style={{ backgroundColor: C.dark }}>
                    <item.icon size={20} style={{ color: C.lime }}/>
                  </div>
                  <div>
                    <p className="text-[15px] font-black mb-1" style={{ color: C.dark }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. EARNINGS CALCULATOR ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-4xl mx-auto px-4 py-14 text-center">
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>EARNINGS CALCULATOR</p>
            <h2 className="text-[32px] font-black mb-3" style={{ color: '#fff' }}>
              How much could you earn?
            </h2>
            <p className="text-[15px] mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Same calculator our affiliates use in their dashboard.
            </p>
            <div className="p-4 md:p-8 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(143,255,0,0.2)' }}>
              <div className="flex flex-col gap-6">
                {/* Plan selector */}
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <p className="text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>Plan:</p>
                  {calcPlans.map(p => (
                    <button key={p.id} id={`plan-${p.id}`}
                            className="px-4 py-1.5 rounded-lg text-[12px] font-black transition-all"
                            style={{ backgroundColor: p.id === calcPlans[0]?.id ? C.dark : 'rgba(255,255,255,0.08)', color: p.id === calcPlans[0]?.id ? C.lime : 'rgba(255,255,255,0.5)', border: p.id === calcPlans[0]?.id ? `1px solid ${C.lime}` : '1px solid rgba(255,255,255,0.1)' }}>
                      ${p.price} plan
                    </button>
                  ))}
                </div>
                {/* Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>Signups</p>
                    <p id="calc-refs" className="text-[20px] font-black" style={{ color: C.lime }}>1</p>
                  </div>
                  <input id="calc-slider" type="range" min="1" max="100" defaultValue="1" suppressHydrationWarning
                         className="w-full h-2 rounded-full appearance-none cursor-pointer"
                         style={{ accentColor: C.lime, backgroundColor: 'rgba(255,255,255,0.1)' }}/>
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>1</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>100</span>
                  </div>
                </div>
                {/* Results - same 3 cards as user dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Month 1',      id: 'calc-month1',  val: '$9.80',   highlight: false },
                    { label: '/mo after',    id: 'calc-monthly', val: '$12.25',  highlight: true  },
                    { label: `${commMonths}mo total`, id: 'calc-annual', val: '$144.55', highlight: false },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl text-center"
                         style={{ backgroundColor: item.highlight ? 'rgba(143,255,0,0.12)' : 'rgba(255,255,255,0.04)', border: item.highlight ? '1px solid rgba(143,255,0,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                      <p id={item.id} className="text-[24px] font-black" style={{ color: item.highlight ? C.lime : '#fff' }}>{item.val}</p>
                      <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <p id="calc-note" className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Based on $49 plan × {commPct}% commission × {commMonths} months. Month 1 includes 50% welcome discount. Actual earnings vary.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 8. TESTIMONIALS ── */}
        <div style={{ backgroundColor: C.bg }}>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center" style={{ color: C.muted }}>AFFILIATE STORIES</p>
            <h2 className="text-[32px] font-black text-center mb-12" style={{ color: C.dark }}>
              Real affiliates. Real earnings.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl border"
                     style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <div className="flex gap-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#8fff00" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#8fff00" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#8fff00" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#8fff00" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#8fff00" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <p className="text-[13px] leading-relaxed flex-1 italic" style={{ color: C.muted }}>"{t.text}"</p>
                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[13px]"
                           style={{ backgroundColor: C.lime, color: C.dark }}>{t.initial}</div>
                      <div>
                        <p className="text-[13px] font-black" style={{ color: C.dark }}>{t.name}</p>
                        <p className="text-[11px]" style={{ color: C.muted }}>{t.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black" style={{ color: C.limeDeep }}>{t.earn}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>avg earnings</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 9. FAQ ── */}
        <div style={{ backgroundColor: '#fff' }}>
          <div className="max-w-3xl mx-auto px-6 py-20">
            <p className="text-[11px] font-black tracking-wider mb-2 text-center" style={{ color: C.muted }}>FAQ</p>
            <h2 className="text-[32px] font-black text-center mb-10" style={{ color: C.dark }}>Common questions</h2>
            <div className="flex flex-col gap-3">
              {FAQS.map((item, i) => (
                <div key={i} className="faq-item rounded-2xl border overflow-hidden"
                     style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <button className="faq-btn w-full flex items-center justify-between gap-4 p-5 text-left"
                          style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span className="text-[15px] font-black" style={{ color: C.dark }}>{item.q}</span>
                    <span className="faq-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[20px] font-bold"
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

        {/* ── 10. CTA ── */}
        <div style={{ backgroundColor: C.bg, paddingBottom: 40 }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="rounded-3xl p-12 text-center relative overflow-hidden"
                 style={{ backgroundColor: C.dark }}>
              {/* Dot grid */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(143,255,0,0.08) 1px, transparent 0)`, backgroundSize: '24px 24px', pointerEvents: 'none' }}/>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                     style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.lime }}/>
                  <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>JOIN 500+ AFFILIATES</span>
                </div>
                <h2 className="text-[36px] md:text-[44px] font-black mb-4" style={{ color: '#fff' }}>
                  Ready to start earning?
                </h2>
                <p className="text-[16px] mb-10 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Apply now and start earning 25% recurring commission on every eBay seller you refer to Riazify.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
                  <Link href="/affiliate/apply"
                        className="flex items-center gap-2 px-10 py-4 rounded-xl font-black text-[15px] hover:opacity-90 transition-all"
                        style={{ backgroundColor: C.lime, color: C.dark }}>
                    Apply to Become an Affiliate <ArrowRight size={16}/>
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  {['Free to join', 'Approved in 24hrs', 'No minimum traffic', '25% recurring'].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle size={14} style={{ color: C.lime }}/>
                      <span className="text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</span>
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