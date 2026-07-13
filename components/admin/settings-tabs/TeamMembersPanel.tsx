'use client'
// components/admin/settings-tabs/TeamMembersPanel.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { RefreshCw, UserPlus, Shield, ChevronRight } from 'lucide-react'
import TeamMemberModal from '@/components/admin/settings-tabs/TeamMemberModal'

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
  green:       '#15803d',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
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

export default function TeamMembersPanel() {
  const supabase = createClient()
  const [members, setMembers]     = useState<TeamMember[]>([])
  const [roles, setRoles]         = useState<Role[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<TeamMember | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const [{ data: admins }, { data: rolesList }] = await Promise.all([
      supabase.from('profiles').select('id, name, email, role, role_id, is_super_admin, avatar_url, tab_permissions, sidebar_mode').eq('role', 'admin').order('name'),
      (supabase.from('admin_roles') as any).select('id, role_name').order('role_name'),
    ])
    setMembers((admins ?? []) as TeamMember[])
    setRoles(rolesList ?? [])
    if (!silent) setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  function getRoleName(member: TeamMember) {
    if (member.is_super_admin) return 'Super Admin'
    if (!member.role_id) return '—'
    return roles.find(r => r.id === member.role_id)?.role_name ?? '—'
  }

  function getAccessSummary(member: TeamMember) {
    if (member.is_super_admin) return { text: 'All tabs', color: '#4a8f00', bg: '#f4ffe6', border: '#8fff00' }
    if (!member.tab_permissions) return { text: 'Not configured', color: '#8a9e78', bg: '#f7f9f5', border: '#e8ede2' }
    const full = Object.entries(member.tab_permissions).filter(([k, v]: any) => !k.includes('__') && v?.access === 'full').length
    const view = Object.entries(member.tab_permissions).filter(([k, v]: any) => !k.includes('__') && v?.access === 'view').length
    if (full === 0 && view === 0) return { text: 'No access', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' }
    const parts = []
    if (full > 0) parts.push(`${full} full`)
    if (view > 0) parts.push(`${view} view only`)
    return { text: parts.join(' · '), color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' }
  }

  function initials(name: string, email: string) {
    const n = name || email || 'U'
    return n.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: '0 0 2px' }}>Team Members</h2>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{members.length} admin{members.length !== 1 ? 's' : ''} · click a row to manage permissions</p>
          </div>
          <button onClick={() => load()} style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <RefreshCw size={20} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/>
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <UserPlus size={28} style={{ color: C.muted, marginBottom: 10 }}/>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>No team members yet</p>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Admin users will appear here</p>
          </div>
        ) : (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                  {['Member', 'Role', 'Access', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member, idx) => (
                  <tr key={member.id}
                      onClick={() => setSelected(member)}
                      style={{ borderBottom: idx < members.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer', transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.limeTint}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: C.lime, flexShrink: 0 }}>
                          {initials(member.name, member.email)}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{member.name || '—'}</p>
                          <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                      {member.is_super_admin ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: C.limeDeep, background: C.limeTint, border: `1px solid ${C.lime}`, borderRadius: 100, padding: '2px 8px', width: 'fit-content' }}>
                          <Shield size={10}/> Super Admin
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: C.text }}>{getRoleName(member)}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {(() => {
                        const s = getAccessSummary(member)
                        return (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, color: s.color, background: s.bg, border: `0.5px solid ${s.border}` }}>
                            {s.text}
                          </span>
                        )
                      })()}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenBg, border: `0.5px solid ${C.greenBorder}`, borderRadius: 100, padding: '2px 8px' }}>
                        Active
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <ChevronRight size={16} style={{ color: C.muted }}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <TeamMemberModal
          member={selected}
          roles={roles}
          members={members}
          onClose={() => setSelected(null)}
          onSaved={() => load(true)}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}