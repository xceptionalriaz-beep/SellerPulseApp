'use client'
// app/contact/page.tsx
import React, { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import ProDropdown from '@/components/ui/ProDropdown'
import { CheckCircle } from 'lucide-react'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
  surface:  '#ffffff',
  red:      '#b91c1c',
  redBg:    '#fef2f2',
}

const SUBJECTS = [
  { val: 'question',    label: 'General question',       enabled: true },
  { val: 'bug',         label: 'Bug report',             enabled: true },
  { val: 'billing',     label: 'Billing & subscription', enabled: true },
  { val: 'feature',     label: 'Feature request',        enabled: true },
  { val: 'partnership', label: 'Partnership',            enabled: true },
  { val: 'press',       label: 'Press inquiry',          enabled: true },
  { val: 'other',       label: 'Other',                  enabled: true },
]

const FAQS = [
  { q: 'How do I cancel my subscription?',      a: 'You can cancel anytime from your dashboard under Billing. No penalties, no questions asked.' },
  { q: 'Do you offer refunds?',                 a: 'Yes — we offer a 14-day money-back guarantee. Contact us within 14 days of purchase.' },
  { q: 'Is there a free trial?',                a: 'Yes! Every new account gets a 14-day free trial with no credit card required.' },
  { q: 'Can I connect multiple eBay accounts?', a: 'Currently one eBay account per Riazify account. Multi-account support is on our roadmap.' },
  { q: 'How fast do you respond?',              a: 'We respond to all messages within 24 hours. Billing issues are handled within 4 hours.' },
  { q: 'Is my eBay data safe?',                 a: 'Absolutely. We use OAuth 2.0 and never store your eBay password. All data is encrypted.' },
]

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: '100%', height: 44, padding: '0 14px', borderRadius: 10,
  border: `1px solid ${hasError ? C.red : C.border}`, fontSize: 14,
  color: C.dark, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif', background: C.surface,
})

export default function ContactPage() {
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [subject, setSubject]         = useState('question')
  const [customSubject, setCustomSubject] = useState('')
  const [message, setMessage]         = useState('')
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [loading, setLoading]         = useState(false)
  const [success, setSuccess]         = useState(false)
  const [openFaq, setOpenFaq]         = useState<number | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())                                            e.name    = 'Name is required'
    if (!email.trim())                                           e.email   = 'Email is required'
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email.trim()))  e.email   = 'Enter a valid email'
    if (subject === 'other' && !customSubject.trim())            e.subject = 'Please enter a subject'
    if (!message.trim())                                         e.message = 'Message is required'
    else if (message.trim().length < 10)                         e.message = 'Message must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      const finalSubject = subject === 'other' && customSubject.trim()
        ? customSubject.trim()
        : SUBJECTS.find(s => s.val === subject)?.label ?? subject
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: finalSubject, type: subject, message: message.trim() }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSuccess(true)
      setName(''); setEmail(''); setMessage(''); setSubject('question'); setCustomSubject('')
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again or email us directly.' })
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar/>

      {/* Hero — full width */}
      <div style={{ padding: '48px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(143,255,0,0.08)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(143,255,0,0.06)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: 20, left: '30%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(143,255,0,0.04)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: C.limeTint, border: `1px solid ${C.lime}`, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.limeDeep }}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.limeDeep }}>We respond within 24 hours</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 900, color: C.dark, margin: '0 0 14px', lineHeight: 1.1 }}>Get in touch</h1>
          <p style={{ fontSize: 16, color: C.muted, margin: '0 auto 28px', lineHeight: 1.6, maxWidth: 420 }}>
            Have a question, feedback, or need help? We read every message and respond personally.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { label: 'Support', value: 'support@riazify.com' },
              { label: 'Billing', value: 'billing@riazify.com' },
            ].map(item => (
              <a key={item.label} href={`mailto:${item.value}`}
                 style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, background: C.surface, border: `1px solid ${C.border}`, textDecoration: 'none', fontSize: 12 }}>
                <span style={{ color: C.muted, fontWeight: 600 }}>{item.label}:</span>
                <span style={{ color: C.limeDeep, fontWeight: 700 }}>{item.value}</span>
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" style={{ height: 46, padding: '0 24px', borderRadius: 12, background: C.lime, color: C.dark, fontSize: 14, fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Start free trial
            </a>
            <a href="#contact-form" style={{ height: 46, padding: '0 24px', borderRadius: 12, background: C.surface, color: C.dark, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', border: `1px solid ${C.border}` }}>
              Send a message
            </a>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>

        {/* Form + Info grid */}
        <div id="contact-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>

          {/* Contact form */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
            {success ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 14, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.limeTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={28} style={{ color: C.limeDeep }}/>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: C.dark, margin: 0 }}>Message sent!</h2>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>We'll get back to you within 24 hours.</p>
                <button onClick={() => setSuccess(false)} style={{ height: 36, padding: '0 16px', borderRadius: 100, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 12, cursor: 'pointer' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: C.dark, margin: '0 0 20px' }}>Send us a message</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Your name</label>
                    <input type="text" placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} style={inputStyle(!!errors.name)}/>
                    {errors.name && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.name}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Email address</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle(!!errors.email)}/>
                    {errors.email && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.email}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Subject</label>
                    <ProDropdown prefix="" currentValue={subject} options={SUBJECTS} onChanged={setSubject} width="full"/>
                    {subject === 'other' && (
                      <input type="text" placeholder="Type your subject..." value={customSubject} onChange={e => setCustomSubject(e.target.value)} autoFocus style={{ ...inputStyle(!!errors.subject), marginTop: 6 }}/>
                    )}
                    {errors.subject && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.subject}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Message</label>
                    <textarea placeholder="Tell us how we can help..." value={message} onChange={e => setMessage(e.target.value)} rows={5}
                              style={{ ...inputStyle(!!errors.message), height: 'auto', padding: '12px 14px', resize: 'vertical' as const }}/>
                    {errors.message && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.message}</p>}
                  </div>
                  {errors.submit && (
                    <div style={{ padding: '10px 14px', background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 10 }}>
                      <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{errors.submit}</p>
                    </div>
                  )}
                  <button onClick={handleSubmit} disabled={loading}
                          style={{ height: 46, borderRadius: 12, border: 'none', background: loading ? C.border : C.lime, color: loading ? C.muted : C.dark, fontSize: 14, fontWeight: 900, cursor: loading ? 'wait' : 'pointer' }}>
                    {loading ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Direct contact */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 900, color: C.dark, margin: '0 0 12px' }}>Direct contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Support',      value: 'support@riazify.com',  desc: 'For help with your account'   },
                  { label: 'Billing',      value: 'billing@riazify.com',  desc: 'For subscription questions'   },
                  { label: 'Press',        value: 'press@riazify.com',    desc: 'For media inquiries'          },
                  { label: 'Partnerships', value: 'partners@riazify.com', desc: 'For business opportunities'   },
                ].map(item => (
                  <div key={item.label} style={{ paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>{item.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                      <a href={`mailto:${item.value}`} style={{ fontSize: 12, fontWeight: 700, color: C.limeDeep, textDecoration: 'none', wordBreak: 'break-all' }}>{item.value}</a>
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Office hours */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 900, color: C.dark, margin: '0 0 12px' }}>Office hours & response times</h3>
              <div style={{ padding: '7px 12px', background: C.limeTint, border: `1px solid ${C.lime}`, borderRadius: 8, marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.limeDeep, margin: 0 }}>Mon - Fri, 9am - 6pm UTC</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { type: 'General questions', time: 'Within 24 hours' },
                  { type: 'Billing issues',    time: 'Within 4 hours'  },
                  { type: 'Bug reports',       time: 'Within 12 hours' },
                  { type: 'Urgent issues',     time: 'Within 2 hours'  },
                ].map(item => (
                  <div key={item.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{item.type}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.limeDeep, background: C.limeTint, border: `1px solid ${C.lime}`, borderRadius: 100, padding: '2px 8px', whiteSpace: 'nowrap' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Already a user */}
            <div style={{ background: C.limeTint, border: `1px solid ${C.lime}`, borderRadius: 20, padding: 18 }}>
              <p style={{ fontSize: 14, fontWeight: 900, color: C.dark, margin: '0 0 4px' }}>Already a Riazify user?</p>
              <p style={{ fontSize: 12, color: C.muted, margin: '0 0 12px' }}>Submit a ticket from your dashboard for faster response.</p>
              <a href="/dashboard" style={{ height: 34, padding: '0 14px', borderRadius: 100, background: C.lime, color: C.dark, fontSize: 12, fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: C.dark, textAlign: 'center', margin: '0 0 6px' }}>Frequently asked questions</h2>
          <p style={{ fontSize: 14, color: C.muted, textAlign: 'center', margin: '0 0 28px' }}>Quick answers to common questions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${openFaq === i ? C.lime : C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{faq.q}</span>
                  <span style={{ fontSize: 16, color: openFaq === i ? C.lime : C.muted, flexShrink: 0, fontWeight: 300 }}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 18px 14px' }}>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ background: C.dark, borderRadius: 20, padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(143,255,0,0.1)', border: '1px solid rgba(143,255,0,0.3)', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.lime }}>14-day free trial</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, color: '#ffffff', margin: '0 0 10px', lineHeight: 1.1 }}>
            Still not sure? Try Riazify free
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
            No credit card required. No commitment. Cancel anytime.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" style={{ height: 46, padding: '0 24px', borderRadius: 12, background: C.lime, color: C.dark, fontSize: 14, fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Start free trial
            </a>
            <a href="/pricing" target="_blank" rel="noopener noreferrer"
               style={{ height: 46, padding: '0 24px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              View pricing
            </a>
          </div>
        </div>

      </main>

      <Footer/>
    </div>
  )
}