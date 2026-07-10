'use client'
// components/admin/AdminSettingsModal.tsx
import React, { useState } from 'react'
import { X, Palette, Settings, Shield, Zap, Globe, Lock, ChevronRight, RefreshCw } from 'lucide-react'
import BrandManagerTab           from '@/components/admin/settings-tabs/BrandManagerTab'
import AdminGeneralSettings      from '@/components/admin/settings/AdminGeneralSettings'
import AdminSecuritySettings     from '@/components/admin/settings/AdminSecuritySettings'
import AdminIntegrationsSettings from '@/components/admin/settings/AdminIntegrationsSettings'
import PermissionBuilderTab, { PermissionRole } from '@/components/admin/settings-tabs/PermissionBuilderTab'
import { createClient }          from '@/lib/supabase'

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
  { id: 'brand',        label: 'Brand',        icon: Palette },
  { id: 'general',      label: 'General',       icon: Globe   },
  { id: 'security',     label: 'Security',      icon: Shield  },
  { id: 'integrations', label: 'Integrations',  icon: Zap     },
  { id: 'permissions',  label: 'Permissions',   icon: Lock    },
]

export default function AdminSettingsModal({ onClose }: Props) {
  const supabase = createClient()
  const [activeTab, setActiveTab]           = useState('brand')
  const [permOpen, setPermOpen]             = useState(false)
  const [roles, setRoles]                   = useState<PermissionRole[]>([])
  const [selectedRole, setSelectedRole]     = useState<PermissionRole | null>(null)
  const [loadingRoles, setLoadingRoles]     = useState(false)
  const [members, setMembers]               = useState<{ id: string; role_id: string | null }[]>([])

  async function loadRoles() {
    setLoadingRoles(true)
    const [{ data: rolesData }, { data: membersData }] = await Promise.all([
      (supabase.from('admin_roles') as any)
        .select('id, role_name, is_system_role, permissions, action_permissions, section_permissions, data_permissions, access_restrictions')
        .order('is_system_role', { ascending: false }),
      supabase.from('profiles').select('id, role_id').not('role_id', 'is', null),
    ])
    setRoles(rolesData ?? [])
    setMembers((membersData ?? []) as any)
    setLoadingRoles(false)
  }

  function handleTabClick(tabId: string) {
    if (tabId === 'permissions') {
      const newOpen = !permOpen
      setPermOpen(newOpen)
      setActiveTab('permissions')
      if (newOpen && roles.length === 0) loadRoles()
      if (!newOpen) setSelectedRole(null)
    } else {
      setActiveTab(tabId)
      setPermOpen(false)
      setSelectedRole(null)
    }
  }

  function renderContent() {
    switch (activeTab) {
      case 'brand':        return <BrandManagerTab/>
      case 'general':      return <AdminGeneralSettings/>
      case 'security':     return <AdminSecuritySettings/>
      case 'integrations': return <AdminIntegrationsSettings/>
      case 'permissions':  return <PermissionBuilderTab selectedRole={selectedRole}/>
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
              const isPerms  = tab.id === 'permissions'
              return (
                <div key={tab.id}>
                  <button onClick={() => handleTabClick(tab.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', backgroundColor: isActive && !isPerms ? C.surface : 'transparent', boxShadow: isActive && !isPerms ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}>
                    <tab.icon size={15} style={{ color: isActive ? C.dark : C.muted, flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.dark : C.muted, fontFamily: 'Inter, sans-serif', flex: 1 }}>{tab.label}</span>
                    {isPerms && <ChevronRight size={13} style={{ color: C.muted, transform: permOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}/>}
                    {isActive && !isPerms && <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.lime, flexShrink: 0 }}/>}
                  </button>

                  {/* Role sub-items */}
                  {isPerms && permOpen && (
                    <div style={{ marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
                      {loadingRoles ? (
                        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <RefreshCw size={12} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/>
                          <span style={{ fontSize: 12, color: C.muted }}>Loading...</span>
                        </div>
                      ) : roles.map(role => {
                        const isRoleSel  = selectedRole?.id === role.id
                        const memberCount = members.filter(m => m.role_id === role.id).length
                        return (
                          <button key={role.id} onClick={() => setSelectedRole(role)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', backgroundColor: isRoleSel ? C.surface : 'transparent', transition: 'all .15s' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isRoleSel ? C.lime : C.border, flexShrink: 0 }}/>
                            <span style={{ fontSize: 12, fontWeight: isRoleSel ? 700 : 400, color: isRoleSel ? C.dark : C.muted, fontFamily: 'Inter, sans-serif', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {role.role_name}
                            </span>
                            {memberCount > 0 && (
                              <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{memberCount}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {renderContent()}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}