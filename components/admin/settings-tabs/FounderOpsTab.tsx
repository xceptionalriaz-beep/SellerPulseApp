'use client'
// components/admin/settings-tabs/FounderOpsTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/founder_ops_tab.dart

import { useState } from 'react'
import { CheckSquare, Network, DollarSign, Gauge, ShieldCheck } from 'lucide-react'

const C = {
  lime: '#8FFF00', dark: '#0F172A', border: '#E2E8F0',
  text: '#0F172A', muted: '#64748B',
}

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

// ── Circular progress (matches Dart CircularProgressIndicator) ─
function CircleProgress({ value }: { value: number }) {
  const r    = 17; const sw = 5; const circ = 2 * Math.PI * r
  const dash = value * circ
  return (
    <div className="relative" style={{ width: 44, height: 44 }}>
      <svg width="44" height="44">
        <circle cx="22" cy="22" r={r} fill="none"
          stroke={`rgba(143,255,0,0.16)`} strokeWidth={sw} />
        <circle cx="22" cy="22" r={r} fill="none"
          stroke={C.lime} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold" style={{ color: C.text }}>
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  )
}

// ── Stat tile (matches Dart _buildStatTile) ───────────────────
function StatTile({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl"
         style={{ backgroundColor: C.dark, boxShadow: `0 0 10px ${color}28` }}>
      <Icon size={23} style={{ color }} />
      <div>
        <p className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
        <p className="text-[18px] font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function FounderOpsTab(_props: Props) {
  const [tasks, setTasks] = useState([
    { task: 'Check Amazon Associates 24h Clicks',  done: false },
    { task: 'Verify CJ Dropshipping Pixel Status', done: false },
    { task: 'Audit AutoDS Referral Conversion',    done: false },
    { task: 'Review Stripe/PayPal Dispute Center', done: false },
    { task: 'Scan Security Logs for Brute Force',  done: false },
  ])

  const completed = tasks.filter(t => t.done).length
  const progress  = completed / tasks.length

  function toggleTask(i: number) {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">

      {/* Header */}
      <div>
        <h1 className="text-[34px] font-black tracking-tight mb-2" style={{ color: C.text }}>
          Founder Control Center
        </h1>
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          Reazify LLC Executive Operations
        </p>
      </div>

      {/* Main row — checklist + strategy panel */}
      <div className="flex gap-6 items-start flex-wrap lg:flex-nowrap">

        {/* Checklist (flex 6) */}
        <div className="flex-[6] p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <CheckSquare size={23} style={{ color: C.lime }} />
              <p className="text-[13px] font-black tracking-[1.2px]" style={{ color: C.text }}>
                WEEKLY REVENUE PULSE
              </p>
            </div>
            {/* Progress ring */}
            <CircleProgress value={progress} />
          </div>

          <div className="flex flex-col gap-1">
            {tasks.map((item, i) => (
              <label key={i} className="flex items-center gap-3 py-2 cursor-pointer">
                {/* Checkbox — lime active matches Dart CheckboxListTile activeColor */}
                <div onClick={() => toggleTask(i)}
                     className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                     style={{
                       backgroundColor: item.done ? C.lime : '#fff',
                       borderColor:     item.done ? C.lime : C.border,
                     }}>
                  {item.done && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-[14px] font-semibold"
                      style={{ color: item.done ? C.muted : C.dark }}>
                  {item.task}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Strategy panel (flex 4) */}
        <div className="flex-[4] flex flex-col gap-4">
          <StatTile label="Marketplace Status" value="8 Active"   icon={Network}    color={C.lime}     />
          <StatTile label="Pending Payouts"    value="$1,240.50"  icon={DollarSign} color='#60A5FA'    />
          <StatTile label="API Efficiency"     value="99.8%"      icon={Gauge}      color='#A78BFA'    />
        </div>

      </div>

      {/* Deployment Shield */}
      <div className="flex items-center gap-6 p-6 rounded-2xl border flex-wrap"
           style={{
             background: `linear-gradient(to right, ${C.dark}, rgba(15,23,42,0.85))`,
             borderColor: 'rgba(143,255,0,0.2)',
           }}>
        <ShieldCheck size={40} style={{ color: C.lime, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-black text-white mb-1">DEPLOYMENT GUARD ACTIVE</p>
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Next Scheduled System Update: Sunday, April 12 at 02:00 AM (Low Traffic Window)
          </p>
        </div>
        <button className="px-5 py-2.5 rounded-lg text-[13px] font-bold shrink-0"
                style={{ backgroundColor: C.lime, color: '#000' }}>
          RESCHEDULE
        </button>
      </div>

    </div>
  )
}