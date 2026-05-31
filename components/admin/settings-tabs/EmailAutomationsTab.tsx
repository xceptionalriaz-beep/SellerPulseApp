'use client'
// components/admin/settings-tabs/EmailAutomationsTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/email_automations_tab.dart

import { useState } from 'react'
import { Plus, Mail } from 'lucide-react'

const C = { dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8' }

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function EmailFlowCard({ title, trigger, emails, stats, active }: {
  title: string; trigger: string; emails: string; stats: string; active: boolean
}) {
  const [on, setOn] = useState(active)
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border mb-3"
         style={{ backgroundColor: C.bg, borderColor: C.border }}>
      <Mail size={22} style={{ color: on ? '#16A34A' : C.hint }} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold" style={{ color: C.text }}>{title}</p>
        <p className="text-[12px]" style={{ color: C.muted }}>{trigger} • {emails}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <p className="text-[13px] font-bold" style={{ color: C.text }}>{stats}</p>
        {/* Toggle — lime thumb dark track matches Dart Switch */}
        <div onClick={() => setOn(s => !s)}
             className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
             style={{ backgroundColor: on ? C.dark : '#CBD5E1' }}>
          <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
               style={{ backgroundColor: on ? C.lime : '#fff', left: on ? '22px' : '2px' }} />
        </div>
      </div>
    </div>
  )
}

export default function EmailAutomationsTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      {/* Header — matches Dart ResponsiveActionHeader */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>
            Drip Campaigns & Email Automations
          </h2>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Manage your automated customer journey and recovery sequences.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white shrink-0"
                style={{ backgroundColor: C.dark }}>
          <Plus size={15} /> New Flow
        </button>
      </div>

      {/* Email flow cards */}
      <EmailFlowCard title="Onboarding Sequence"   trigger="Trigger: New Signup"       emails="3 Emails over 7 Days" stats="68% Open Rate"     active={true}  />
      <EmailFlowCard title="Failed Payment Rescue" trigger="Trigger: Stripe Decline"   emails="2 Emails over 3 Days" stats="42% Recovery Rate" active={true}  />
      <EmailFlowCard title="Inactive User Nudge"   trigger="Trigger: 14 Days Offline"  emails="1 Email"              stats="0% Open Rate"      active={false} />

    </div>
  )
}