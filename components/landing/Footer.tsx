'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setTimeout(() => {
      setEmail('')
      setSubscribed(false)
    }, 2500)
  }

  const productLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Status', href: '/status' },
    { label: 'Chrome Extension', href: '#' },
  ]

  const companyLinks = [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Kit', href: '/press-kit' },
    { label: 'Affiliates', href: '/affiliate' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'GDPR', href: '/gdpr' },
  ]

  const socialLinks = [
    { label: 'Twitter', href: 'https://twitter.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
    { label: 'Discord', href: 'https://discord.com' },
  ]

  return (
    <footer
      className="pt-16 pb-12 border-t font-sans"
      style={{ backgroundColor: '#1e1535', borderColor: '#2d1f4e' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: '#7530fb' }}
              >
                <Activity size={16} style={{ color: '#b8fa33' }} />
              </div>
              <span className="text-[20px] font-black font-syne tracking-tight" style={{ color: '#ffffff' }}>
                Riazify
              </span>
            </div>

            <p className="text-[13px] leading-relaxed max-w-sm" style={{ color: '#ffffff' }}>
              Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex rounded-xl overflow-hidden border p-1 max-w-md"
              style={{ backgroundColor: '#271c42', borderColor: '#2d1f4e' }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                className="flex-1 px-3.5 py-2 text-[13px] outline-none bg-transparent placeholder-[#ffffff]/60"
                style={{ color: '#ffffff' }}
              />
              <button
                type="submit"
                className="px-5 py-2 text-[12px] font-black rounded-lg transition-all hover:scale-105 shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
                style={{ backgroundColor: '#b8fa33', color: '#1e1535' }}
              >
                <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
                {!subscribed && <ArrowRight size={13} />}
              </button>
            </form>
          </div>

          {/* PRODUCT Column */}
          <div>
            <p className="text-[12px] font-black tracking-wider mb-4 font-syne uppercase flex items-center gap-2" style={{ color: '#ffffff' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#7530fb' }} />
              <span>PRODUCT</span>
            </p>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] block transition-all duration-200 hover:translate-x-1"
                    style={{ color: '#ffffff' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#b8fa33')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY Column */}
          <div>
            <p className="text-[12px] font-black tracking-wider mb-4 font-syne uppercase flex items-center gap-2" style={{ color: '#ffffff' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#7530fb' }} />
              <span>COMPANY</span>
            </p>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] block transition-all duration-200 hover:translate-x-1"
                    style={{ color: '#ffffff' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#b8fa33')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL Column */}
          <div>
            <p className="text-[12px] font-black tracking-wider mb-4 font-syne uppercase flex items-center gap-2" style={{ color: '#ffffff' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#7530fb' }} />
              <span>LEGAL</span>
            </p>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] block transition-all duration-200 hover:translate-x-1"
                    style={{ color: '#ffffff' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#b8fa33')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Social Links */}
        <div
          className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: '#2d1f4e' }}
        >
          <p className="text-[12px] text-center md:text-left font-medium" style={{ color: '#ffffff' }}>
            © {new Date().getFullYear()} Riazify — All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#b8fa33')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
