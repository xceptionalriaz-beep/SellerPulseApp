// app/gdpr/page.tsx
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR & Your Rights | Riazify',
  description: 'Your rights under GDPR and how Riazify protects EU and UK user data.',
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

const LAST_UPDATED = 'July 4, 2026'

const RIGHTS = [
  {
    number: '01',
    title: 'Right to Access',
    desc: 'You have the right to request a copy of all personal data we hold about you. We will provide this within 30 days of your request at no charge.',
    action: 'Email privacy@riazify.com with subject: "Data Access Request"'
  },
  {
    number: '02',
    title: 'Right to Rectification',
    desc: 'You have the right to request correction of any inaccurate or incomplete personal data we hold about you.',
    action: 'Update directly in your account settings or email privacy@riazify.com'
  },
  {
    number: '03',
    title: 'Right to Erasure',
    desc: 'Also known as the "right to be forgotten". You can request deletion of your personal data where there is no compelling reason for its continued processing.',
    action: 'Email privacy@riazify.com with subject: "Data Deletion Request"'
  },
  {
    number: '04',
    title: 'Right to Restrict Processing',
    desc: 'You have the right to request that we limit the way we use your personal data in certain circumstances, such as while we verify its accuracy.',
    action: 'Email privacy@riazify.com with subject: "Restrict Processing Request"'
  },
  {
    number: '05',
    title: 'Right to Data Portability',
    desc: 'You have the right to receive your personal data in a structured, commonly used, machine-readable format (JSON or CSV) and transfer it to another service.',
    action: 'Email privacy@riazify.com with subject: "Data Portability Request"'
  },
  {
    number: '06',
    title: 'Right to Object',
    desc: 'You have the right to object to processing of your personal data for direct marketing purposes or where processing is based on legitimate interests.',
    action: 'Email privacy@riazify.com with subject: "Object to Processing"'
  },
  {
    number: '07',
    title: 'Right to Withdraw Consent',
    desc: 'Where processing is based on your consent, you have the right to withdraw that consent at any time. This does not affect the lawfulness of processing before withdrawal.',
    action: 'Unsubscribe from emails or email privacy@riazify.com'
  },
  {
    number: '08',
    title: 'Rights Related to Automated Decision Making',
    desc: 'You have the right not to be subject to decisions based solely on automated processing that significantly affect you. Riazify does not make automated decisions that produce legal or similarly significant effects.',
    action: 'Contact privacy@riazify.com if you have concerns'
  },
]

const LEGAL_BASIS = [
  { processing: 'Account creation and management', basis: 'Contract Performance', detail: 'Necessary to provide our services' },
  { processing: 'Payment processing', basis: 'Contract Performance', detail: 'Necessary to process your subscription' },
  { processing: 'Customer support', basis: 'Contract Performance', detail: 'Necessary to resolve your issues' },
  { processing: 'Security and fraud prevention', basis: 'Legitimate Interests', detail: 'Protecting our platform and users' },
  { processing: 'Platform analytics', basis: 'Legitimate Interests', detail: 'Improving our services' },
  { processing: 'Marketing emails', basis: 'Consent', detail: 'Only with your explicit consent' },
  { processing: 'Blog newsletter', basis: 'Consent', detail: 'Only when you subscribe' },
  { processing: 'Tax and legal records', basis: 'Legal Obligation', detail: 'Required by applicable law' },
]

export default function GDPRPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* Hero */}
        <div style={{ backgroundColor: C.dark, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(117,48,251,0.18)', pointerEvents: 'none' }} />
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-[12px] font-bold transition-colors hover:text-[#b8fa33]" style={{ color: C.textLight }}>Home</Link>
              <span style={{ color: C.textLight }}>›</span>
              <span className="text-[12px] font-black" style={{ color: C.accent }}>GDPR</span>
            </div>
            <h1 className="text-[36px] md:text-[44px] font-black mb-3 font-syne tracking-tight" style={{ color: '#fff' }}>
              GDPR & Your Rights
            </h1>
            <p className="text-[14px] mb-1 font-medium" style={{ color: C.textLight }}>Last updated: {LAST_UPDATED}</p>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>For users in the European Economic Area and United Kingdom</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

          {/* Intro card */}
          <div className="rounded-2xl p-6 border shadow-sm" style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
            <p className="text-[11px] font-black tracking-wider mb-2 font-syne uppercase" style={{ color: C.primary }}>
              WHAT IS GDPR?
            </p>
            <p className="text-[14px] leading-relaxed font-medium" style={{ color: C.textDark }}>
              The General Data Protection Regulation (GDPR) is a law that gives EU and UK residents control over their personal data. Riazify LLC is committed to full compliance with GDPR and the UK Data Protection Act 2018. This page explains your rights and how to exercise them.
            </p>
          </div>

          {/* Data controller */}
          <div className="rounded-3xl border p-8 shadow-sm" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <h2 className="text-[20px] font-black mb-4 font-syne" style={{ color: C.textDark }}>Data Controller</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Company', value: 'Riazify LLC' },
                { label: 'Platform', value: 'riazify.com' },
                { label: 'Privacy Contact', value: 'privacy@riazify.com' },
                { label: 'Response Time', value: 'Within 30 days' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1 p-4 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <p className="text-[10px] font-black tracking-wider uppercase font-syne" style={{ color: C.primary }}>{item.label}</p>
                  <p className="text-[14px] font-bold" style={{ color: C.textDark }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Your 8 rights */}
          <div className="rounded-3xl border p-8 shadow-sm" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <h2 className="text-[20px] font-black mb-2 font-syne" style={{ color: C.textDark }}>Your 8 GDPR Rights</h2>
            <p className="text-[13px] mb-6" style={{ color: C.muted }}>Under GDPR you have the following rights regarding your personal data:</p>
            <div className="flex flex-col gap-4">
              {RIGHTS.map((right, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl border transition-all hover:border-[#7530fb]" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-[13px] shadow-sm font-syne"
                    style={{ backgroundColor: C.primary, color: '#ffffff' }}>
                    {right.number}
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-black mb-1 font-syne" style={{ color: C.textDark }}>{right.title}</p>
                    <p className="text-[13px] leading-relaxed mb-3" style={{ color: C.muted }}>{right.desc}</p>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg inline-flex border" style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                      <p className="text-[11px] font-black" style={{ color: C.primary }}>{right.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal basis table */}
          <div className="rounded-3xl border overflow-hidden shadow-sm" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="p-6 border-b" style={{ borderColor: C.border }}>
              <h2 className="text-[20px] font-black font-syne" style={{ color: C.textDark }}>Legal Basis for Processing</h2>
              <p className="text-[13px] mt-1" style={{ color: C.muted }}>How we justify each type of data processing under GDPR</p>
            </div>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg }}>
                    {['Processing Activity', 'Legal Basis', 'Details'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.textDark }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LEGAL_BASIS.map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td className="px-5 py-4 text-[13px] font-bold" style={{ color: C.textDark }}>{row.processing}</td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-black px-3 py-1 rounded-full border"
                          style={{
                            backgroundColor: row.basis === 'Contract Performance' ? C.primaryLight : row.basis === 'Consent' ? '#eff6ff' : row.basis === 'Legal Obligation' ? '#fef3c7' : '#f0fdf4',
                            borderColor: row.basis === 'Contract Performance' ? C.border : row.basis === 'Consent' ? '#bfdbfe' : row.basis === 'Legal Obligation' ? '#fde68a' : '#bbf7d0',
                            color: row.basis === 'Contract Performance' ? C.primary : row.basis === 'Consent' ? '#2563eb' : row.basis === 'Legal Obligation' ? '#d97706' : '#16a34a'
                          }}>
                          {row.basis}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[13px]" style={{ color: C.muted }}>{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* International transfers */}
          <div className="rounded-3xl border p-8 shadow-sm" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <h2 className="text-[20px] font-black mb-3 font-syne" style={{ color: C.textDark }}>International Data Transfers</h2>
            <p className="text-[14px] leading-relaxed mb-5" style={{ color: C.muted }}>
              Riazify LLC is based in the United States. When we transfer your personal data from the EU or UK to the US, we ensure appropriate safeguards are in place:
            </p>
            <div className="flex flex-col gap-3">
              {[
                { title: 'Standard Contractual Clauses (SCCs)', desc: 'We use EU-approved SCCs with our service providers to ensure adequate protection for data transfers.' },
                { title: 'UK International Data Transfer Agreements', desc: 'For UK users, we use IDTA-approved mechanisms for transfers to the US.' },
                { title: 'Data Processing Agreements', desc: 'All third-party processors (Supabase, Resend, Vercel) have signed DPAs ensuring GDPR compliance.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3.5 p-4 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: C.primary }} />
                  <div>
                    <p className="text-[14px] font-black font-syne" style={{ color: C.textDark }}>{item.title}</p>
                    <p className="text-[13px] leading-relaxed mt-0.5" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to complain */}
          <div className="rounded-3xl p-8 shadow-xl" style={{ backgroundColor: C.dark, border: `1px solid ${C.borderDark}` }}>
            <h2 className="text-[22px] font-black mb-3 font-syne" style={{ color: '#fff' }}>Right to Lodge a Complaint</h2>
            <p className="text-[14px] leading-relaxed mb-6" style={{ color: C.textLight }}>
              If you believe we have not handled your personal data in accordance with GDPR, you have the right to lodge a complaint with your local supervisory authority:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { region: '🇬🇧 United Kingdom', authority: 'Information Commissioner\'s Office (ICO)', url: 'ico.org.uk', contact: 'casework@ico.org.uk' },
                { region: '🇪🇺 European Union', authority: 'Your national Data Protection Authority', url: 'edpb.europa.eu', contact: 'Find your DPA at edpb.europa.eu' },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                  <p className="text-[13px] font-black mb-1 font-syne" style={{ color: C.accent }}>{item.region}</p>
                  <p className="text-[14px] font-bold mb-1" style={{ color: '#fff' }}>{item.authority}</p>
                  <p className="text-[12px]" style={{ color: C.textLight }}>{item.contact}</p>
                </div>
              ))}
            </div>
            <p className="text-[13px] mt-6" style={{ color: C.textLight }}>
              We encourage you to contact us first at <span className="font-bold" style={{ color: C.accent }}>privacy@riazify.com</span> — we aim to resolve all concerns within 30 days.
            </p>
          </div>

          {/* Related links */}
          <div className="flex items-center gap-4 flex-wrap pt-2">
            <p className="text-[13px] font-bold" style={{ color: C.muted }}>Related:</p>
            <Link href="/privacy-policy" className="text-[13px] font-bold transition-colors hover:text-[#6020e0]" style={{ color: C.primary }}>Privacy Policy</Link>
            <Link href="/cookie-policy" className="text-[13px] font-bold transition-colors hover:text-[#6020e0]" style={{ color: C.primary }}>Cookie Policy</Link>
            <Link href="/terms-of-service" className="text-[13px] font-bold transition-colors hover:text-[#6020e0]" style={{ color: C.primary }}>Terms of Service</Link>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
