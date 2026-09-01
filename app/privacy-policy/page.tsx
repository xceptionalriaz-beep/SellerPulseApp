import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Shield, Lock, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Riazify',
  description: 'How Riazify collects, uses and protects your personal data.',
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

const SECTIONS = [
  {
    title: '1. Who We Are',
    content: `Riazify is a SaaS platform for eBay sellers. We provide tools including order protection, product research, profit calculation, inventory management and competitor analysis. References to "Riazify", "we", "us" or "our" in this policy refer to the Riazify platform and its operators. For privacy enquiries, contact us at privacy@riazify.com.`
  },
  {
    title: '2. Information We Collect',
    items: [
      { label: 'Account Information', desc: 'When you create an account, we collect your name, email address and encrypted password.' },
      { label: 'Profile Information', desc: 'Optional information you add to your profile such as your eBay seller username and business details.' },
      { label: 'Payment Information', desc: 'Billing details processed securely through our payment provider. We do not store full card numbers.' },
      { label: 'Usage Data', desc: 'How you interact with our platform — features used, pages visited, time spent and actions taken.' },
      { label: 'Device Information', desc: 'Browser type, operating system, IP address and device identifiers.' },
      { label: 'Communications', desc: 'Emails you send us and support tickets you raise.' },
      { label: 'Blog Newsletter', desc: 'Email address if you subscribe to our blog newsletter.' },
    ]
  },
  {
    title: '3. How We Use Your Information',
    items: [
      { label: 'Providing Services', desc: 'To operate, maintain and improve the Riazify platform and all its features.' },
      { label: 'Account Management', desc: 'To manage your account, process payments and provide customer support.' },
      { label: 'Communications', desc: 'To send transactional emails (receipts, alerts, security notices) and marketing emails (with your consent).' },
      { label: 'Analytics', desc: 'To understand how users interact with our platform so we can improve it.' },
      { label: 'Security', desc: 'To detect, prevent and address fraud, abuse and security issues.' },
      { label: 'Legal Compliance', desc: 'To comply with applicable laws, regulations and legal processes.' },
    ]
  },
  {
    title: '4. Legal Basis for Processing (GDPR)',
    content: `For users in the UK and European Economic Area, we process your personal data under the following legal bases: Contract Performance (processing necessary to provide our services), Legitimate Interests (improving our platform, security, analytics), Consent (marketing emails, optional data collection), and Legal Obligation (compliance with applicable laws).`
  },
  {
    title: '5. Sharing Your Information',
    items: [
      { label: 'Supabase', desc: 'Our database and authentication provider. Stores your account data securely.' },
      { label: 'Resend', desc: 'Our email delivery service. Used to send transactional and marketing emails.' },
      { label: 'Vercel', desc: 'Our hosting provider. Processes web traffic and analytics.' },
      { label: 'Payment Processor', desc: 'Processes subscription payments. Subject to PCI DSS compliance.' },
    ]
  },
  {
    title: '6. International Data Transfers',
    content: `Riazify serves users in the USA, UK and internationally. Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for all international transfers, including Standard Contractual Clauses approved by the European Commission and UK adequacy decisions where applicable.`
  },
  {
    title: '7. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide services. Account data is deleted within 30 days of account closure upon request. Blog newsletter subscriptions are retained until you unsubscribe. We may retain certain data longer where required by law or for legitimate business purposes such as fraud prevention.`
  },
  {
    title: '8. Your Rights',
    items: [
      { label: 'Access', desc: 'Request a copy of the personal data we hold about you.' },
      { label: 'Correction', desc: 'Request correction of inaccurate or incomplete data.' },
      { label: 'Deletion', desc: 'Request deletion of your personal data ("right to be forgotten").' },
      { label: 'Portability', desc: 'Receive your data in a structured, machine-readable format.' },
      { label: 'Objection', desc: 'Object to processing based on legitimate interests.' },
      { label: 'Restriction', desc: 'Request restriction of processing in certain circumstances.' },
      { label: 'Withdraw Consent', desc: 'Withdraw consent at any time where processing is based on consent.' },
    ]
  },
  {
    title: '9. California Privacy Rights (CCPA)',
    content: `California residents have additional rights under the California Consumer Privacy Act (CCPA). You have the right to know what personal information we collect, the right to delete your personal information, the right to opt-out of the sale of your personal information (we do not sell personal information), and the right to non-discrimination for exercising your rights. To exercise these rights, contact us at privacy@riazify.com.`
  },
  {
    title: '10. Cookies',
    content: `We use cookies and similar tracking technologies to operate our platform. For full details of the cookies we use and how to control them, please see our Cookie Policy.`
  },
  {
    title: '11. Security',
    content: `We implement industry-standard security measures including data encryption in transit (TLS) and at rest, secure authentication, regular security assessments and access controls. However, no method of transmission over the internet is 100% secure and we cannot guarantee absolute security.`
  },
  {
    title: '12. Children\'s Privacy',
    content: `Riazify is not directed to children under 16 years of age. We do not knowingly collect personal information from children under 16. If you believe we have inadvertently collected such information, please contact us immediately at privacy@riazify.com and we will delete it promptly.`
  },
  {
    title: '13. Third-Party Links',
    content: `Our platform may contain links to third-party websites such as eBay. We are not responsible for the privacy practices of those websites. We encourage you to read their privacy policies before providing any personal information.`
  },
  {
    title: '14. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of significant changes by email or through a prominent notice on our platform at least 30 days before the changes take effect. The date at the top of this page shows when it was last revised.`
  },
  {
    title: '15. How to Exercise Your Rights',
    content: `To exercise any of your rights or for any privacy-related questions, contact our privacy team at privacy@riazify.com. We will respond within 30 days. For UK/EU users, you also have the right to lodge a complaint with your local data protection authority — the ICO in the UK (ico.org.uk) or your national DPA in the EU.`
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. HERO ── */}
        <div style={{ backgroundColor: C.dark, position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 360,
              height: 360,
              borderRadius: '50%',
              background: 'rgba(117,48,251,0.18)',
              pointerEvents: 'none',
            }}
          />
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-[12px] font-bold transition-colors hover:text-[#b8fa33]" style={{ color: C.textLight }}>
                Home
              </Link>
              <span style={{ color: C.textLight }}>›</span>
              <span className="text-[12px] font-black" style={{ color: C.accent }}>
                Privacy Policy
              </span>
            </div>
            <h1 className="text-[36px] md:text-[48px] font-black mb-3 font-syne tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="text-[14px] mb-1 font-medium" style={{ color: C.textLight }}>
              Last updated: {LAST_UPDATED}
            </p>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Applies to sellers and operators in the USA, UK, and internationally
            </p>
          </div>
        </div>

        {/* ── 2. QUICK SUMMARY BOX ── */}
        <div className="max-w-4xl mx-auto px-6 pt-10">
          <div
            className="rounded-2xl p-6 sm:p-7 border shadow-xs"
            style={{ backgroundColor: C.primaryLight, borderColor: C.border }}
          >
            <p className="text-[11px] font-black tracking-wider mb-4 font-syne uppercase" style={{ color: C.primary }}>
              QUICK SUMMARY
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: Lock, title: 'We protect your data', desc: 'Enterprise-grade encryption and secure auth isolation' },
                { icon: Shield, title: 'We never sell your data', desc: 'Your sourcing and listing intelligence stays 100% private' },
                { icon: CheckCircle2, title: 'You are in control', desc: 'Access, export, correct or delete your profile data anytime' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: C.surface, borderColor: C.border }}
                  >
                    <item.icon size={18} style={{ color: C.primary }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black font-syne" style={{ color: C.textDark }}>{item.title}</p>
                    <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. LEGAL CONTENT SECTIONS ── */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div
            className="rounded-3xl border p-8 sm:p-12 flex flex-col gap-9 shadow-sm"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <p className="text-[15px] leading-relaxed" style={{ color: C.muted }}>
              This Privacy Policy explains how Riazify LLC collects, uses, shares, and protects your personal information when you interact with our platform. We are committed to transparency, strict data minimization, and safeguarding your operational confidentiality.
            </p>

            {SECTIONS.map((s, i) => (
              <div key={i} className="flex flex-col gap-3">
                <h2 className="text-[20px] font-black font-syne" style={{ color: C.textDark }}>
                  {s.title}
                </h2>
                {s.content && (
                  <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>
                    {s.content}
                  </p>
                )}
                {s.items && (
                  <div className="flex flex-col gap-3 mt-1">
                    {s.items.map((item, j) => (
                      <div
                        key={j}
                        className="flex gap-3.5 p-4 rounded-xl border transition-colors hover:border-[#7530fb]"
                        style={{ backgroundColor: C.bg, borderColor: C.border }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: C.primary }} />
                        <div>
                          <p className="text-[13.5px] font-black font-syne" style={{ color: C.textDark }}>
                            {item.label}
                          </p>
                          <p className="text-[13px] leading-relaxed mt-0.5" style={{ color: C.muted }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Related Navigation Links */}
            <div className="pt-6 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: C.border }}>
              <p className="text-[12px] font-bold font-syne uppercase" style={{ color: C.muted }}>Related Legal Policies:</p>
              <Link href="/cookie-policy" className="text-[13px] font-bold transition-colors hover:text-[#6020e0]" style={{ color: C.primary }}>
                Cookie Policy
              </Link>
              <span style={{ color: C.border }}>•</span>
              <Link href="/terms-of-service" className="text-[13px] font-bold transition-colors hover:text-[#6020e0]" style={{ color: C.primary }}>
                Terms of Service
              </Link>
              <span style={{ color: C.border }}>•</span>
              <Link href="/gdpr" className="text-[13px] font-bold transition-colors hover:text-[#6020e0]" style={{ color: C.primary }}>
                GDPR Rights
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
