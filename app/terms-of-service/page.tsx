// app/terms-of-service/page.tsx
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Riazify',
  description: 'Terms and conditions for using the Riazify platform.',
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
    title: '1. Agreement to Terms',
    content: `By accessing or using Riazify ("the Service"), you agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you and Riazify LLC ("Company", "we", "us" or "our"). If you do not agree to these Terms, do not use the Service. We reserve the right to update these Terms at any time with 30 days notice.`
  },
  {
    title: '2. About Riazify',
    content: `Riazify is a Software as a Service (SaaS) platform operated by Riazify LLC. We provide tools and resources for eBay sellers including order protection, product research, profit calculation, inventory management, competitor analysis, title optimisation and blog resources. Riazify is an independent platform and is not affiliated with, endorsed by, or officially connected to eBay Inc.`
  },
  {
    title: '3. Eligibility',
    items: [
      { label: 'Age', desc: 'You must be at least 18 years old to use Riazify.' },
      { label: 'Business Use', desc: 'Riazify is designed for eBay sellers and ecommerce business operators.' },
      { label: 'Legal Capacity', desc: 'You must have the legal capacity to enter into binding contracts in your jurisdiction.' },
      { label: 'Compliance', desc: 'You must comply with all applicable laws and eBay\'s terms of service when using Riazify.' },
    ]
  },
  {
    title: '4. Account Registration',
    content: `To access Riazify you must create an account. You agree to provide accurate, current and complete information during registration and to keep your account information updated. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify us immediately at support@riazify.com of any unauthorised use of your account. We reserve the right to terminate accounts that violate these Terms.`
  },
  {
    title: '5. Subscription Plans and Billing',
    items: [
      { label: 'Free Plan', desc: 'Riazify offers a free tier with limited features. No payment information required.' },
      { label: 'Paid Plans', desc: 'Paid subscriptions are available on monthly or annual billing cycles. Prices are displayed at riazify.com/pricing.' },
      { label: 'Billing', desc: 'Paid subscriptions are billed in advance at the start of each billing period. All fees are in USD unless otherwise stated.' },
      { label: 'Auto-renewal', desc: 'Subscriptions automatically renew unless cancelled before the renewal date.' },
      { label: 'Price Changes', desc: 'We reserve the right to change subscription prices with 30 days advance notice via email.' },
      { label: 'Taxes', desc: 'You are responsible for all applicable taxes. We will add applicable taxes to your invoice where required by law.' },
    ]
  },
  {
    title: '6. Refund Policy',
    content: `We offer a 7-day money-back guarantee on first-time paid subscriptions. If you are not satisfied within the first 7 days of your first paid subscription, contact us at support@riazify.com for a full refund. After 7 days, subscription fees are non-refundable. Annual subscriptions are non-refundable after 30 days. Refunds are processed within 5-10 business days to the original payment method.`
  },
  {
    title: '7. Cancellation',
    content: `You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period — you will retain access to paid features until then. We do not prorate refunds for partial billing periods. To cancel, go to Settings → Subscription → Cancel Plan, or contact support@riazify.com.`
  },
  {
    title: '8. Acceptable Use',
    content: `You agree to use Riazify only for lawful purposes and in accordance with these Terms. You must not:`,
    items: [
      { label: 'Illegal Use', desc: 'Use the Service for any unlawful purpose or in violation of any applicable laws or regulations.' },
      { label: 'eBay Violations', desc: 'Use Riazify to facilitate violations of eBay\'s terms of service, policies or seller standards.' },
      { label: 'Data Scraping', desc: 'Scrape, copy, reproduce or redistribute Riazify\'s data, content or functionality without written permission.' },
      { label: 'Reverse Engineering', desc: 'Attempt to reverse engineer, decompile or disassemble the Riazify platform or its algorithms.' },
      { label: 'Harmful Content', desc: 'Transmit malware, viruses, spam or any harmful or disruptive content through the Service.' },
      { label: 'Impersonation', desc: 'Impersonate Riazify, its employees, or other users.' },
      { label: 'Multiple Accounts', desc: 'Create multiple accounts to abuse free trials or circumvent usage limits.' },
    ]
  },
  {
    title: '9. Intellectual Property',
    content: `All content, features, functionality, software, algorithms, data models, designs, logos and trademarks of Riazify are owned by Riazify LLC and are protected by US and international intellectual property laws. You are granted a limited, non-exclusive, non-transferable licence to use the Service for your own business purposes. This licence does not include any right to sublicense, sell, resell, copy or create derivative works based on our Service.`
  },
  {
    title: '10. Your Data',
    content: `You retain ownership of all data you input into Riazify. By using our Service, you grant us a limited licence to process your data solely to provide the Service. We do not claim ownership of your business data, eBay account information or content you create. For information on how we handle your personal data, see our Privacy Policy.`
  },
  {
    title: '11. Third-Party Services',
    content: `Riazify integrates with third-party services including eBay. We are not responsible for the availability, accuracy or content of third-party services. Your use of third-party services is subject to their own terms and privacy policies. We may add, modify or remove third-party integrations at any time without notice.`
  },
  {
    title: '12. Service Availability',
    content: `We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to the Service. We may suspend or discontinue the Service or any part of it for maintenance, security, legal or business reasons with reasonable notice where practicable. We are not liable for any losses arising from Service interruptions.`
  },
  {
    title: '13. Disclaimer of Warranties',
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. RIAZIFY LLC EXPRESSLY DISCLAIMS ALL WARRANTIES INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED OR THAT RESULTS OBTAINED WILL BE ACCURATE OR RELIABLE. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.`
  },
  {
    title: '14. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RIAZIFY LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE OR EXEMPLARY DAMAGES, INCLUDING LOSS OF PROFITS, DATA, BUSINESS OR GOODWILL. OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRIOR TO THE CLAIM OR (B) $100 USD.`
  },
  {
    title: '15. Indemnification',
    content: `You agree to indemnify, defend and hold harmless Riazify LLC, its officers, directors, employees and agents from and against any claims, liabilities, damages, losses and expenses (including reasonable legal fees) arising from your use of the Service, violation of these Terms, violation of any third-party rights, or violation of applicable law.`
  },
  {
    title: '16. Governing Law and Disputes',
    content: `These Terms are governed by the laws of the United States. Any dispute arising from these Terms or your use of Riazify shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association rules. You waive any right to participate in class action lawsuits against Riazify LLC.`
  },
  {
    title: '17. Termination',
    content: `We may terminate or suspend your account immediately, without notice, for violation of these Terms, suspected fraud, non-payment, or any reason we deem necessary to protect our Service or users. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination will survive, including intellectual property, disclaimers, indemnification and limitation of liability.`
  },
  {
    title: '18. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. We will notify you of material changes by email and by posting a notice on our platform at least 30 days before changes take effect. Your continued use of Riazify after changes take effect constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Service.`
  },
  {
    title: '19. Severability',
    content: `If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining Terms remain in full force and effect.`
  },
  {
    title: '20. Contact Us',
    content: `For questions about these Terms of Service, contact us at: legal@riazify.com. For general support: support@riazify.com. For privacy matters: privacy@riazify.com.`
  },
]

export default function TermsOfServicePage() {
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
              <span className="text-[12px] font-bold" style={{ color: C.lime }}>Terms of Service</span>
            </div>
            <h1 className="text-[40px] font-black mb-3" style={{ color: '#fff' }}>Terms of Service</h1>
            <p className="text-[14px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Last updated: {LAST_UPDATED}</p>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Operated by Riazify LLC</p>
          </div>
        </div>

        {/* Quick summary */}
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <div className="rounded-2xl p-6" style={{ backgroundColor: C.limeTint, border: `1px solid rgba(143,255,0,0.3)` }}>
            <p className="text-[12px] font-black tracking-wider mb-4" style={{ color: C.limeDeep }}>KEY POINTS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '💳', title: '7-day money back', desc: 'Full refund within 7 days of your first paid subscription' },
                { icon: '🚫', title: 'Cancel anytime', desc: 'No lock-in — cancel from your account settings at any time' },
                { icon: '🔒', title: 'Your data is yours', desc: 'You own your business data — we never sell it' },
                { icon: '⚖️', title: 'US law governs', desc: 'These Terms are governed by United States law' },
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
              Please read these Terms of Service carefully before using Riazify. These Terms govern your access to and use of our platform. By creating an account or using our services, you agree to be bound by these Terms.
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
              <Link href="/privacy-policy" className="text-[12px] font-bold hover:opacity-70" style={{ color: C.limeDeep }}>Privacy Policy</Link>
              <Link href="/cookie-policy" className="text-[12px] font-bold hover:opacity-70" style={{ color: C.limeDeep }}>Cookie Policy</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}