'use client'
// components/admin/settings-tabs/TeamMemberModal.tsx
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { X, Check, RefreshCw, Shield, ChevronRight, ChevronDown } from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'
import { TAB_ACTIONS, ANALYTICS_TABS, ANALYTICS_TAB_ACTIONS, SETTINGS_TAB_ACTIONS } from '@/components/admin/settings-tabs/tabActions'

const C = {
  lime:        '#8fff00',
  limeDeep:    '#4a8f00',
  limeTint:    '#f4ffe6',
  dark:        '#1a2410',
  border:      '#e8ede2',
  muted:       '#8a9e78',
  bg:          '#f7f9f5',
  surface:     '#ffffff',
  text:        '#1a2410',
  red:         '#b91c1c',
  redBg:       '#fef2f2',
  redBorder:   '#fecaca',
  green:       '#15803d',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
}

// All admin sidebar tabs with their permission keys
const ALL_TABS = [
  { key: 'user_crm',        label: 'User CRM',          section: 'Admin Tools' },
  { key: 'role_builder',    label: 'Role Builder',       section: 'Admin Tools' },
  { key: 'security_logs',   label: 'Security Logs',      section: 'Admin Tools' },
  { key: 'promos',          label: 'Promos & Codes',     section: 'Admin Tools' },
  { key: 'kill_switches',   label: 'Kill Switches',      section: 'Admin Tools' },
  { key: 'plan_limits',     label: 'Plan Limits',        section: 'Admin Tools' },
  { key: 'emails',          label: 'Emails',             section: 'Admin Tools' },
  { key: 'webhooks',        label: 'Webhooks',           section: 'Admin Tools' },
  { key: 'gamification',    label: 'Gamification',       section: 'Admin Tools' },
  { key: 'api_vault',       label: 'API Vault',          section: 'Admin Tools' },
  { key: 'affiliate_vault', label: 'Affiliate Vault',    section: 'Admin Tools' },
  { key: 'founder_ops',     label: 'Founder Ops',        section: 'Admin Tools' },
  { key: 'marketing',       label: 'Marketing',          section: 'Admin Tools' },
  { key: 'payments',        label: 'Payments',           section: 'Admin Tools' },
  { key: 'tickets',         label: 'Tickets',            section: 'Admin Tools' },
  { key: 'blog',            label: 'Blog',               section: 'Content'  },
  { key: 'changelog',       label: 'Changelog',          section: 'Content'  },
  { key: 'careers',         label: 'Careers',            section: 'Content'  },
  { key: 'page_editor',     label: 'Page Editor',        section: 'Content'    },
  { key: 'api_fleet',       label: 'API Fleet',          section: 'Admin Tools'  },
  { key: 'feature_roadmap', label: 'Feature Roadmap',    section: 'Admin Tools'  },
  { key: 'vero_center',     label: 'VeRO Command Center',section: 'Admin Tools'  },
  { key: 'infra_monitor',   label: 'Infrastructure Monitor', section: 'Admin Tools' },
  { key: 'competitor_xray', label: 'Competitor X-Ray',   section: 'Admin Tools'  },
  { key: 'chrome_extension',label: 'Chrome Extension',   section: 'Admin Tools'  },
  { key: 'settings_brand',       label: 'Brand',         section: 'Admin Settings' },
  { key: 'settings_general',     label: 'General',       section: 'Admin Settings' },
  { key: 'settings_security',    label: 'Security',      section: 'Admin Settings' },
  { key: 'settings_integrations',label: 'Integrations',  section: 'Admin Settings' },
]

type AccessLevel = 'none' | 'view' | 'full'

interface TabPermission {
  access: AccessLevel
}

interface TeamMember {
  id:             string
  name:           string
  email:          string
  role:           string
  role_id:        string | null
  is_super_admin: boolean
  avatar_url:     string | null
  tab_permissions?: Record<string, { access: string }>
  section_permissions?: Record<string, boolean>
  sidebar_mode?: 'hide' | 'ghost'
}

interface Role {
  id:        string
  role_name: string
}

interface Props {
  member:  TeamMember
  roles:   Role[]
  members: TeamMember[]
  onClose: () => void
  onSaved: () => void
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button onClick={disabled ? undefined : onChange}
            style={{ width: 36, height: 20, borderRadius: 100, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative', background: checked ? C.lime : C.border, transition: 'background .2s', opacity: disabled ? 0.5 : 1, flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: checked ? C.dark : C.muted, transition: 'left .2s' }}/>
    </button>
  )
}

function AccessBadge({ level, onClick, disabled }: { level: AccessLevel; onClick: () => void; disabled?: boolean }) {
  const cfg = {
    none: { label: 'No access', color: C.muted,  bg: C.bg,      border: C.border      },
    view: { label: 'View only', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe'     },
    full: { label: 'Full access', color: C.green, bg: C.greenBg, border: C.greenBorder },
  }[level]
  return (
    <button onClick={disabled ? undefined : onClick}
            style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
      {cfg.label}
    </button>
  )
}

export default function TeamMemberModal({ member, roles, members, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving]             = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(member.is_super_admin)
  const [sidebarMode, setSidebarMode]   = useState<'hide' | 'ghost'>(member.sidebar_mode ?? 'hide')
  const [selectedRoleId, setSelectedRoleId] = useState(member.role_id ?? 'none')
  const [showDiff, setShowDiff]         = useState(false)
  const [initialPerms, setInitialPerms] = useState<Record<string, AccessLevel>>({})

  // Initialize tab perms — merge role perms + user overrides
  const initTabPerms = () => {
    const initial: Record<string, AccessLevel> = {}
    ALL_TABS.forEach(t => { initial[t.key] = 'none' })
    // Apply user's personal tab_permissions
    ALL_TABS.forEach(t => {
      const existing = (member.tab_permissions as any)?.[t.key]
      const access = existing?.access
      if (access === 'view' || access === 'full') initial[t.key] = access
    })
    return initial
  }

  const [tabPerms, setTabPerms]         = useState<Record<string, AccessLevel>>(initTabPerms)
  const [initialPermsSet, setInitialPermsSet] = useState(false)
  // Track initial perms for diff view
  useEffect(() => {
    if (!initialPermsSet) {
      setInitialPerms({ ...initTabPerms() })
      setInitialPermsSet(true)
    }
  }, [])
  const [toast, setToast]               = useState<string | null>(null)
  const [expandedTab, setExpandedTab]   = useState<string | null>(null)
  const [showCopyFrom, setShowCopyFrom] = useState(false)
  const [actionPerms, setActionPerms]   = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    ALL_TABS.forEach(tab => {
      const actions = TAB_ACTIONS[tab.key] ?? ANALYTICS_TAB_ACTIONS[tab.key] ?? SETTINGS_TAB_ACTIONS[tab.key] ?? []
      actions.forEach(action => {
        const key = `${tab.key}__${action.key}`
        const existing = (member.tab_permissions as any)?.[key]
        initial[key] = existing === true
      })
    })
    return initial
  })

  // Load role permissions and merge with user overrides
  useEffect(() => {
    async function loadRolePerms() {
      if (!member.role_id) return
      const { data } = await (supabase.from('admin_roles') as any)
        .select('permissions, section_permissions')
        .eq('id', member.role_id)
        .single()
      if (!data) return

      // Merge: role perms as base, user overrides on top
      setTabPerms(prev => {
        const merged: Record<string, AccessLevel> = { ...prev }
        // Apply role section_permissions as base
        const roleSection = data.section_permissions ?? {}
        ALL_TABS.forEach(t => {
          if (merged[t.key] === 'none' && roleSection[t.key] === true) {
            merged[t.key] = 'full' // role gives full by default
          }
        })
        // Apply role tab permissions (view/full)
        const rolePerms = data.permissions ?? {}
        ALL_TABS.forEach(t => {
          if (merged[t.key] === 'none' && rolePerms[t.key]) {
            merged[t.key] = rolePerms[t.key] as AccessLevel
          }
        })
        return merged
      })
    }
    loadRolePerms()
  }, [member.role_id])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  function cycleAccess(key: string) {
    const order: AccessLevel[] = ['none', 'view', 'full']
    setTabPerms(prev => {
      const current = prev[key] ?? 'none'
      const next = order[(order.indexOf(current) + 1) % order.length]
      return { ...prev, [key]: next }
    })
  }

  function setAll(level: AccessLevel) {
    const all: Record<string, AccessLevel> = {}
    ALL_TABS.forEach(t => { all[t.key] = level })
    setTabPerms(all)
  }

  async function save() {
    setSaving(true)
    try {
      // Build section_permissions for sidebar visibility
      const sectionPerms: Record<string, boolean> = {}
      ALL_TABS.forEach(t => {
        sectionPerms[t.key] = tabPerms[t.key] !== 'none'
      })

      // Build tab_permissions — store access level + action permissions
      const tabPermsFull: Record<string, any> = {}
      ALL_TABS.forEach(t => {
        // Store access level
        tabPermsFull[t.key] = { access: tabPerms[t.key] }
      })
      // Store individual action permissions flat
      Object.keys(actionPerms).forEach(key => {
        tabPermsFull[key] = actionPerms[key]
      })

      const res = await fetch('/api/admin/update-team-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:                     member.id,
          is_super_admin:         isSuperAdmin,
          role_id:                selectedRoleId === 'none' ? null : selectedRoleId,
          section_permissions:    sectionPerms,
          tab_permissions:        tabPermsFull,
          permissions_updated_at: new Date().toISOString(),
          sidebar_mode:           sidebarMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      setInitialPerms({ ...tabPerms })
      setShowDiff(false)
      const error = null

      if (error) throw error
      showToast('Permissions saved!')
      setTimeout(() => { onSaved(); onClose() }, 1000)
    } catch (e: any) { showToast(`Error: ${e.message}`) }
    setSaving(false)
  }

  const sections = [...new Set(ALL_TABS.map(t => t.section))]

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
         onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: C.dark, border: `1px solid ${C.lime}`, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={14} style={{ color: C.lime }}/><span style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>{toast}</span>
        </div>
      )}

      <div style={{ background: C.surface, borderRadius: 20, width: '100%', maxWidth: 900, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: C.lime }}>
              {initials(member.name || member.email)}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 900, color: C.text, margin: 0 }}>{member.name || 'No name'}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{member.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setAll('full')} style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.greenBorder}`, background: C.greenBg, color: C.green, cursor: 'pointer' }}>All full</button>
            <button onClick={() => setAll('view')} style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}>All view</button>
            <button onClick={() => setAll('none')} style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.muted, cursor: 'pointer' }}>Clear all</button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowCopyFrom(v => !v)} style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.muted, cursor: 'pointer' }}>Copy from...</button>
              {showCopyFrom && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 9999, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 220, overflow: 'hidden', maxHeight: 300, overflowY: 'auto' }}>
                  {/* Copy from Role */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '8px 12px 4px', margin: 0 }}>From role</p>
                  {roles.map(r => (
                    <button key={r.id} onClick={async () => {
                      const { data } = await (createClient().from('admin_roles') as any).select('permissions, section_permissions').eq('id', r.id).single()
                      if (data) {
                        const rolePerms = data.permissions ?? {}
                        const roleSection = data.section_permissions ?? {}
                        setTabPerms(prev => {
                          const merged = { ...prev }
                          ALL_TABS.forEach(t => {
                            if (roleSection[t.key] === true) merged[t.key] = 'full'
                            if (rolePerms[t.key]) merged[t.key] = rolePerms[t.key] as AccessLevel
                          })
                          return merged
                        })
                        showToast(`Copied from ${r.role_name}!`)
                      }
                      setShowCopyFrom(false)
                    }}
                    style={{ width: '100%', padding: '7px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: C.limeTint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: C.limeDeep }}>R</span>
                      </div>
                      {r.role_name}
                    </button>
                  ))}
                  {/* Copy from User */}
                  {members.filter(m => m.id !== member.id && m.tab_permissions).length > 0 && (
                    <>
                      <div style={{ height: 1, background: C.border, margin: '4px 0' }}/>
                      <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '4px 12px', margin: 0 }}>From team member</p>
                      {members.filter(m => m.id !== member.id && m.tab_permissions).map(m => (
                        <button key={m.id} onClick={() => {
                          const perms = m.tab_permissions as any
                          if (perms) {
                            setTabPerms(prev => {
                              const merged = { ...prev }
                              ALL_TABS.forEach(t => {
                                const access = perms[t.key]?.access
                                if (access === 'view' || access === 'full' || access === 'none') {
                                  merged[t.key] = access as AccessLevel
                                }
                              })
                              return merged
                            })
                            showToast(`Copied from ${m.name ?? m.email}!`)
                          }
                          setShowCopyFrom(false)
                        }}
                        style={{ width: '100%', padding: '7px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 900, color: C.lime }}>{(m.name ?? m.email ?? '?')[0].toUpperCase()}</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{m.name ?? m.email}</p>
                            {m.name && <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{m.email}</p>}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
              {showCopyFrom && <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setShowCopyFrom(false)}/>}
            </div>
            <button onClick={save} disabled={saving}
                    style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: saving ? C.border : C.lime, color: saving ? C.muted : C.dark, fontSize: 13, fontWeight: 900, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {saving ? <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }}/> Saving...</> : <><Check size={13}/> Save changes</>}
            </button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} style={{ color: C.muted }}/>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left panel — role & settings */}
          <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

            {/* Role */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 10px' }}>Role</p>
              <ProDropdown
                prefix=""
                currentValue={selectedRoleId}
                options={[
                  { val: 'none', label: 'No role', enabled: true },
                  ...roles.map(r => ({ val: r.id, label: r.role_name, enabled: true }))
                ]}
                onChanged={async (v) => {
                  setSelectedRoleId(v)
                  if (v === 'none') return
                  // Load new role permissions and merge
                  const { data } = await (supabase.from('admin_roles') as any)
                    .select('permissions, section_permissions')
                    .eq('id', v)
                    .single()
                  if (!data) return
                  setTabPerms(prev => {
                    const merged: Record<string, AccessLevel> = { ...prev }
                    const roleSection = data.section_permissions ?? {}
                    const rolePerms   = data.permissions ?? {}
                    ALL_TABS.forEach(t => {
                      if (roleSection[t.key] === true && merged[t.key] === 'none') merged[t.key] = 'full'
                      if (rolePerms[t.key] && merged[t.key] === 'none') merged[t.key] = rolePerms[t.key] as AccessLevel
                    })
                    return merged
                  })
                }}
                width="full"
                maxItems={6}
              />
            </div>

            {/* Super admin toggle */}
            <div style={{ background: C.bg, borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} style={{ color: C.limeDeep }}/>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Super Admin</p>
                </div>
                <Toggle checked={isSuperAdmin} onChange={() => setIsSuperAdmin(v => !v)}/>
              </div>
              <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.5 }}>Super admins bypass all permission checks and see everything.</p>
            </div>

            {/* Sidebar mode toggle */}
            {!isSuperAdmin && (
              <div style={{ background: C.bg, borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Ghost Mode</p>
                  <Toggle checked={sidebarMode === 'ghost'} onChange={() => setSidebarMode(v => v === 'ghost' ? 'hide' : 'ghost')}/>
                </div>
                <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.5 }}>No-access tabs show in the sidebar as locked, instead of being hidden.</p>
              </div>
            )}

            {/* Quick Presets */}
            {!isSuperAdmin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Quick presets</p>
                {[
                  { label: 'Support Agent', desc: 'Tickets + User CRM view', action: () => setTabPerms(prev => {
                    const next: Record<string, AccessLevel> = {}
                    ALL_TABS.forEach(t => { next[t.key] = 'none' })
                    next['tickets'] = 'full'; next['user_crm'] = 'view'
                    return next
                  })},
                  { label: 'Content Editor', desc: 'Blog + Changelog + Careers', action: () => setTabPerms(prev => {
                    const next: Record<string, AccessLevel> = {}
                    ALL_TABS.forEach(t => { next[t.key] = 'none' })
                    next['blog'] = 'full'; next['changelog'] = 'full'; next['careers'] = 'full'; next['page_editor'] = 'view'
                    return next
                  })},
                  { label: 'Analyst', desc: 'View only across all analytics', action: () => setTabPerms(prev => {
                    const next: Record<string, AccessLevel> = {}
                    ALL_TABS.forEach(t => { next[t.key] = t.section === 'Analytics' ? 'view' : 'none' })
                    next['payments'] = 'view'; next['marketing'] = 'view'
                    return next
                  })},
                  { label: 'Developer', desc: 'API Vault + Webhooks + Infra', action: () => setTabPerms(prev => {
                    const next: Record<string, AccessLevel> = {}
                    ALL_TABS.forEach(t => { next[t.key] = 'none' })
                    next['api_vault'] = 'full'; next['webhooks'] = 'full'; next['infra_monitor'] = 'view'; next['api_fleet'] = 'view'
                    return next
                  })},
                ].map(preset => (
                  <button key={preset.label} onClick={() => { preset.action(); showToast(`Applied ${preset.label} preset`) }}
                    style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', width: '100%' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: '0 0 1px' }}>{preset.label}</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{preset.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Legend</p>
              {[
                { level: 'none' as AccessLevel, desc: 'Tab hidden from sidebar' },
                { level: 'view' as AccessLevel, desc: 'Can see, cannot change' },
                { level: 'full' as AccessLevel, desc: 'Full access to tab' },
              ].map(l => (
                <div key={l.level} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AccessBadge level={l.level} onClick={() => {}} disabled/>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{l.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — tabs */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>
                Tab Permissions — click badge to cycle
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Last modified */}
                {(member as any).permissions_updated_at && (
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                    Updated {new Date((member as any).permissions_updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
                {/* Show diff button */}
                {Object.keys(initialPerms).length > 0 && (
                  <button onClick={() => setShowDiff(v => !v)}
                    style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: showDiff ? C.dark : C.bg, color: showDiff ? C.lime : C.muted, cursor: 'pointer' }}>
                    {showDiff ? 'Hide changes' : 'Show changes'}
                  </button>
                )}
              </div>
            </div>

            {/* Diff view */}
            {showDiff && (
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>Pending changes</p>
                {(() => {
                  const changes = ALL_TABS.filter(t => tabPerms[t.key] !== initialPerms[t.key])
                  if (changes.length === 0) return <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>No changes yet</p>
                  return changes.map(t => (
                    <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 12, color: C.text, margin: 0, flex: 1 }}>{t.label}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{initialPerms[t.key] ?? 'none'}</span>
                      <span style={{ fontSize: 10, color: C.muted }}>→</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tabPerms[t.key] === 'full' ? C.green : tabPerms[t.key] === 'view' ? '#1d4ed8' : C.red }}>
                        {tabPerms[t.key] ?? 'none'}
                      </span>
                    </div>
                  ))
                })()}
              </div>
            )}

            {sections.map(section => (
              <div key={section} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>{section}</p>
                  {!isSuperAdmin && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => {
                        setTabPerms(prev => {
                          const next = { ...prev }
                          ALL_TABS.filter(t => t.section === section).forEach(t => { next[t.key] = 'full' })
                          return next
                        })
                      }} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, border: `1px solid ${C.greenBorder}`, background: C.greenBg, color: C.green, cursor: 'pointer' }}>Full</button>
                      <button onClick={() => {
                        setTabPerms(prev => {
                          const next = { ...prev }
                          ALL_TABS.filter(t => t.section === section).forEach(t => { next[t.key] = 'view' })
                          return next
                        })
                      }} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}>View</button>
                      <button onClick={() => {
                        setTabPerms(prev => {
                          const next = { ...prev }
                          ALL_TABS.filter(t => t.section === section).forEach(t => { next[t.key] = 'none' })
                          return next
                        })
                      }} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.bg, color: C.muted, cursor: 'pointer' }}>None</button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {ALL_TABS.filter(t => t.section === section).map(tab => {
                    const level      = isSuperAdmin ? 'full' : (tabPerms[tab.key] ?? 'none')
                    const actions    = TAB_ACTIONS[tab.key] ?? ANALYTICS_TAB_ACTIONS[tab.key] ?? SETTINGS_TAB_ACTIONS[tab.key] ?? []
                    const isExpanded = expandedTab === tab.key
                    return (
                      <div key={tab.key}>
                        {/* Tab row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', padding: '8px 12px', borderRadius: isExpanded ? '8px 8px 0 0' : 8, background: level === 'full' ? C.greenBg : level === 'view' ? '#eff6ff' : 'transparent', gap: 10 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: 0 }}>{tab.label}</p>
                          <AccessBadge level={level} onClick={() => !isSuperAdmin && cycleAccess(tab.key)} disabled={isSuperAdmin}/>
                          {actions.length > 0 && (
                            <button onClick={() => setExpandedTab(isExpanded ? null : tab.key)}
                                    style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                    title="Manage granular permissions">
                              {isExpanded ? <ChevronDown size={12} style={{ color: C.muted }}/> : <ChevronRight size={12} style={{ color: C.muted }}/>}
                            </button>
                          )}
                        </div>

                        {/* Expanded actions */}
                        {isExpanded && actions.length > 0 && (
                          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: `1px solid ${C.border}`, marginBottom: 2 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Granular permissions</p>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => {
                                  const updates: Record<string, boolean> = {}
                                  actions.forEach(a => { updates[`${tab.key}__${a.key}`] = true })
                                  setActionPerms(prev => ({ ...prev, ...updates }))
                                  // Auto-set tab to full access
                                  setTabPerms(prev => ({ ...prev, [tab.key]: 'full' }))
                                }} style={{ fontSize: 10, fontWeight: 700, color: C.green, background: C.greenBg, border: `0.5px solid ${C.greenBorder}`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>
                                  All on
                                </button>
                                <button onClick={() => {
                                  const updates: Record<string, boolean> = {}
                                  actions.forEach(a => { updates[`${tab.key}__${a.key}`] = false })
                                  setActionPerms(prev => ({ ...prev, ...updates }))
                                  // Auto-set tab to no access
                                  setTabPerms(prev => ({ ...prev, [tab.key]: 'none' }))
                                }} style={{ fontSize: 10, fontWeight: 700, color: C.muted, background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>
                                  All off
                                </button>
                              </div>
                            </div>
                            {actions.map(action => {
                              const actionKey = `${tab.key}__${action.key}`
                              const enabled   = isSuperAdmin ? true : (actionPerms[actionKey] ?? false)
                              const riskColor = action.risk === 'high' ? C.red : action.risk === 'medium' ? '#b45309' : C.green
                              return (
                                <div key={action.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{action.label}</p>
                                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, color: riskColor, background: action.risk === 'high' ? C.redBg : action.risk === 'medium' ? '#fffbeb' : C.greenBg, border: `0.5px solid ${riskColor}20` }}>
                                        {action.risk}
                                      </span>
                                    </div>
                                    <p style={{ fontSize: 11, color: C.muted, margin: '1px 0 0' }}>{action.desc}</p>
                                  </div>
                                  <Toggle checked={enabled} onChange={() => {
                                    if (isSuperAdmin) return
                                    const newVal = !actionPerms[actionKey]
                                    setActionPerms(prev => ({ ...prev, [actionKey]: newVal }))
                                    // Auto-set tab to full access if any action is turned on
                                    if (newVal && tabPerms[tab.key] === 'none') {
                                      setTabPerms(prev => ({ ...prev, [tab.key]: 'full' }))
                                    }
                                  }} disabled={isSuperAdmin}/>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}