'use client'

// app/contact/page.tsx
// Riazify Support & Direct Contact Desk — v2.0

import React, { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import ProDropdown from '@/components/ui/ProDropdown'
import {
  CheckCircle2, Mail, Clock, Shield,
  ArrowRight, ChevronDown, MessageSquare
} from 'lucide-react'
import Link from 'next/link'

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
  redBg: '#fef2f2',
}

const SUBJECTS = [
  { val: 'question', label: 'General Platform Question', enabled: true },
  { val: 'bug', label: 'Technical / Bug Report', enabled: true },
  { val: 'billing', label: 'Billing & Subscription', enabled: true },
  { val: 'feature', label: 'Feature Request', enabled: true },
  { val: 'partnership', label: 'Affiliate & Partnership', enabled: true },
  { val: 'press', label: 'Media & Press Inquiry', enabled: true },
  { val: 'other', label: 'Other Inquiry', enabled: true },
]

const FAQS = [
  { q: 'How do I cancel or modify my subscription?', a: 'You can pause or cancel anytime directly from your dashboard under Settings → Billing with zero penalties.' },
  { q: 'Do you offer a refund policy?', a: 'Yes. We offer a no-questions-asked 14-day money-back guarantee on all tier upgrades.' },
  { q: 'Is there a free trial available?', a: 'Yes! Every new account gets full access to core features without requiring a credit card upfront.' },
  { q: 'Can I monitor multiple eBay stores?', a: 'Currently one eBay store connection per workspace. Multi-store rollups are in active development.' },
  { q: 'What are typical support response times?', a: 'General inquiries receive replies within 24 hours. Critical billing issues are handled within 4 hours.' },
  { q: 'Is my store credentials and order data safe?', a: '100%. We utilize standard OAuth 2.0 tokens and never store passwords. All order data is encrypted with 256-bit SSL.' },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('question')
  const [customSubject, setCustomSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Your name is required'
    if (!email.trim()) e.email = 'Email address is required'
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email.trim())) e.email = 'Please enter a valid email address'
    if (subject === 'other' && !customSubject.trim()) e.subject = 'Please specify a subject line'
    if (!message.trim()) e.message = 'Message text is required'
    else if (message.trim().length < 10) e.message = 'Message must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const finalSubject = subject === 'other' && customSubject.trim()
        ? customSubject.trim()
        : SUBJECTS.find(s => s.val === subject)?.label ?? subject

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: finalSubject,
          type: subject,
          message: message.trim(),
        }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
      setSubject('question')
      setCustomSubject('')
    } catch {
      setErrors({ submit: 'Unable to send message right now. Please email us directly at support@riazify.com.' })
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. Hero Header ── */}
        <header className="border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 border"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
              <Clock size={13} style={{ color: C.accent }} />
              <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                AVERAGE RESPONSE: &lt;24 HOURS
              </span>
            </div>

            <h1 className="text-[36px] md:text-[50px] font-black leading-tight mb-3 font-syne text-white tracking-tight">
              Get in touch with our team
            </h1>

            <p className="text-[15px] leading-relaxed max-w-md mx-auto mb-8 font-medium" style={{ color: C.textLight }}>
              Have questions regarding Cassini title optimization, order risk verification, or custom integrations? We're here to help.
            </p>

            {/* Quick Email Badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[
                { label: 'Technical Support', value: 'support@riazify.com' },
                { label: 'Billing Inquiries', value: 'billing@riazify.com' },
              ].map(item => (
                <a
                  key={item.label}
                  href={`mailto:${item.value}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold border transition-colors hover:bg-[#271c42]"
                  style={{ backgroundColor: C.darkCard, borderColor: C.borderDark, color: '#ffffff' }}
                >
                  <span style={{ color: C.textLight }}>{item.label}:</span>
                  <span style={{ color: C.accent }}>{item.value}</span>
                </a>
              ))}
            </div>

          </div>
        </header>

        {/* ── 2. Form & Support Details Container ── */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

            {/* Contact Form Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl border p-6 md:p-8 shadow-xs" style={{ borderColor: C.border }}>
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border"
                    style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                    <CheckCircle2 size={30} style={{ color: C.primary }} />
                  </div>
                  <h2 className="text-[20px] font-bold font-syne mb-1" style={{ color: C.textDark }}>
                    Message Received
                  </h2>
                  <p className="text-[13.5px] max-w-xs mb-6" style={{ color: C.muted }}>
                    Thank you for reaching out. A team member will reply directly to your email within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="px-5 py-2.5 rounded-lg border text-[13px] font-bold font-syne transition-colors hover:bg-[#f8f7ff] cursor-pointer"
                    style={{ borderColor: C.border, color: C.textDark }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-[18px] font-bold font-syne mb-1" style={{ color: C.textDark }}>
                      Send an inquiry
                    </h2>
                    <p className="text-[12.5px] mb-4" style={{ color: C.muted }}>
                      Fill out the form below and we will route your request directly to the appropriate team.
                    </p>
                  </div>

                  {errors.submit && (
                    <div className="p-3 rounded-lg border text-[12.5px] font-medium"
                      style={{ backgroundColor: C.redBg, borderColor: '#fecaca', color: C.red }}>
                      {errors.submit}
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="text-[12px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                      YOUR NAME *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg text-[13.5px] outline-none border transition-colors bg-white"
                      style={{ color: C.textDark, borderColor: errors.name ? C.red : C.borderInput }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.name ? C.red : C.borderInput }}
                    />
                    {errors.name && <p className="text-[11px] mt-1 font-medium" style={{ color: C.red }}>{errors.name}</p>}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="text-[12px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      placeholder="alex@store.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg text-[13.5px] outline-none border transition-colors bg-white"
                      style={{ color: C.textDark, borderColor: errors.email ? C.red : C.borderInput }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.email ? C.red : C.borderInput }}
                    />
                    {errors.email && <p className="text-[11px] mt-1 font-medium" style={{ color: C.red }}>{errors.email}</p>}
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="text-[12px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                      INQUIRY TOPIC *
                    </label>
                    <ProDropdown prefix="" currentValue={subject} options={SUBJECTS} onChanged={setSubject} width="full" />
                    {subject === 'other' && (
                      <input
                        type="text"
                        placeholder="Specify subject..."
                        value={customSubject}
                        onChange={e => setCustomSubject(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-lg text-[13.5px] outline-none border transition-colors bg-white mt-2"
                        style={{ color: C.textDark, borderColor: errors.subject ? C.red : C.borderInput }}
                        onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                        onBlur={e => { e.currentTarget.style.borderColor = errors.subject ? C.red : C.borderInput }}
                      />
                    )}
                    {errors.subject && <p className="text-[11px] mt-1 font-medium" style={{ color: C.red }}>{errors.subject}</p>}
                  </div>

                  {/* Message Area */}
                  <div>
                    <label className="text-[12px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                      MESSAGE *
                    </label>
                    <textarea
                      placeholder="Describe your issue, feedback, or question in detail..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={5}
                      className="w-full p-3 rounded-lg text-[13.5px] outline-none border transition-colors bg-white resize-vertical"
                      style={{ color: C.textDark, borderColor: errors.message ? C.red : C.borderInput }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.message ? C.red : C.borderInput }}
                    />
                    {errors.message && <p className="text-[11px] mt-1 font-medium" style={{ color: C.red }}>{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-lg text-[14px] font-bold font-syne flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-md mt-2"
                    style={{ backgroundColor: C.dark, color: C.accent }}
                  >
                    {loading ? (
                      <span>Sending message...</span>
                    ) : (
                      <>
                        <span>Submit Message</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Information Column */}
            <aside className="lg:col-span-5 flex flex-col gap-4">

              {/* Direct Mail Routing Card */}
              <div className="bg-white rounded-2xl border p-5 shadow-xs" style={{ borderColor: C.border }}>
                <h3 className="text-[14px] font-bold font-syne mb-3" style={{ color: C.textDark }}>
                  Department Directory
                </h3>
                <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
                  {[
                    { label: 'Customer Support', value: 'support@riazify.com', desc: 'Platform guidance & troubleshooting' },
                    { label: 'Billing & Account', value: 'billing@riazify.com', desc: 'Subscriptions, receipts & plan changes' },
                    { label: 'Partnerships & Press', value: 'partners@riazify.com', desc: 'Creator integrations & press outreach' },
                  ].map(item => (
                    <div key={item.label} className="py-2.5">
                      <p className="text-[10.5px] font-bold uppercase font-syne tracking-wider" style={{ color: C.muted }}>{item.label}</p>
                      <a href={`mailto:${item.value}`} className="text-[13px] font-bold hover:underline" style={{ color: C.primary }}>
                        {item.value}
                      </a>
                      <p className="text-[11.5px] mt-0.5" style={{ color: C.muted }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service SLA & Support Hours */}
              <div className="bg-white rounded-2xl border p-5 shadow-xs" style={{ borderColor: C.border }}>
                <h3 className="text-[14px] font-bold font-syne mb-3" style={{ color: C.textDark }}>
                  Coverage Hours &amp; SLAs
                </h3>
                <div className="p-3 rounded-lg border mb-3 flex items-center gap-2"
                  style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                  <Clock size={14} style={{ color: C.primary }} />
                  <span className="text-[12px] font-bold font-syne" style={{ color: C.primary }}>
                    Mon – Fri, 9:00 AM – 6:00 PM UTC
                  </span>
                </div>
                <div className="space-y-2 text-[12.5px]">
                  {[
                    { type: 'General Inquiries', time: '<24 Hours' },
                    { type: 'Billing Inquiries', time: '<4 Hours' },
                    { type: 'Bug Reports', time: '<12 Hours' },
                    { type: 'High-Priority Disputes', time: '<2 Hours' },
                  ].map(item => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span style={{ color: C.muted }}>{item.type}</span>
                      <span className="font-bold px-2 py-0.5 rounded-md border text-[11px] font-syne"
                        style={{ backgroundColor: C.bg, borderColor: C.border, color: C.textDark }}>
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing User Ticket Callout */}
              <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
                <h4 className="text-[14px] font-bold font-syne text-white mb-1">
                  Active Subscriber?
                </h4>
                <p className="text-[12px] mb-3 leading-relaxed" style={{ color: C.textLight }}>
                  Subscribers receive prioritized ticket queue routing directly from the merchant dashboard.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold font-syne transition-transform hover:scale-105"
                  style={{ backgroundColor: C.accent, color: C.dark }}
                >
                  <span>Open Dashboard Ticket</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

            </aside>
          </div>

          {/* ── 3. FAQ Accordion ── */}
          <section className="max-w-3xl mx-auto mb-16">
            <div className="text-center mb-8">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-1" style={{ color: C.primary }}>
                QUICK RESOLUTIONS
              </p>
              <h2 className="text-[26px] md:text-[30px] font-black font-syne" style={{ color: C.textDark }}>
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
                      className="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] font-bold font-syne" style={{ color: C.textDark }}>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className="shrink-0 transition-transform duration-200"
                        style={{ color: C.primary, transform: isOpen ? 'rotate(180deg)' : 'none' }}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 md:px-5 pb-5 pt-1 border-t" style={{ borderColor: C.border }}>
                        <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── 4. Final CTA Banner ── */}
          <section className="rounded-3xl p-8 md:p-10 text-center border shadow-xl"
            style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-3 text-[11px] font-bold font-syne uppercase"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', color: C.accent }}>
              <CheckCircle2 size={13} />
              <span>14-DAY RISK-FREE TRIAL</span>
            </div>
            <h2 className="text-[24px] md:text-[30px] font-black font-syne text-white mb-2 tracking-tight">
              Ready to protect and optimize your eBay listings?
            </h2>
            <p className="text-[13.5px] mb-6 max-w-md mx-auto" style={{ color: C.textLight }}>
              No credit card required. Explore our order defense suite and Cassini title builder in seconds.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/auth/signup"
                className="px-7 py-3 rounded-xl font-black font-syne text-[13.5px] transition-transform hover:scale-105 shadow-md cursor-pointer"
                style={{ backgroundColor: C.accent, color: C.dark }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="px-7 py-3 rounded-xl font-bold text-[13.5px] border transition-colors hover:bg-[#271c42] cursor-pointer"
                style={{ borderColor: C.borderDark, color: '#ffffff' }}
              >
                View Pricing
              </Link>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </div>
  )
}
