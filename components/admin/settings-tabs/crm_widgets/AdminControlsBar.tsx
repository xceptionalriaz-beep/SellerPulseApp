'use client'
// components/admin/settings-tabs/crm_widgets/AdminControlsBar.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/crm_widgets/admin_controls_bar.dart

import { Search, RefreshCw, UserPlus, Users, Filter, TimerOff, AlertTriangle, Headphones, Plus } from 'lucide-react'

interface Props {
  allUsers:        any[]
  onSearch:        (q: string) => void
  onAddUser:       () => void
  selectedFilter:  string
  onFilterChanged: (f: string) => void
  onRefresh:       () => void
}

const C = { dark: '#1a2410', lime: '#8FFF00', border: '#E2E8F0', muted: '#64748B', hint: '#94A3B8' }

// â”€â”€ Filter chip (matches Dart _buildFilterChip) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FilterChip({ label, icon: Icon, isAlert = false, badgeCount, isActive, onTap }: {
  label: string; icon: React.ElementType; isAlert?: boolean
  badgeCount?: number; isActive: boolean; onTap: () => void
}) {
  return (
    <button onClick={onTap}
      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all shrink-0"
      style={{
        backgroundColor: isActive ? '#8fff00' : '#fff',
        borderColor: isActive ? '#8fff00' : C.border,
        color:           isActive ? '#fff' : '#334155',
      }}>
      <Icon size={13} style={{ color: isActive ? C.lime : isAlert ? '#FB923C' : C.muted }} />
      {label}
      {badgeCount != null && badgeCount > 0 && (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: isActive ? C.lime : '#F87171',
                color: isActive ? '#1a2410' : '#fff',
              }}>
          {badgeCount}
        </span>
      )}
    </button>
  )
}

export default function AdminControlsBar({ allUsers, onSearch, onAddUser, selectedFilter, onFilterChanged, onRefresh }: Props) {

  // Badge counts (matches Dart calculations)
  const supportCount  = allUsers.filter(u => u.dispute_note && u.dispute_note.toString().trim() !== '').length
  const pastDueCount  = allUsers.filter(u => u.account_status === 'Past Due').length
  const expiredCount  = allUsers.filter(u => u.account_status === 'Expired' && u.plan_name === 'Free Trial').length

  const filters = [
    { label: 'All',             icon: Users,         isAlert: false, badge: undefined     },
    { label: 'Active Tiers',    icon: Filter,        isAlert: false, badge: undefined     },
    { label: 'Expired Trials',  icon: TimerOff,      isAlert: false, badge: expiredCount  },
    { label: 'Past Due',        icon: AlertTriangle, isAlert: true,  badge: pastDueCount  },
    { label: 'Support waiting', icon: Headphones,    isAlert: false, badge: supportCount  },
  ]

  // â”€â”€ Search box â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const SearchBox = (
    <div className="flex items-center gap-2 h-12 px-4 rounded-xl border bg-white"
         style={{ borderColor: C.border }}>
      <Search size={17} style={{ color: C.hint }} />
      <input onChange={e => onSearch(e.target.value)}
        placeholder="Search users..."
        className="flex-1 text-[13px] outline-none bg-transparent" style={{ color: '#0F172A' }} />
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
            style={{ backgroundColor: '#F1F5F9', color: C.muted }}>Cmd+K</span>
    </div>
  )

  // â”€â”€ Refresh button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const RefreshBtn = (
    <button onClick={onRefresh} title="Sync with Database"
      className="w-12 h-12 flex items-center justify-center rounded-xl border bg-white shrink-0 hover:opacity-80"
      style={{ borderColor: C.border }}>
      <RefreshCw size={19} style={{ color: C.muted }} />
    </button>
  )

  // â”€â”€ Desktop Add User button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const DesktopAddBtn = (
    <button onClick={onAddUser}
      className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-[13px] font-bold shrink-0 hover:opacity-90"
      style={{ backgroundColor: C.lime, color: C.dark }}>
      <Plus size={15} /> Add New User
    </button>
  )

  // â”€â”€ Mobile Add User button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const MobileAddBtn = (
    <button onClick={onAddUser} title="Add New User"
      className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0 hover:opacity-90"
      style={{ backgroundColor: C.lime }}>
      <UserPlus size={19} style={{ color: C.dark }} />
    </button>
  )

  return (
    <div>
      {/* Desktop layout (matches Dart isDesktop > 1100) */}
      <div className="hidden xl:flex items-center gap-6">
        <div style={{ width: 250, flexShrink: 0 }}>{SearchBox}</div>
        {/* Filter chips â€” Wrap spaceEvenly matches Dart WrapAlignment.spaceEvenly */}
        <div className="flex-1 flex flex-wrap justify-evenly gap-2">
          {filters.map(f => (
            <FilterChip key={f.label} label={f.label} icon={f.icon}
              isAlert={f.isAlert} badgeCount={f.badge}
              isActive={selectedFilter === f.label}
              onTap={() => onFilterChanged(f.label)} />
          ))}
        </div>
        {DesktopAddBtn}
        {RefreshBtn}
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col gap-4 xl:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">{SearchBox}</div>
          {MobileAddBtn}
          {RefreshBtn}
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <FilterChip key={f.label} label={f.label} icon={f.icon}
              isAlert={f.isAlert} badgeCount={f.badge}
              isActive={selectedFilter === f.label}
              onTap={() => onFilterChanged(f.label)} />
          ))}
        </div>
      </div>
    </div>
  )
}
