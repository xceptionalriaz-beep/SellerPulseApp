// app/cookie-policy/page.tsx
// Riazify Cookie & Tracking Technologies Policy — v2.0

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ShieldCheck, Cookie, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy — Privacy & Tracking Disclosures | Riazify',
  description: 'Learn how Riazify uses essential cookies, authentication session tokens, and local preferences to operate securely.',
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

const LAST_UPDATED = 'July 4, 2026'

const COOKIE_CATEGORIES = [
  {
    type: 'Essential & Authentication',
    color: C.primary,
    desc: 'Mandatory for core platform security, encrypted session persistence, and API token validation.',
    cookies: [
      { name: 'sb-auth-token', purpose: 'Supabase encrypted session state', duration: 'Session' },
      { name: 'sb-refresh-token', purpose: 'Persistent multi-factor OAuth session refresh', duration: '7 Days' },
    ],
  },
  {
    type: 'Operational & Workspace Preferences',
    color: '#2563eb',
    desc: 'Stores your active marketplace defaults, Cassini title preferences, and UI layout settings.',
    cookies: [
      { name: 'riazify-theme', purpose: 'Stores interface theme and density preference', duration: '1 Year' },
      { name: 'riazify-region', purpose: 'Remembers active eBay locale (e.g. US, UK, DE)', duration: '1 Year' },
    ],
  },
  {
    type: 'Telemetry & Performance Analytics',
    color: C.muted,
    desc: 'Aggregated, non-personally identifiable metrics used strictly for debugging load times.',
    cookies: [
      { name: '_vercel_analytics', purpose: 'Anonymous platform latency and uptime telemetry', duration: '1 Year' },
    ],
  },
]

const FAQS = [
  {
    q: 'Can I use Riazify without enabling cookies?',
    a: 'Essential cookies are technically required for secure authentication and OAuth verification with eBay APIs. Disabling essential cookies prevents your account from maintaining a logged-in session.'
  },
  {
    q: 'Does Riazify sell or monetize cookie data?',
    a: 'No. Riazify does not sell, license, or monetize seller telemetry, listing margins, or cookie identifiers to advertising exchanges or data brokers.'
  },
  {
    q: 'How do I clear or reset cookies stored by Riazify?',
    a: 'You can remove cookies anytime through your browser settings under "Cookies and Site Data" for the riazify.com domain. Note that clearing session cookies will log you out.'
  },
  {
    q: 'Does Riazify deploy third-party advertising tracking pixels?',
    a: 'No. We do not inject cross-site tracking pixels, behavioral retargeting scripts, or third-party ad network beacons.'
  },
]

export default function CookiePolicyPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. Hero Header ── */}
        <header className="border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 border"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
              <Cookie size={13} style={{ color: C.accent }} />
              <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                LEGAL &amp; DATA PRIVACY
              </span>
            </div>

            <h1 className="text-[34px] md:text-[46px] font-black leading-tight mb-2 font-syne text-white tracking-tight">
              Cookie Policy
            </h1>

            <p className="text-[13.5px] font-medium" style={{ color: C.textLight }}>
              Effective Date: {LAST_UPDATED} · Version 2.4
            </p>

          </div>
        </header>

        {/* ── 2. Policy Documentation Container ── */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white rounded-2xl border p-6 md:p-10 shadow-xs flex flex-col gap-8" style={{ borderColor: C.border }}>

            {/* Intro Lead */}
            <div className="pb-6 border-b" style={{ borderColor: C.border }}>
              <p className="text-[14.5px] leading-relaxed" style={{ color: C.textDark }}>
                This Cookie Policy explains how <strong>Riazify LLC</strong> ("we", "us", or "our") employs cookies, local storage tokens, and telemetry protocols when you access the Riazify web application, developer APIs, and intelligence dashboards. It outlines what these technologies perform, why they are essential to store security, and your administrative controls.
              </p>
            </div>

            {/* Section 1 & 2 */}
            <div>
              <h2 className="text-[18px] font-bold font-syne mb-2" style={{ color: C.textDark }}>
                1. What Are Cookies and Local Storage Identifiers?
              </h2>
              <p className="text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
                Cookies are compact data files transmitted to and stored upon your computing device when navigating web platforms. They serve to authenticate session states, preserve personalized filters, and ensure responsive interaction. Cookies are classified as either <em>session cookies</em> (erased upon closing your browser window) or <em>persistent cookies</em> (retained across visits until manual deletion or expiration).
              </p>
            </div>

            <div>
              <h2 className="text-[18px] font-bold font-syne mb-2" style={{ color: C.textDark }}>
                2. Operational Scope &amp; Purpose
              </h2>
              <p className="text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
                Riazify utilizes tracking technologies exclusively to verify merchant identity, enforce account access controls, compute real-time order risk scoring, and prevent unauthorized credential stuffing.
              </p>
            </div>

            {/* Section 3: Detailed Cookie Tables */}
            <div>
              <h2 className="text-[18px] font-bold font-syne mb-4" style={{ color: C.textDark }}>
                3. Technical Breakdown of Deployed Cookies
              </h2>

              <div className="flex flex-col gap-4">
                {COOKIE_CATEGORIES.map((cat, i) => (
                  <div key={i} className="rounded-xl border overflow-hidden bg-white shadow-2xs" style={{ borderColor: C.border }}>
                    <div className="px-4 py-3 flex items-center justify-between gap-3 border-b" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[13px] font-bold font-syne" style={{ color: C.textDark }}>
                          {cat.type}
                        </span>
                      </div>
                      <span className="text-[11.5px] hidden sm:inline" style={{ color: C.muted }}>
                        {cat.desc}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[380px]">
                        <thead>
                          <tr className="border-b" style={{ borderColor: C.border, backgroundColor: '#ffffff' }}>
                            <th className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-wider font-syne" style={{ color: C.muted }}>Identifier</th>
                            <th className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-wider font-syne" style={{ color: C.muted }}>Functional Purpose</th>
                            <th className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-wider font-syne" style={{ color: C.muted }}>Lifespan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-[12.5px]" style={{ borderColor: C.border }}>
                          {cat.cookies.map((c, j) => (
                            <tr key={j} className="hover:bg-[#f8f7ff] transition-colors">
                              <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: C.primary }}>
                                {c.name}
                              </td>
                              <td className="px-4 py-2.5" style={{ color: C.textDark }}>
                                {c.purpose}
                              </td>
                              <td className="px-4 py-2.5 font-medium" style={{ color: C.muted }}>
                                {c.duration}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4, 5, 6, 7 */}
            <div className="space-y-6">
              <div>
                <h2 className="text-[18px] font-bold font-syne mb-2" style={{ color: C.textDark }}>
                  4. Third-Party Infrastructure Providers
                </h2>
                <p className="text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
                  Our platform integrates select cloud infrastructure vendors to ensure high availability. These partners include <strong>Supabase</strong> (encrypted database layer &amp; session tokens), <strong>Resend</strong> (transactional email dispatches), and <strong>Vercel</strong> (edge computing). Each vendor operates under strict SOC2 and GDPR data processing addendums.
                </p>
              </div>

              <div>
                <h2 className="text-[18px] font-bold font-syne mb-2" style={{ color: C.textDark }}>
                  5. Managing &amp; Opting Out
                </h2>
                <p className="text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
                  You retain full authority to configure cookie acceptance through standard browser preferences. You may decline non-essential cookies, delete stored local caches, or enable "Do Not Track" headers. Please observe that restricting essential session tokens will disable authenticated workspace features.
                </p>
              </div>

              <div>
                <h2 className="text-[18px] font-bold font-syne mb-2" style={{ color: C.textDark }}>
                  6. Amendments to This Disclosure
                </h2>
                <p className="text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
                  We reserve the right to revise this policy periodically to reflect statutory updates or algorithmic platform revisions. Revisions become effective immediately upon public deployment to this URL.
                </p>
              </div>

              <div>
                <h2 className="text-[18px] font-bold font-syne mb-2" style={{ color: C.textDark }}>
                  7. Privacy Desk Contact
                </h2>
                <p className="text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
                  For technical inquiries regarding our cookie governance or data privacy safeguards, contact our security team at{' '}
                  <a href="mailto:privacy@riazify.com" className="font-bold underline" style={{ color: C.primary }}>
                    privacy@riazify.com
                  </a>.
                </p>
              </div>
            </div>

            {/* Related Policy Links */}
            <div className="pt-6 border-t flex items-center gap-4 flex-wrap text-[12.5px]" style={{ borderColor: C.border }}>
              <span className="font-bold font-syne" style={{ color: C.textDark }}>RELATED LEGAL TEXTS:</span>
              <Link href="/privacy-policy" className="font-bold hover:underline" style={{ color: C.primary }}>
                Privacy Policy →
              </Link>
              <Link href="/terms-of-service" className="font-bold hover:underline" style={{ color: C.primary }}>
                Terms of Service →
              </Link>
            </div>

          </div>

          {/* ── 3. Quick FAQ Details Accordion ── */}
          <section className="max-w-3xl mx-auto my-14">
            <div className="text-center mb-8">
              <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-1" style={{ color: C.primary }}>
                FREQUENTLY ASKED
              </p>
              <h2 className="text-[24px] md:text-[28px] font-black font-syne" style={{ color: C.textDark }}>
                Cookie &amp; telemetry questions
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="rounded-xl border bg-white overflow-hidden shadow-2xs group"
                  style={{ borderColor: C.border }}
                >
                  <summary
                    className="flex items-center justify-between gap-4 p-4 md:p-5 cursor-pointer list-none select-none text-[13.5px] font-bold font-syne"
                    style={{ color: C.textDark }}
                  >
                    <span>{faq.q}</span>
                    <span className="text-[16px] font-bold shrink-0 transition-transform group-open:rotate-45" style={{ color: C.primary }}>
                      +
                    </span>
                  </summary>
                  <div className="px-4 md:px-5 pb-5 pt-1 border-t" style={{ borderColor: C.border }}>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ── 4. Final CTA Banner ── */}
          <section className="rounded-3xl p-8 md:p-10 text-center border shadow-xl mb-6"
            style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-3 text-[11px] font-bold font-syne uppercase"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', color: C.accent }}>
              <CheckCircle2 size={13} />
              <span>TRANSPARENT SELLER TOOLS</span>
            </div>
            <h2 className="text-[24px] md:text-[30px] font-black font-syne text-white mb-2 tracking-tight">
              Ready to scale your eBay store safely?
            </h2>
            <p className="text-[13.5px] mb-6 max-w-md mx-auto" style={{ color: C.textLight }}>
              No credit card required. Experience automated dispute defense and verified margin tracking today.
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
