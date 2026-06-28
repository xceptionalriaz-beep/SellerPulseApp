'use client'
// components/admin/AdminLayoutGuard.tsx
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RIAZIFY â€” Admin Layout Guard
// Renders a hard 403 block BEFORE the tab content mounts.
// Prevents URL tampering, data flash, and escape-key exploits.
// Wrap each tab content in SettingsLayout with this component.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { Shield, Lock } from 'lucide-react'
import { AdminPermissions } from '@/hooks/useAdminPermissions'

const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  red:      '#b91c1c',
}

interface AdminLayoutGuardProps {
  tabIndex:    number
  permissions: AdminPermissions
  children:    React.ReactNode
}

export default function AdminLayoutGuard({
  tabIndex,
  permissions,
  children,
}: AdminLayoutGuardProps) {

  // â”€â”€ Still loading permissions â€” show neutral blocker â”€â”€â”€â”€â”€â”€â”€â”€
  // This prevents ANY flash of content before we know the user's scopes
  if (permissions.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
             style={{ borderTopColor: C.limeDeep }} />
        <p className="text-[13px] font-semibold" style={{ color: C.muted }}>
          Verifying access...
        </p>
      </div>
    )
  }

  // â”€â”€ Not an admin at all â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!permissions.isAdmin && !permissions.isFounder) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
             style={{ backgroundColor: C.dark }}>
          <Shield size={28} style={{ color: C.lime }} />
        </div>
        <p className="text-[18px] font-black" style={{ color: C.text }}>Access Denied</p>
        <p className="text-[13px]" style={{ color: C.muted }}>Admin access only.</p>
      </div>
    )
  }

  // â”€â”€ Check tab-level permission â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // canAccessTab returns false BEFORE children ever mount
  if (!permissions.canAccessTab(tabIndex)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5">
        {/* Hard 403 surface */}
        <div className="flex flex-col items-center gap-4 px-8 py-10 rounded-2xl border max-w-sm w-full"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>

          {/* Lock icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
            <Lock size={28} style={{ color: C.red }} />
          </div>

          {/* 403 label */}
          <div className="text-center">
            <p className="text-[11px] font-black tracking-widest mb-1"
               style={{ color: C.muted }}>
              403 FORBIDDEN
            </p>
            <p className="text-[18px] font-black" style={{ color: C.text }}>
              Access Restricted
            </p>
            <p className="text-[13px] mt-2" style={{ color: C.muted }}>
              You don't have permission to view this section.
              Contact your administrator to request access.
            </p>
          </div>

          {/* Role info */}
          {permissions.roleName && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border w-full"
                 style={{ backgroundColor: C.bg, borderColor: C.border }}>
              <Shield size={13} style={{ color: C.muted }} />
              <p className="text-[12px] font-semibold" style={{ color: C.muted }}>
                Your role: <span style={{ color: C.text }}>{permissions.roleName}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // â”€â”€ Authorized â€” render content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return <>{children}</>
}
