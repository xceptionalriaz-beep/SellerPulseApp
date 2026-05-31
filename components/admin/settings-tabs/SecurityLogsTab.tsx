'use client'
// components/admin/settings-tabs/SecurityLogsTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/security_logs_tab.dart

import { Download, ShieldX, Key, Lock, AlertTriangle } from 'lucide-react'

const C = { dark: '#0F172A', border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8' }

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function obscure(text: string, mode: boolean, isEmail = false): string {
  if (!mode) return text
  if (isEmail) {
    const parts = text.split('@')
    if (parts.length !== 2) return text
    return `${parts[0][0]}***@${parts[1]}`
  }
  return `${text[0]}***`
}

const LOGS = [
  { icon: ShieldX, color: '#F87171', event: 'Failed Login (5 Attempts)',   user: 'admin@dropkings.com', ip: '192.168.1.42 (Russia)', time: '2 mins ago', isAlert: true  },
  { icon: Key,     color: '#FB923C', event: 'eBay API Key Rotated',         user: 'System Admin',        ip: 'Internal',             time: '1 hr ago',   isAlert: false },
  { icon: Lock,    color: '#60A5FA', event: 'Password Reset Requested',     user: 'sarah.j@gmail.com',   ip: '104.22.1.9 (USA)',     time: '3 hrs ago',  isAlert: false },
]

export default function SecurityLogsTab({ isInvestorMode = false }: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>Security & Audit Logs</h2>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Monitor suspicious activities, failed logins, and system changes.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white shrink-0"
                style={{ backgroundColor: '#F87171' }}>
          <Download size={15} /> Export Full Database
        </button>
      </div>

      {/* Fraud Sentinel banner */}
      <div className="p-4 rounded-xl border mb-8" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} style={{ color: '#F87171' }} />
          <p className="text-[15px] font-bold" style={{ color: '#F87171' }}>
            🚨 Fraud & Password-Sharing Sentinel
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="flex-1 text-[13px]" style={{ color: C.text }}>
            User {obscure('mike@dropkings.com', isInvestorMode, true)} logged in from New York, London, and Tokyo within 3 hours. Suspected Elite account sharing.
          </p>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white shrink-0"
                  style={{ backgroundColor: C.dark }}>
            <Lock size={13} /> Lock Account
          </button>
        </div>
      </div>

      {/* Audit logs */}
      <p className="text-[16px] font-bold mb-4" style={{ color: C.text }}>Standard Audit Logs</p>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 800 }}>
          {LOGS.map((l, i) => {
            const Icon = l.icon
            return (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border mb-3"
                   style={{ backgroundColor: C.bg, borderColor: C.border }}>
                {/* Icon */}
                <div className="p-2.5 rounded-full shrink-0"
                     style={{ backgroundColor: l.color + '33' }}>
                  <Icon size={19} style={{ color: l.color }} />
                </div>
                {/* Event + user */}
                <div className="flex-[2] min-w-0">
                  <p className="text-[14px] font-bold" style={{ color: C.text }}>{l.event}</p>
                  <p className="text-[12px]" style={{ color: C.muted }}>
                    {obscure(l.user, isInvestorMode, true)}
                  </p>
                </div>
                {/* IP */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold" style={{ color: C.text }}>
                    {obscure(l.ip, isInvestorMode)}
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>IP Address</p>
                </div>
                {/* Time */}
                <p className="text-[12px] font-bold shrink-0" style={{ color: C.hint }}>{l.time}</p>
                {/* Block IP / spacer */}
                <div style={{ width: 85 }} className="shrink-0">
                  {l.isAlert && (
                    <button className="w-full px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
                            style={{ backgroundColor: '#F87171' }}>
                      Block IP
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}