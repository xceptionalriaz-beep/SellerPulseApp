'use client'
// components/landing/Footer.tsx
import { useState } from 'react'
import { Activity } from 'lucide-react'

const T = {
  white:       '#ffffff',
  surface:     '#f7f9f5',
  border:      '#e8ede2',
  accentBorder:'rgba(143,255,0,0.35)',
  lime:        '#8fff00',
  limeDeep:    '#4a8f00',
  limeMid:     '#6bcc00',
  limeTint:    '#f4ffe6',
  limePale:    '#e8ffcc',
  carbon:      '#1a2410',
  sage:        '#8a9e78',
  black:       '#0a0d08',
}

export default function Footer() {
  const [email, setEmail] = useState("")
  return (
    <footer className="py-16 border-t" style={{ background: T.carbon, borderColor: "#1a2410" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: T.lime }}>
                <Activity size={13} style={{ color: T.black }} />
              </div>
              <span className="text-[16px] font-black text-white">Riazify</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: T.sage }}>
              Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers.
            </p>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(143,255,0,0.2)" }}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email..."
                className="flex-1 px-4 py-2.5 text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", color: T.white }} />
              <button className="px-4 py-2.5 text-[12px] font-black shrink-0"
                      style={{ background: T.lime, color: T.black }}>
                Subscribe
              </button>
            </div>
          </div>

          {[
            { title: "Product", links: [
                { label: "Features",         href: "#features" },
                { label: "Pricing",          href: "/pricing"  },
                { label: "Changelog",        href: "#"         },
                { label: "Roadmap",          href: "/roadmap"  },
                { label: "Status",           href: "/status"   },
                { label: "Chrome Extension", href: "#"         },
              ]},
            { title: "Company", links: [
                { label: "About",     href: "#" },
                { label: "Blog",      href: "#" },
                { label: "Careers",   href: "#" },
                { label: "Press Kit", href: "#" },
              ]},
            { title: "Legal", links: [
                { label: "Privacy Policy",   href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy",    href: "#" },
                { label: "GDPR",             href: "#" },
              ]},
          ].map(col => (
            <div key={col.title}>
              <p className="text-[12px] font-black tracking-wider mb-4 text-white">{col.title.toUpperCase()}</p>
              <div className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <a key={l.label} href={l.href}
                     className="text-[13px] transition-opacity hover:opacity-100 opacity-60"
                     style={{ color: l.label === 'Roadmap' || l.label === 'Status' || l.label === 'Pricing' ? T.lime : T.sage }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t flex items-center justify-between flex-wrap gap-4"
             style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[12px]" style={{ color: T.sage }}>Â© 2026 Riazify â€” All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "YouTube", "Discord"].map(s => (
              <a key={s} href="#" className="text-[12px] font-semibold transition-opacity hover:opacity-100 opacity-50"
                 style={{ color: T.sage }}>{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
