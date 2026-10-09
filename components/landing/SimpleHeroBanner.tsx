'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react'

const T = {
  primary: '#7530fb',
  accent: '#b8fa33',
  dark: '#1e1535',
  bgApp: '#f8f7ff',
  textPrimary: '#1f1d2e',
  textSecondary: '#6b7280',
  border: '#ede9fe',
}

export default function SimpleHeroBanner() {
  const router = useRouter()
  const [niche, setNiche] = useState('')

  function handleScan() {
    if (!niche.trim()) return
    // Handle scan logic
    router.push(`/dashboard/product-research?q=${encodeURIComponent(niche)}`)
  }

  return (
    <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: '#ffffff' }}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf9ff] to-white pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">

          {/* Simple badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-gray-200 bg-white shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Trusted by 12,000+ eBay sellers</span>
          </div>

          {/* Clean headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight" style={{ color: T.textPrimary }}>
            Find profitable products{' '}
            <span style={{ color: T.primary }}>before everyone else</span>
          </h1>

          {/* Simple subheadline */}
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Real-time eBay analytics and AI forecasting to help you avoid dead stock and source winning products with confidence.
          </p>

          {/* Clean search input */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-gray-200 p-2 shadow-sm hover:border-gray-300 transition-colors focus-within:border-purple-500">
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Enter a product or niche (e.g., wireless chargers)"
                className="flex-1 px-4 py-3 text-base outline-none bg-transparent"
                style={{ color: T.textPrimary }}
              />
              <button
                onClick={handleScan}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                style={{ background: T.primary, color: 'white' }}
              >
                Analyze Now
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Free analysis • No credit card required</p>
          </div>

          {/* Simple trust indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-gray-400" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-gray-400" />
              <span>30-second setup</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-400" />
              <span>98% AI accuracy</span>
            </div>
          </div>

          {/* Clean stats row */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16 pt-12 border-t border-gray-200">
            <div className="text-center">
              <p className="text-3xl font-bold mb-1" style={{ color: T.primary }}>12K+</p>
              <p className="text-sm text-gray-600">Active sellers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1" style={{ color: T.primary }}>$4.2M+</p>
              <p className="text-sm text-gray-600">Revenue protected</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1" style={{ color: T.primary }}>98%</p>
              <p className="text-sm text-gray-600">Forecast accuracy</p>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8f7ff] to-transparent pointer-events-none" />
    </section>
  )
}
