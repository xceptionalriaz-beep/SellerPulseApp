// components/admin/PermissionWrapper.tsx
// Wraps any admin tab — shows view only banner and blocks all clicks
'use client'
import React from 'react'
import { Eye } from 'lucide-react'

interface Props {
  children:  React.ReactNode
  viewOnly:  boolean
  tabLabel?: string
}

export default function PermissionWrapper({ children, viewOnly, tabLabel }: Props) {
  console.log('PermissionWrapper:', tabLabel, 'viewOnly:', viewOnly)
  return (
    <div style={{ position: 'relative' }}>
      {viewOnly && (
        <>
          {/* View only banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', margin: '0 0 0 0' }}>
            <Eye size={14} style={{ color: '#1d4ed8', flexShrink: 0 }}/>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', margin: 0 }}>
              View only{tabLabel ? ` — ${tabLabel}` : ''} — you can browse but cannot make any changes. Contact your admin to request access.
            </p>
          </div>
          {/* Transparent overlay — blocks all clicks */}
          <div style={{
            position:      'absolute',
            top:           36, // below banner
            left:          0,
            right:         0,
            bottom:        0,
            zIndex:        9998,
            cursor:        'not-allowed',
            background:    'transparent',
          }}/>
        </>
      )}
      {children}
    </div>
  )
}