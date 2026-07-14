// components/admin/PermissionWrapper.tsx
'use client'
import React from 'react'
import { Eye } from 'lucide-react'

interface Props {
  children:  React.ReactNode
  viewOnly:  boolean
  tabLabel?: string
}

export default function PermissionWrapper({ children, viewOnly, tabLabel }: Props) {
  if (!viewOnly) return <>{children}</>
  return (
    <div style={{ position: 'relative' }}>
      {/* View only banner */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        padding:      '10px 20px',
        background:   '#eff6ff',
        borderBottom: '1px solid #bfdbfe',
        borderRadius: 12,
        marginBottom: 16,
      }}>
        <Eye size={15} style={{ color: '#1d4ed8', flexShrink: 0 }}/>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8', margin: 0 }}>
          View only{tabLabel ? ` — ${tabLabel}` : ''} — you can see this tab but cannot make changes. Contact your admin to request access.
        </p>
      </div>
      {/* Content */}
      {children}
    </div>
  )
}