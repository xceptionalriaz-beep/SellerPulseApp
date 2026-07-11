'use client'
// components/admin/AdminSettingsModal.tsx
import React, { useState } from 'react'
import { X, Palette, Settings, Shield, Zap, Globe } from 'lucide-react'
import BrandManagerTab           from '@/components/admin/settings-tabs/BrandManagerTab'
import AdminGeneralSettings      from '@/components/admin/settings/AdminGeneralSettings'
import AdminSecuritySettings     from '@/components/admin/settings/AdminSecuritySettings'
import AdminIntegrationsSettings from '@/components/admin/settings/AdminIntegrationsSettings'

const C = {
  lime:   '#8fff00',
  dark:   '#1a2410',
  border: '#e8ede2',
  muted:  '#8a9e78',
  bg:     '#f7f9f5',
  surface:'#ffffff',
  text:   '#1a2410',
}

interface Props { onClose: () => void }

const TABS = [
  { id: 'brand',        label: 'Brand',       icon: Palette },
  { id: 'general',      label: 'General',      icon: Globe   },
  { id: 'security',     label: 'Security',     icon: Shield  },
  { id: 'integrations', label: 'Integrations', icon: Zap     },
]

export default function AdminSettingsModal({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState('brand')

  function renderContent() {
    switch (activeTab) {
      case 'brand':        return <BrandManagerTab/>
      case 'general':      return <AdminGeneralSettings/>
      case 'security':     return <AdminSecuritySettings/>
      case 'integrations': return <AdminIntegrationsSettings/>
      default:             return null
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 1200, height: '88vh', backgroundColor: C.surface, borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, backgroundColor: C.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} style={{ color: C.muted }}/>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'Inter, sans-serif' }}>Admin Settings</span>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: C.border, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} style={{ color: C.muted }}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left sidebar */}
          <div style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: C.bg, overflowY: 'auto' }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', backgroundColor: isActive ? C.surface : 'transparent', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}>
                  <tab.icon size={15} style={{ color: isActive ? C.dark : C.muted, flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.dark : C.muted, fontFamily: 'Inter, sans-serif', flex: 1 }}>{tab.label}</span>
                  {isActive && <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.lime, flexShrink: 0 }}/>}
                </button>
              )
            })}
          </div>

          {/* Right content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}