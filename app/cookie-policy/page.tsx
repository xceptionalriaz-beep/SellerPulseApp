// app/cookie-policy/page.tsx
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Riazify',
  description: 'Learn how Riazify uses cookies and how you can control them.',
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

export default function CookiePolicyPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* Hero */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
            <h1 className="font-black mb-3" style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 40px)' }}>Cookie Policy</h1>
            <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Last updated: {LAST_UPDATED}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="rounded-3xl border p-8 md:p-12 flex flex-col gap-8" style={{ backgroundColor: '#fff', borderColor: C.border }}>

            {/* Intro */}
            <div>
              <p className="text-[15px] leading-relaxed" style={{ color: C.muted }}>
                This Cookie Policy explains how Riazify ("we", "us" or "our") uses cookies and similar technologies when you visit our website at riazify.com. It explains what these technologies are, why we use them, and your rights to control our use of them.
              </p>
            </div>

            {/* Section */}
            {[
              {
                title: '1. What Are Cookies?',
                content: 'Cookies are small data files placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to site owners. Cookies can be "persistent" (remaining on your device until deleted) or "session" cookies (deleted when you close your browser).'
              },
              {
                title: '2. How We Use Cookies',
                content: 'We use cookies for the following purposes:'
              },
            ].map((s, i) => (
              <div key={i}>
                <h2 className="text-[20px] font-black mb-3" style={{ color: C.dark }}>{s.title}</h2>
                <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>{s.content}</p>
              </div>
            ))}

            {/* Cookie table */}
            <div>
              <h2 className="text-[20px] font-black mb-4" style={{ color: C.dark }}>3. Types of Cookies We Use</h2>
              <div className="flex flex-col gap-4">
                {[
                  {
                    type: 'Essential Cookies',
                    color: C.lime,
                    desc: 'Required for the website to function properly.',
                    cookies: [
                      { name: 'sb-auth-token', purpose: 'Supabase authentication session', duration: 'Session' },
                      { name: 'sb-refresh-token', purpose: 'Keeps you logged in between sessions', duration: '7 days' },
                    ]
                  },
                  {
                    type: 'Preference Cookies',
                    color: '#3b82f6',
                    desc: 'Remember your settings and preferences.',
                    cookies: [
                      { name: 'riazify-theme', purpose: 'Stores your UI preferences', duration: '1 year' },
                    ]
                  },
                  {
                    type: 'Analytics Cookies',
                    color: C.muted,
                    desc: 'Help us understand how visitors use our site.',
                    cookies: [
                      { name: '_vercel_analytics', purpose: 'Anonymous usage analytics via Vercel', duration: '1 year' },
                    ]
                  },
                ].map((cat, i) => (
                  <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
                    <div className="px-5 py-3 flex items-center gap-3" style={{ backgroundColor: C.bg }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <p className="text-[13px] font-black" style={{ color: C.dark }}>{cat.type}</p>
                      <p className="text-[12px]" style={{ color: C.muted }}>— {cat.desc}</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                      <thead>
                        <tr style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
                          {['Cookie Name', 'Purpose', 'Duration'].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-[10px] font-black tracking-wider" style={{ color: C.muted }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.cookies.map((c, j) => (
                          <tr key={j} style={{ borderTop: `1px solid ${C.border}` }}>
                            <td className="px-4 py-3"><code className="text-[12px] font-bold" style={{ color: C.limeDeep }}>{c.name}</code></td>
                            <td className="px-4 py-3 text-[13px]" style={{ color: C.muted }}>{c.purpose}</td>
                            <td className="px-4 py-3 text-[12px] font-bold" style={{ color: C.dark }}>{c.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: '4. Third-Party Cookies',
                content: 'We use the following third-party services that may set their own cookies: Supabase (database and authentication), Resend (email delivery), and Vercel (hosting and analytics). These services have their own privacy policies governing the use of cookies.'
              },
              {
                title: '5. How to Control Cookies',
                content: 'You can control and manage cookies in your browser settings. Please note that removing or blocking cookies may impact your user experience and some features may not work as intended. Most browsers allow you to refuse cookies, delete existing cookies, and set preferences for certain websites.'
              },
              {
                title: '6. Updates to This Policy',
                content: `We may update this Cookie Policy from time to time to reflect changes in technology or legislation. The date at the top of this page indicates when it was last revised. We encourage you to check this page periodically.`
              },
              {
                title: '7. Contact Us',
                content: 'If you have questions about our use of cookies, please contact us at privacy@riazify.com'
              },
            ].map((s, i) => (
              <div key={i}>
                <h2 className="text-[20px] font-black mb-3" style={{ color: C.dark }}>{s.title}</h2>
                <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>{s.content}</p>
              </div>
            ))}

            {/* Related links */}
            <div className="pt-6 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: C.border }}>
              <p className="text-[12px] font-bold" style={{ color: C.muted }}>Related:</p>
              <Link href="/privacy-policy" className="text-[12px] font-bold hover:opacity-70" style={{ color: C.limeDeep }}>Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-[12px] font-bold hover:opacity-70" style={{ color: C.limeDeep }}>Terms of Service</Link>
            </div>
          </div>
        </div>
        {/* FAQ */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 48px' }}>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: '#1a2410', textAlign: 'center', margin: '0 0 8px' }}>Cookie questions</h2>
        <p style={{ fontSize: 14, color: '#8a9e78', textAlign: 'center', margin: '0 0 28px' }}>Quick answers about how we use cookies</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { q: 'Can I use Riazify without cookies?', a: 'Essential cookies are required for login and authentication to work. Without them, you cannot stay logged in. Analytics and preference cookies are optional.' },
            { q: 'Do you sell my cookie data?', a: 'No. We never sell your data including cookie data to third parties. Cookies are only used to improve your experience on Riazify.' },
            { q: 'How do I delete Riazify cookies?', a: 'Open your browser settings, go to Privacy or Cookies section, and delete cookies from riazify.com. Note this will log you out of your account.' },
            { q: 'Does Riazify use tracking cookies?', a: 'We only use anonymous analytics via Vercel to understand general usage patterns. We do not use advertising or cross-site tracking cookies.' },
            { q: 'How long do cookies last?', a: 'Session cookies are deleted when you close your browser. Authentication cookies last 7 days. Analytics and preference cookies last up to 1 year.' },
          ].map((faq, i) => (
            <details key={i} style={{ background: '#ffffff', border: '1px solid #e8ede2', borderRadius: 12, overflow: 'hidden' }}>
              <summary style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700, color: '#1a2410', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q}
                <span style={{ fontSize: 16, color: '#8a9e78', flexShrink: 0, marginLeft: 12 }}>+</span>
              </summary>
              <div style={{ padding: '0 18px 14px' }}>
                <p style={{ fontSize: 13, color: '#8a9e78', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 60px' }}>
        <div style={{ background: '#1a2410', borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(143,255,0,0.1)', border: '1px solid rgba(143,255,0,0.3)', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8fff00' }}>14-day free trial</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, color: '#ffffff', margin: '0 0 10px', lineHeight: 1.1 }}>
            Ready to grow your eBay business?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
            No credit card required. No commitment. Cancel anytime.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" style={{ height: 46, padding: '0 24px', borderRadius: 12, background: '#8fff00', color: '#1a2410', fontSize: 14, fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Start free trial
            </a>
            <a href="/pricing" target="_blank" rel="noopener noreferrer"
               style={{ height: 46, padding: '0 24px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              View pricing
            </a>
          </div>
        </div>
      </div>
      <Footer/>
      </div>
    </div>
  )
}