'use client'
// components/admin/settings-tabs/PlanLimitsTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/plan_limits_tab.dart

import { useState } from 'react'
import { Save } from 'lucide-react'

const C = { dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B' }

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function LimitColumn({ tier, searches: initSearches, vero: initVero, support: initSupport }: {
  tier: string; searches: string; vero: string; support: string
}) {
  const [searches, setSearches] = useState(initSearches)
  const [vero,     setVero]     = useState(initVero)
  const [support,  setSupport]  = useState(initSupport)

  return (
    <div className="flex-1 p-4 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
      {/* Tier badge */}
      <div className="inline-block px-2.5 py-1 rounded-md mb-5"
           style={{ backgroundColor: C.dark }}>
        <span className="text-[12px] font-bold text-white">{tier}</span>
      </div>

      {/* Daily Searches */}
      <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Daily Searches</p>
      <input value={searches} onChange={e => setSearches(e.target.value)}
        className="w-full h-9 px-3 rounded-md border text-[13px] outline-none mb-4"
        style={{ backgroundColor: '#fff', borderColor: C.border, color: C.text }} />

      {/* VeRO Checks */}
      <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>VeRO Checks</p>
      <input value={vero} onChange={e => setVero(e.target.value)}
        className="w-full h-9 px-3 rounded-md border text-[13px] outline-none mb-4"
        style={{ backgroundColor: '#fff', borderColor: C.border, color: C.text }} />

      {/* Support Level */}
      <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Support Level</p>
      <input value={support} onChange={e => setSupport(e.target.value)}
        className="w-full h-9 px-3 rounded-md border text-[13px] outline-none"
        style={{ backgroundColor: '#fff', borderColor: C.border, color: C.text }} />
    </div>
  )
}

export default function PlanLimitsTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>Subscription Plan Limits</h2>
      <p className="text-[13px] mb-6" style={{ color: C.muted }}>
        Dynamically control feature allowances for each subscription tier.
      </p>

      {/* 3 plan columns */}
      <div className="flex gap-4 mb-6">
        <LimitColumn tier="Free Trial" searches="10"        vero="15"        support="Basic"    />
        <LimitColumn tier="Pro Plan"   searches="300"       vero="500"       support="Standard" />
        <LimitColumn tier="Elite Plan" searches="Unlimited" vero="Unlimited" support="Priority" />
      </div>

      {/* Save button — right aligned */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold"
                style={{ backgroundColor: C.dark, color: C.lime }}>
          <Save size={15} /> Save New Limits
        </button>
      </div>

    </div>
  )
}