'use client'
// components/admin/tabs/ChromeExtensionTab.tsx
// Converted 1:1 from lib/pages/admin_tabs/chrome_extension_tab.dart

import { Download, AlertTriangle } from 'lucide-react'

const C = {
  dark: '#0F172A', border: '#E2E8F0',
  bg: '#F8FAFC', text: '#0F172A', muted: '#64748B',
}

interface Props { isInvestorMode?: boolean; isMobile?: boolean; startChartAnimation?: boolean }

function ExtensionStatCard({ title, value, subtitle }: {
  title: string; value: string; subtitle: string
}) {
  return (
    <div className="flex-1 p-5 rounded-xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
      <p className="text-[12px] font-bold mb-2" style={{ color: C.muted }}>{title}</p>
      <p className="text-[24px] font-bold mb-1" style={{ color: C.text }}>{value}</p>
      <p className="text-[11px] font-bold" style={{ color: '#16A34A' }}>{subtitle}</p>
    </div>
  )
}

export default function ChromeExtensionTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>Chrome Extension Control Center</h2>
      <p className="text-[13px] mb-6" style={{ color: C.muted }}>
        Manage live browser extensions, OTA updates, and user alerts.
      </p>

      {/* Stat cards */}
      <div className="flex gap-4 mb-8">
        <ExtensionStatCard title="Active Installs"     value="12,405"  subtitle="+342 this week"      />
        <ExtensionStatCard title="Daily Active Users"  value="4,200"   subtitle="34% engagement"      />
        <ExtensionStatCard title="Current Version"     value="v2.4.1"  subtitle="Approved by Google"  />
      </div>

      {/* OTA Update + Warning — crossAxisAlignment: start matches Dart safeguard */}
      <div className="flex gap-4 items-start">

        {/* Push OTA Update */}
        <div className="flex-1 flex flex-col gap-3 p-5 rounded-xl border"
             style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <p className="text-[15px] font-bold" style={{ color: C.text }}>Push Over-The-Air Update</p>
          <textarea rows={2} placeholder="Release notes..."
            className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none resize-none bg-white"
            style={{ borderColor: C.border, color: C.text }} />
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white w-fit"
                  style={{ backgroundColor: C.dark }}>
            <Download size={15} /> Push to Clients
          </button>
        </div>

        {/* Broadcast Warning */}
        <div className="flex-1 flex flex-col gap-3 p-5 rounded-xl border"
             style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          <p className="text-[15px] font-bold" style={{ color: '#F87171' }}>Broadcast Extension Warning</p>
          <textarea rows={2} placeholder="Warning message..."
            className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none resize-none bg-white"
            style={{ borderColor: C.border, color: C.text }} />
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white w-fit"
                  style={{ backgroundColor: '#F87171' }}>
            <AlertTriangle size={15} /> Alert All Users
          </button>
        </div>

      </div>
    </div>
  )
}