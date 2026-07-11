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
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* View only banner */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        padding: '10px 20px', 
        background: '#eff6ff', 
        borderBottom: '1px solid #bfdbfe',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
      }}>
        <Eye size={15} style={{ color: '#1d4ed8', flexShrink: 0 }}/>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8', margin: 0 }}>
          View only{tabLabel ? ` — ${tabLabel}` : ''} — you can browse but cannot make any changes. Contact your admin to request full access.
        </p>
      </div>

      {/* Content */}
      {children}

      {/* Full overlay blocking all clicks but allowing scroll */}
      <div style={{
        position:      'fixed',
        top:           0,
        left:          0,
        right:         0,
        bottom:        0,
        zIndex:        9998,
        cursor:        'default',
        background:    'transparent',
        userSelect:    'text',
      }} onClick={e => e.preventDefault()}/>
    </div>
  )
}