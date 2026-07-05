// app/privacy-policy/page.tsx
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Riazify',
  description: 'How Riazify collects, uses and protects your personal data.',
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
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>

        {/* Hero */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-[12px] font-bold hover:opacity-70" style={{ color: C.muted }}>Home</Link>
              <span style={{ color: C.muted }}>›</span>
              <span className="text-[12px] font-bold" style={{ color: C.lime }}>Privacy Policy</span>
            </div>
            <h1 className="text-[40px] font-black mb-3" style={{ color: '#fff' }}>Privacy Policy</h1>
            <p className="text-[14px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Last updated: {LAST_UPDATED}</p>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Applies to users in the USA, UK and internationally</p>
          </div>
        </div>

        {/* Quick summary */}
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ backgroundColor: C.limeTint, border: `1px solid rgba(143,255,0,0.3)` }}>
            <p className="text-[12px] font-black tracking-wider" style={{ color: C.limeDeep }}>QUICK SUMMARY</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🔒', title: 'We protect your data', desc: 'Industry-standard encryption and security measures' },
                { icon: '🚫', title: 'We never sell your data', desc: 'Your personal information is never sold to third parties' },
                { icon: '✅', title: 'You are in control', desc: 'Access, correct or delete your data at any time' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <p className="text-[13px] font-black" style={{ color: C.dark }}>{item.title}</p>
                    <p className="text-[12px]" style={{ color: C.muted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="rounded-3xl border p-8 md:p-12 flex flex-col gap-8" style={{ backgroundColor: '#fff', borderColor: C.border }}>

            <p className="text-[15px] leading-relaxed" style={{ color: C.muted }}>
              This Privacy Policy explains how Riazify collects, uses, shares and protects your personal information when you use our platform. We are committed to being transparent about our data practices and protecting your privacy rights.
            </p>

            {SECTIONS.map((s, i) => (
              <div key={i}>
                <h2 className="text-[20px] font-black mb-3" style={{ color: C.dark }}>{s.title}</h2>
                {s.content && <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>{s.content}</p>}
                {s.items && (
                  <div className="flex flex-col gap-3 mt-2">
                    {s.items.map((item, j) => (
                      <div key={j} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: C.bg }}>
                        <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: C.lime }} />
                        <div>
                          <p className="text-[13px] font-black" style={{ color: C.dark }}>{item.label}</p>
                          <p className="text-[13px]" style={{ color: C.muted }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Related links */}
            <div className="pt-6 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: C.border }}>
              <p className="text-[12px] font-bold" style={{ color: C.muted }}>Related:</p>
              <Link href="/cookie-policy" className="text-[12px] font-bold hover:opacity-70" style={{ color: C.limeDeep }}>Cookie Policy</Link>
              <Link href="/terms-of-service" className="text-[12px] font-bold hover:opacity-70" style={{ color: C.limeDeep }}>Terms of Service</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}