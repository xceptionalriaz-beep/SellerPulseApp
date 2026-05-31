'use client'
// components/admin/settings-tabs/KillSwitchesTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/kill_switches_tab.dart

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

const C = { dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B' }

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function ToggleCard({ title, desc, active, isOffline = false }: {
  title: string; desc: string; active: boolean; isOffline?: boolean
}) {
  const [on, setOn] = useState(active)
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl border"
         style={{
           backgroundColor: isOffline ? '#FEF2F2' : C.bg,
           borderColor:     isOffline ? '#FECACA' : C.border,
         }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-[15px] font-bold" style={{ color: isOffline ? '#F87171' : C.text }}>{title}</p>
          {isOffline && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: '#F87171' }}>OFFLINE</span>
          )}
        </div>
        <p className="text-[12px]" style={{ color: C.muted }}>{desc}</p>
      </div>
      {/* Toggle — lime thumb dark track matches Dart Switch */}
      <div onClick={() => setOn(s => !s)}
           className="relative w-12 h-6 rounded-full cursor-pointer transition-colors shrink-0"
           style={{ backgroundColor: on ? C.dark : 'rgba(248,113,113,0.6)' }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
             style={{ backgroundColor: on ? C.lime : '#fff', left: on ? '26px' : '2px' }} />
      </div>
    </div>
  )
}

export default function KillSwitchesTab(_props: Props) {
  return (
    // Red border + red shadow matches Dart BoxDecoration
    <div className="p-6 rounded-2xl border"
         style={{
           backgroundColor: '#fff',
           borderColor: '#FECACA',
           boxShadow: '0 0 20px rgba(239,68,68,0.04)',
         }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle size={20} style={{ color: '#F87171' }} />
        <h2 className="text-[18px] font-bold flex-1" style={{ color: C.text }}>
          Global Kill Switches (Emergencies Only)
        </h2>
      </div>
      <p className="text-[13px] mb-6" style={{ color: C.muted }}>
        Instantly disable specific platform features if an external API goes down.
      </p>

      {/* Toggle cards */}
      <div className="flex flex-col gap-3">
        <ToggleCard title="eBay Product Research Tool" desc="Disables the fetch bar and product scraping."         active={true}  />
        <ToggleCard title="VeRO Brand Scanner"          desc="Disables checking against the VeRO dictionary."      active={true}  />
        <ToggleCard title="Amazon FBA Calculator"       desc="Disables Amazon API estimates."                      active={false} isOffline />
      </div>

    </div>
  )
}