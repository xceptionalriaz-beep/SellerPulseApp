'use client'
// components/admin/settings-tabs/GamificationTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/gamification_tab.dart

import { useState } from 'react'
import { Plus, Trophy } from 'lucide-react'

const C = { dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8' }

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function QuestCard({ title, reward, active }: { title: string; reward: string; active: boolean }) {
  const [on, setOn] = useState(active)
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border mb-3"
         style={{ backgroundColor: C.bg, borderColor: C.border }}>
      <Trophy size={26} style={{ color: on ? C.lime : C.hint }} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold mb-0.5" style={{ color: C.text }}>{title}</p>
        <p className="text-[12px] font-bold" style={{ color: C.muted }}>{reward}</p>
      </div>
      {/* Toggle — lime thumb dark track matches Dart Switch */}
      <div onClick={() => setOn(s => !s)}
           className="relative w-11 h-6 rounded-full cursor-pointer transition-colors shrink-0"
           style={{ backgroundColor: on ? C.dark : '#CBD5E1' }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
             style={{ backgroundColor: on ? C.lime : '#fff', left: on ? '22px' : '2px' }} />
      </div>
    </div>
  )
}

export default function GamificationTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      {/* Header — matches Dart ResponsiveActionHeader */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>User Gamification & Quests</h2>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Increase trial conversions by making your software addictive through rewards.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white shrink-0"
                style={{ backgroundColor: C.dark }}>
          <Plus size={15} /> New Quest
        </button>
      </div>

      {/* Quest cards */}
      <QuestCard title="Quest 1: Run your first product search" reward="Reward: Unlock 3 free days of Elite!" active={true}  />
      <QuestCard title="Quest 2: Connect your eBay Store"       reward="Reward: Free 1-on-1 Strategy Call"  active={true}  />
      <QuestCard title="Quest 3: Find 5 Profitable Items"       reward="Reward: Unlock Secret Suppliers List" active={false} />

    </div>
  )
}