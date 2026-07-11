'use client'
// components/admin/AdminSettingsModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Palette, Settings, Shield, Zap, Globe, Eye, Lock } from 'lucide-react'
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

const ALL_TABS = [
  { id: 'brand',        label: 'Brand',        icon: Palette, permKey: 'settings_brand'        },
  { id: 'general',      label: 'General',       icon: Globe,   permKey: 'settings_general'      },
  { id: 'security',     label: 'Security',      icon: Shield,  permKey: 'settings_security'     },
  { id: 'integrations', label: 'Integrations',  icon: Zap,     permKey: 'settings_integrations' },
]

export default function AdminSettingsModal({ onClose }: Props) {
  const [activeTab,    setActiveTab]    = useState('brand')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [tabPerms,     setTabPerms]     = useState<Record<string, any>>({})
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    async function loadPerms() {
      try {
        const res  = await fetch('/api/admin/get-my-permissions')
        const data = await res.json()
        setIsSuperAdmin(data?.is_super_admin ?? false)
        setTabPerms(data?.tab_permissions ?? {})
      } catch {}
      setLoading(false)
    }
    loadPerms()
  }, [])

  function getAccess(permKey: string): 'none' | 'view' | 'full' {
    if (isSuperAdmin) return 'full'
    const perm = tabPerms[permKey]?.access
    if (perm === 'view') return 'view'
    if (perm === 'full') return 'full'
    if (!perm) return 'full'
    return 'none'
  }

  const hasAnyAccess = isSuperAdmin || ALL_TABS.some(t => getAccess(t.permKey) !== 'none')
  const TABS = loading ? [] : ALL_TABS.filter(t => getAccess(t.permKey) !== 'none')
  const currentAccess = getAccess(ALL_TABS.find(t => t.id === activeTab)?.permKey ?? '')
  const viewOnly = currentAccess === 'view'

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, backgroundColor:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:'100%', maxWidth:1200, height:'88vh', backgroundColor:C.surface, borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:`1px solid ${C.border}`, flexShrink:0, backgroundColor:C.bg }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Settings size={16} style={{ color:C.muted }}/>
            <span style={{ fontSize:15, fontWeight:700, color:C.text, fontFamily:'Inter, sans-serif' }}>Admin Settings</span>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, border:'none', background:C.border, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={14} style={{ color:C.muted }}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* Left sidebar */}
          {hasAnyAccess && !loading && (
            <div style={{ width:200, flexShrink:0, borderRight:`1px solid ${C.border}`, padding:'12px 8px', display:'flex', flexDirection:'column', gap:2, backgroundColor:C.bg, overflowY:'auto' }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id
                const vo       = getAccess(tab.permKey) === 'view'
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', width:'100%', backgroundColor:isActive ? C.surface : 'transparent', boxShadow:isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition:'all .15s' }}>
                    <tab.icon size={15} style={{ color:isActive ? C.dark : C.muted, flexShrink:0 }}/>
                    <span style={{ fontSize:13, fontWeight:isActive ? 700 : 500, color:isActive ? C.dark : C.muted, fontFamily:'Inter, sans-serif', flex:1 }}>{tab.label}</span>
                    {vo && <Eye size={11} style={{ color:C.muted }}/>}
                    {isActive && !vo && <div style={{ width:5, height:5, borderRadius:'50%', backgroundColor:C.lime, flexShrink:0 }}/>}
                  </button>
                )
              })}
            </div>
          )}

          {/* Right content */}
          <div style={{ flex:1, overflowY:'auto', position:'relative' }}>
            {loading ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:C.muted, fontSize:13 }}>Loading...</div>
            ) : !hasAnyAccess ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Lock size={22} style={{ color:C.muted }}/>
                </div>
                <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:0 }}>No access</p>
                <p style={{ fontSize:13, color:C.muted, margin:0, textAlign:'center', maxWidth:280 }}>You don't have permission to access Admin Settings. Contact your administrator.</p>
              </div>
            ) : (
              <>
                {viewOnly && (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'#eff6ff', borderBottom:'1px solid #bfdbfe', position:'sticky', top:0, zIndex:999 }}>
                      <Eye size={14} style={{ color:'#1d4ed8' }}/>
                      <p style={{ fontSize:12, fontWeight:600, color:'#1d4ed8', margin:0 }}>View only — you can browse but cannot make changes.</p>
                    </div>
                    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, zIndex:998, cursor:'default', background:'transparent' }}
                         onClick={e => e.preventDefault()}/>
                  </>
                )}
                {activeTab === 'brand'        && <BrandManagerTab/>}
                {activeTab === 'general'      && <AdminGeneralSettings/>}
                {activeTab === 'security'     && <AdminSecuritySettings/>}
                {activeTab === 'integrations' && <AdminIntegrationsSettings/>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}