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
      {/* View only pill — floats top-right, doesn't push content down */}
      <div title="You can browse but cannot make any changes. Contact your admin to request full access."
        style={{
          position:        'absolute',
          top:             16,
          right:           16,
          zIndex:          9999,
          display:         'flex',
          alignItems:      'center',
          gap:             6,
          padding:         '4px 10px',
          borderRadius:    100,
          background:      '#F1F5F9',
          border:          '0.5px solid #E2E8F0',
          cursor:          'default',
        }}>
        <Eye size={13} style={{ color: '#64748B', flexShrink: 0 }}/>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>View only</span>
      </div>
      
      {/* Content */}
      {children}
      
      {/* Overlay blocking clicks — only covers this content area */}
      <div style={{
        position:   'absolute',
        top:        0,
        left:       0,
        right:      0,
        bottom:     0,
        zIndex:     9998,
        cursor:     'default',
        background: 'transparent',
      }} onClick={e => e.preventDefault()}/>
    </div>
  )
}