'use client'
// components/admin/PersistentSidebar.tsx
// Converted 1:1 from _buildPersistentSidebar() in admin_management_page.dart

import { useState } from 'react'
import {
  Zap, Megaphone, Ticket, Users, Activity,
  TrendingUp, TrendingDown, Minus, Send,
  ArrowUpCircle, AlertTriangle, CreditCard,
  Settings, UserPlus,
} from 'lucide-react'

interface PersistentSidebarProps {
  investorMode: boolean
}

const TEAM_MEMBERS = [
  { name: 'You',     role: 'Founder',    initials: 'YO', online: true  },
  { name: 'Aria K.', role: 'Dev',        initials: 'AK', online: true  },
  { name: 'Sam T.',  role: 'Support',    initials: 'ST', online: true  },
  { name: 'Lena M.', role: 'Marketing',  initials: 'LM', online: false },
  { name: 'Dev Bot', role: 'Automation', initials: 'DB', online: false },
]

const ACTIVITY_FEED = [
  { icon: TrendingUp,    color: '#16A34A', text: 'Sarah upgraded to Elite.',    time: 'Just now' },
  { icon: AlertTriangle, color: '#FB923C', text: 'eBay API limit at 85%.',      time: '5 mins'   },
  { icon: CreditCard,    color: '#F87171', text: 'Mike payment declined.',      time: '12 mins'  },
  { icon: Settings,      color: '#60A5FA', text: 'Title Builder: 14 sessions.', time: '30 mins'  },
  { icon: UserPlus,      color: '#8B5CF6', text: 'New user signed up.',         time: '1 hour'   },
]

const BROADCAST_TARGETS = [
  'All Users', 'Pro Plan', 'Free Trial', 'Elite Plan',
  'Orders Tool Users', 'Profit Calc Users', 'Title Builder Users',
]

// ── Sidebar card wrapper ───────────────────────────────────────
function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full p-3.5 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: '#E2E8F0' }}>
      {children}
    </div>
  )
}

// ── Sidebar title (matches Dart _sidebarTitle) ─────────────────
function SidebarTitle({ title, color, dark = false }: { title: string; color: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-0.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[12px] font-bold" style={{ color: dark ? '#fff' : '#0F172A' }}>{title}</span>
    </div>
  )
}

// ── Stat row (matches Dart _statRow) ──────────────────────────
function StatRow({ value, label, dotColor, valueColor }: { value: string; label: string; dotColor: string; valueColor: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
      <span className="text-[13px] font-extrabold" style={{ color: valueColor }}>{value}</span>
      <span className="text-[10px]" style={{ color: '#64748B' }}>{label}</span>
    </div>
  )
}

function obscureText(text: string): string {
  return `${text[0]}***`
}

export default function PersistentSidebar({ investorMode }: PersistentSidebarProps) {
  const [broadcastTarget, setBroadcastTarget] = useState('All Users')
  const [broadcastMsg,    setBroadcastMsg]    = useState('')

  return (
    <div className="flex flex-col gap-3">

      {/* ── 1. QUICK STATS ── */}
      <SidebarCard>
        <SidebarTitle title="Quick Stats" color="#8FFF00" />
        <div className="flex flex-col gap-1.5 mt-2.5">
          <StatRow value="24"   label="online now"    dotColor="#8FFF00" valueColor="#4A8F00" />
          <StatRow value="8"    label="signups today" dotColor="#60A5FA" valueColor="#185FA5" />
          <StatRow value="$420" label="rev today"     dotColor="#FBBF24" valueColor="#854F0B" />
        </div>
      </SidebarCard>

      {/* ── 2. GLOBAL BROADCAST ── */}
      <div className="p-3.5 rounded-2xl border"
           style={{ backgroundColor: '#0F172A', borderColor: 'rgba(143,255,0,0.2)' }}>
        <SidebarTitle title="Global Broadcast" color="#8FFF00" dark />
        <div className="flex flex-col gap-2 mt-2.5">
          {/* Target dropdown */}
          <div className="px-2.5 py-1 rounded-lg border"
               style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(143,255,0,0.2)' }}>
            <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)}
              className="w-full text-[11px] font-medium bg-transparent outline-none"
              style={{ color: '#fff' }}>
              {BROADCAST_TARGETS.map(t => <option key={t} value={t} style={{ backgroundColor: '#1E293B' }}>{t}</option>)}
            </select>
          </div>
          {/* Message field */}
          <textarea rows={3} value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
            className="w-full rounded-lg p-2.5 text-[12px] resize-none outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(143,255,0,0.15)',
              color: '#fff',
            }}
            placeholder="Type a message..." />
          {/* Send button */}
          <button
            onClick={() => { if (broadcastMsg.trim()) setBroadcastMsg('') }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold"
            style={{ backgroundColor: '#8FFF00', color: '#0F172A' }}>
            <Send size={12} />
            Push to {broadcastTarget}
          </button>
        </div>
      </div>

      {/* ── 3. TICKETS + BUGS ── */}
      <SidebarCard>
        <SidebarTitle title="Tickets & Bugs" color="#F87171" />
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          {/* Open tickets */}
          <div className="flex flex-col items-center p-2.5 rounded-xl border"
               style={{ backgroundColor: '#FEF2F2', borderColor: '#FFCDD2' }}>
            <span className="text-[22px] font-extrabold" style={{ color: '#F87171' }}>3</span>
            <span className="text-[9px] font-semibold text-center" style={{ color: '#F87171' }}>Open Tickets</span>
            <div className="flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={9} style={{ color: '#F87171' }} />
              <span className="text-[8px]" style={{ color: '#9CA3AF' }}>+1 today</span>
            </div>
          </div>
          {/* Bug reports */}
          <div className="flex flex-col items-center p-2.5 rounded-xl border"
               style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
            <span className="text-[22px] font-extrabold" style={{ color: '#FB923C' }}>1</span>
            <span className="text-[9px] font-semibold text-center" style={{ color: '#FB923C' }}>Bug Reports</span>
            <div className="flex items-center gap-0.5 mt-0.5">
              <Minus size={9} style={{ color: '#FB923C' }} />
              <span className="text-[8px]" style={{ color: '#9CA3AF' }}>No change</span>
            </div>
          </div>
        </div>
      </SidebarCard>

      {/* ── 4. TEAM ONLINE ── */}
      <SidebarCard>
        <div className="flex items-center justify-between">
          <SidebarTitle title="Team Online" color="#8FFF00" />
          <div className="px-1.5 py-0.5 rounded-full border text-[9px] font-bold"
               style={{ backgroundColor: 'rgba(143,255,0,0.12)', borderColor: 'rgba(143,255,0,0.3)', color: '#4A8F00' }}>
            {TEAM_MEMBERS.filter(m => m.online).length} active
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2.5">
          {TEAM_MEMBERS.map(m => (
            <div key={m.name} className="flex items-center gap-2">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: m.online ? '#0F172A' : '#F1F5F9' }}>
                  <span className="text-[10px] font-extrabold"
                        style={{ color: m.online ? '#8FFF00' : '#94A3B8' }}>{m.initials}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-[1.5px] border-white"
                     style={{ backgroundColor: m.online ? '#8FFF00' : '#CBD5E1' }} />
              </div>
              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate"
                   style={{ color: m.online ? '#0F172A' : '#94A3B8' }}>{m.name}</p>
                <p className="text-[9px]" style={{ color: '#94A3B8' }}>{m.role}</p>
              </div>
              {/* Status badge */}
              <div className="px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                   style={{
                     backgroundColor: m.online ? 'rgba(143,255,0,0.10)' : '#F1F5F9',
                     color: m.online ? '#4A8F00' : '#94A3B8',
                   }}>
                {m.online ? 'Active' : 'Offline'}
              </div>
            </div>
          ))}
        </div>
      </SidebarCard>

      {/* ── 5. LIVE ACTIVITY FEED ── */}
      <SidebarCard>
        <div className="flex items-center justify-between">
          <SidebarTitle title="Live Activity" color="#8FFF00" />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8FFF00' }} />
        </div>
        <div className="flex flex-col gap-2.5 mt-2.5">
          {ACTIVITY_FEED.map((a, i) => {
            const Icon = a.icon
            return (
              <div key={i} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                     style={{ backgroundColor: a.color + '1A' }}>
                  <Icon size={11} style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] leading-snug" style={{ color: '#0F172A' }}>
                    {investorMode ? obscureText(a.text) : a.text}
                  </p>
                  <p className="text-[9px]" style={{ color: '#94A3B8' }}>{a.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </SidebarCard>

    </div>
  )
}