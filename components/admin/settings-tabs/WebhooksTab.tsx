'use client'
// components/admin/settings-tabs/WebhooksTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/webhooks_tab.dart

import { useState } from 'react'
import { Webhook } from 'lucide-react'

const C = { border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', dark: '#0F172A', lime: '#8FFF00' }

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function WebhookToggle({ label, isOn: init }: { label: string; isOn: boolean }) {
  const [on, setOn] = useState(init)
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
         style={{ width: 200, borderColor: C.border }}>
      <span className="text-[13px] font-bold" style={{ color: C.text }}>{label}</span>
      {/* Scale 0.8 matches Dart Transform.scale */}
      <div style={{ transform: 'scale(0.8)' }} onClick={() => setOn(s => !s)}>
        <div className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
             style={{ backgroundColor: on ? C.dark : '#CBD5E1' }}>
          <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all bg-white"
               style={{ left: on ? '22px' : '2px' }} />
        </div>
      </div>
    </div>
  )
}

export default function WebhooksTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>Slack & Discord Webhooks</h2>
      <p className="text-[13px] mb-6" style={{ color: C.muted }}>
        Get instantly pinged in your team chat when important events happen.
      </p>

      {/* Webhook URL input */}
      <div className="flex items-center gap-2 h-12 px-3 rounded-lg border mb-4"
           style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <Webhook size={18} style={{ color: C.muted }} />
        <input placeholder="https://discord.com/api/webhooks/..."
          className="flex-1 text-[13px] outline-none bg-transparent" style={{ color: C.text }} />
      </div>

      {/* Webhook toggles — Wrap spacing 12 matches Dart */}
      <div className="flex flex-wrap gap-3">
        <WebhookToggle label="New Upgrades"    isOn={true}  />
        <WebhookToggle label="Cancellations"   isOn={true}  />
        <WebhookToggle label="API Failures"    isOn={true}  />
        <WebhookToggle label="New Free Trials" isOn={false} />
      </div>

    </div>
  )
}