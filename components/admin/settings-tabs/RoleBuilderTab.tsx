'use client'
// components/admin/settings-tabs/RoleBuilderTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/role_builder_tab.dart

import { Shield, UserPlus } from 'lucide-react'

const C = { dark: '#0F172A', border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B' }

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function RoleItem({ title, desc, perms, users }: {
  title: string; desc: string; perms: string[]; users: number
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border"
         style={{ backgroundColor: C.bg, borderColor: C.border }}>
      {/* Shield icon */}
      <div className="p-3 rounded-full border bg-white shrink-0" style={{ borderColor: C.border }}>
        <Shield size={20} style={{ color: C.dark }} />
      </div>
      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold mb-0.5" style={{ color: C.text }}>{title}</p>
        <p className="text-[12px] mb-2" style={{ color: C.muted }}>{desc}</p>
        <div className="flex flex-wrap gap-2">
          {perms.map(p => (
            <span key={p} className="px-2 py-1 rounded text-[10px] font-bold"
                  style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>{p}</span>
          ))}
        </div>
      </div>
      {/* Staff count */}
      <div className="flex flex-col items-center px-4 py-3 rounded-lg border bg-white shrink-0"
           style={{ borderColor: C.border }}>
        <span className="text-[18px] font-bold" style={{ color: C.text }}>{users}</span>
        <span className="text-[11px]" style={{ color: C.muted }}>Staff</span>
      </div>
    </div>
  )
}

export default function RoleBuilderTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      {/* Header — matches Dart ResponsiveActionHeader */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>
            Team Access & Role Builder (RBAC)
          </h2>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Create strict permission roles for your VAs and customer support team.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white shrink-0"
                style={{ backgroundColor: C.dark }}>
          <UserPlus size={15} /> Invite Staff
        </button>
      </div>

      {/* Role items */}
      <div className="flex flex-col gap-4">
        <RoleItem
          title="Support Agent"
          desc="Can view CRM and Helpdesk. Cannot see Revenue or API Keys."
          perms={['CRM Access', 'Helpdesk View', 'Ghost Mode']}
          users={2}
        />
        <RoleItem
          title="Developer"
          desc="Can view and rotate API keys. Cannot view User CRM or Revenue."
          perms={['API Access', 'System Logs', 'VeRO List']}
          users={1}
        />
      </div>

    </div>
  )
}