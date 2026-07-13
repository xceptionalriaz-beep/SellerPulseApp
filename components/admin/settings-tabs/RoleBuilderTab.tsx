'use client'
// components/admin/settings-tabs/RoleBuilderTab.tsx
import TeamMembersPanel from '@/components/admin/settings-tabs/TeamMembersPanel'
// --------------------------------------------------------------
// RIAZIFY — Role Builder Tab
// Split-view RBAC management with permission matrix,
// hard deletion blocks, team seat assignments,
// and real-time session freshness enforcement.
// --------------------------------------------------------------

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Shield, Lock, Plus, Trash2, Check, X, Users, AlertTriangle,
  CheckCircle, RefreshCw, Activity, ChevronDown, UserPlus, Mail,
  Settings, Key, BarChart2, Zap, Eye, Edit3, Save, Clock, Search,
} from 'lucide-react'

// -- Brand tokens -----------------------------------------------
const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  red:      '#b91c1c',
  amber:    '#d97706',
  green:    '#16a34a',
}

// -- Permission scope definitions -------------------------------
type AdminScope =
  | 'crm:read'
  | 'crm:write_notes'
  | 'crm:edit_tiers'
  | 'crm:danger_zone'
  | 'infra:selectors'
  | 'infra:kill_switch'
  | 'infra:ota_update'
  | 'finance:view_mrr'

interface ScopeDef {
  key:         AdminScope
  label:       string
  description: string
  category:    'crm' | 'infra' | 'finance'
  danger?:     boolean
}

const SCOPE_DEFS: ScopeDef[] = [
  // CRM
  { key: 'crm:read',        label: 'CRM Read',         description: 'View user accounts, metrics and telemetry',           category: 'crm'     },
  { key: 'crm:write_notes', label: 'Write Notes',       description: 'Write notes and entries to support / dispute logs',   category: 'crm'     },
  { key: 'crm:edit_tiers',  label: 'Edit Billing',      description: 'Manually alter subscription tiers and billing status', category: 'crm'     },
  { key: 'crm:danger_zone', label: 'Danger Zone',       description: 'Force logouts and permanently delete user accounts',   category: 'crm',     danger: true },
  // Infrastructure
  { key: 'infra:selectors',   label: 'Selector Overrides', description: 'Edit and save live HTML selector overrides',      category: 'infra'   },
  { key: 'infra:kill_switch', label: 'Kill Switches',      description: 'Flip global system emergency bypass toggles',     category: 'infra',   danger: true },
  { key: 'infra:ota_update',  label: 'OTA Updates',        description: 'Package and deploy over-the-air firmware updates', category: 'infra'   },
  // Finance
  { key: 'finance:view_mrr',  label: 'View Financials',    description: 'Read MRR, LTV maps and Founder Ops metrics',      category: 'finance' },
]

const SCOPE_CATEGORIES = [
  { key: 'crm',     label: 'USER CRM PERMISSIONS',          Icon: Users   },
  { key: 'infra',   label: 'INFRASTRUCTURE CONFIGURATION',  Icon: Settings },
  { key: 'finance', label: 'SYSTEM ANALYTICS',              Icon: BarChart2 },
] as const

// -- Role type --------------------------------------------------
interface AdminRole {
  id:             string
  role_name:      string
  description:    string
  scopes:         AdminScope[]
  is_system_role: boolean
  updated_at:     string
  created_at:     string
  member_count?:  number
}

// -- Profile type (for team seats) -----------------------------
interface TeamMember {
  id:             string
  name:           string | null
  email:          string
  avatar_url:     string | null
  role_id:        string | null
  last_seen:      string | null
  role_name?:     string | null
  created_at?:    string | null
  activityCount?: number
}

// -- Toast ------------------------------------------------------
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark,   border: C.lime,   text: C.lime, Icon: CheckCircle  },
    error:   { bg: '#FEF2F2', border: '#FECACA', text: C.red,  Icon: AlertTriangle },
    info:    { bg: C.bg,     border: C.border, text: C.text, Icon: Shield       },
  }
  const { bg, border, text, Icon } = map[type]
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
         style={{ backgroundColor: bg, border: `1px solid ${border}`, color: text }}>
      <Icon size={15} />
      <p className="text-[13px] font-bold">{msg}</p>
    </div>
  )
}

// -- Avatar initials --------------------------------------------
function Avatar({ name, email, size = 32, avatarUrl }: {
  name: string | null; email: string; size?: number; avatarUrl?: string | null
}) {
  // Bulletproof initials — never fails
  function getInitials(): string {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(/\s+/).filter(p => p.length > 0)
      if (parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
      }
      if (parts.length >= 1 && parts[0].length > 0) {
        return parts[0].slice(0, 2).toUpperCase()
      }
    }
    // Fallback to email first character
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const display = name ?? email ?? 'U'
  const initials = getInitials()
  const colors   = ['#4a8f00','#1d70f5','#d97706','#8b5cf6','#e11d48','#0891b2']
  let h = 0; for (const c of display) h = c.charCodeAt(0) + ((h << 5) - h)
  const bg = colors[Math.abs(h) % colors.length]

  if (avatarUrl) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: bg }}>
        <img src={avatarUrl} alt={display} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      </div>
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: '#fff', fontSize: size * 0.35, fontWeight: 800 }}>{initials}</span>
    </div>
  )
}

// -- Time ago ---------------------------------------------------
function timeAgo(iso: string | null) {
  if (!iso) return 'Never'
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1)    return 'Just now'
  if (m < 60)   return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

// --------------------------------------------------------------
// HUD CARDS
// --------------------------------------------------------------
function HudDeck({ roles, members, adminActionsToday }: {
  roles:             AdminRole[]
  members:           TeamMember[]
  adminActionsToday: number
}) {
  const customRoles  = roles.filter(r => !r.is_system_role)
  const systemRoles  = roles.filter(r => r.is_system_role)
  const activeSeats  = members.length

  // Security status: AUDIT REQUIRED if any member has no role assigned
  const orphanedMembers = members.filter(m => !m.role_id).length
  const isSecure        = orphanedMembers === 0

  function HudCard({ title, value, sub, children }: {
    title: string; value: string; sub: string; children: React.ReactNode
  }) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl border"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="shrink-0">{children}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold truncate mb-1" style={{ color: C.muted }}>{title}</p>
          <p className="text-[14px] font-black truncate" style={{ color: C.text }}>{value}</p>
          <p className="text-[10px] font-semibold truncate mt-0.5" style={{ color: C.muted }}>{sub}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <HudCard
        title="Active Team Seats"
        value={`${activeSeats} Member${activeSeats !== 1 ? 's' : ''}`}
        sub="Excluding founder account">
        <div className="w-11 h-11 rounded-full flex items-center justify-center"
             style={{ backgroundColor: activeSeats > 0 ? 'rgba(143,255,0,0.12)' : C.bg }}>
          <Users size={20} style={{ color: activeSeats > 0 ? C.limeDeep : C.muted }} />
        </div>
      </HudCard>

      <HudCard
        title="Custom Role Profiles"
        value={`${customRoles.length} Unique Role${customRoles.length !== 1 ? 's' : ''}`}
        sub={`${systemRoles.length} system · ${customRoles.length} custom`}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center"
             style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}>
          <Shield size={20} style={{ color: '#8b5cf6' }} />
        </div>
      </HudCard>

      <HudCard
        title="Security Policy Status"
        value={isSecure ? 'SECURE' : 'AUDIT REQUIRED'}
        sub={isSecure ? 'All seats have roles assigned' : `${orphanedMembers} unassigned seat${orphanedMembers !== 1 ? 's' : ''}`}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center"
             style={{ backgroundColor: isSecure ? 'rgba(22,163,74,0.08)' : 'rgba(185,28,28,0.08)' }}>
          {isSecure
            ? <CheckCircle size={20} style={{ color: C.green }} />
            : <AlertTriangle size={20} style={{ color: C.red }} />}
        </div>
      </HudCard>

      <HudCard
        title="Daily Admin Actions"
        value={`${adminActionsToday} Action${adminActionsToday !== 1 ? 's' : ''}`}
        sub="Across all team members today">
        <div className="w-11 h-11 rounded-full flex items-center justify-center"
             style={{ backgroundColor: 'rgba(217,119,6,0.08)' }}>
          <Activity size={20} style={{ color: C.amber }} />
        </div>
      </HudCard>
    </div>
  )
}

// --------------------------------------------------------------
// DELETE CONFIRM MODAL — Hard block if users assigned
// --------------------------------------------------------------
function DeleteRoleModal({ role, allRoles, blockedByMembers, onClose, onDeleted, onMembersReassigned, showToast }: {
  role:                 AdminRole
  allRoles:             AdminRole[]
  blockedByMembers:     TeamMember[]
  onClose:              () => void
  onDeleted:            () => void
  onMembersReassigned:  (updates: { userId: string; roleId: string }[]) => void
  showToast:            (msg: string, type: 'success' | 'error' | 'info') => void
}) {
  const supabase      = createClient()
  const isBlocked     = blockedByMembers.length > 0
  const otherRoles    = allRoles.filter(r => r.id !== role.id && !r.is_system_role)
  const [reassignMap,    setReassignMap]    = useState<Record<string, string>>({})
  const [deleting,       setDeleting]       = useState(false)
  const [reassigning,    setReassigning]    = useState(false)
  const [reassignedDone, setReassignedDone] = useState(false)

  // All blocked members must be reassigned before delete unlocks
  const allReassigned = blockedByMembers.every(m => !!reassignMap[m.id])
  // Delete is only allowed if no members blocked OR reassignment confirmed
  const canDelete = !isBlocked || reassignedDone

  async function handleReassignAll() {
    if (!allReassigned) return
    setReassigning(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      for (const member of blockedByMembers) {
        const newRoleId = reassignMap[member.id]
        const res = await fetch('/api/admin/roles/assign', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body:    JSON.stringify({ userId: member.id, roleId: newRoleId }),
        })
        if (!res.ok) {
          showToast('Failed to reassign some members', 'error')
          setReassigning(false)
          return
        }
      }
      setReassignedDone(true)
      onMembersReassigned(
        blockedByMembers.map(m => ({ userId: m.id, roleId: reassignMap[m.id] }))
      )
      showToast('All members reassigned — you can now delete the role', 'success')
    } catch {
      showToast('Failed to reassign some members', 'error')
    }
    setReassigning(false)
  }

  async function handleDelete() {
    if (!canDelete) return
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/roles/delete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ roleId: role.id }),
      })
      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Delete failed', 'error'); setDeleting(false); return }
      showToast(`Role "${role.role_name}" deleted`, 'success')
      onDeleted()
    } catch {
      showToast('Network error', 'error')
    }
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: 'rgba(185,28,28,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
              <Trash2 size={18} style={{ color: C.red }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: C.dark }}>Delete Role</p>
              <p className="text-[11px]" style={{ color: C.muted }}>"{role.role_name}"</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>

          {/* Hard block warning */}
          {isBlocked && (
            <div className="flex flex-col gap-3 px-4 py-3 rounded-xl border"
                 style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.3)' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} style={{ color: C.red }} />
                <p className="text-[13px] font-black" style={{ color: C.red }}>
                  {blockedByMembers.length} member{blockedByMembers.length !== 1 ? 's' : ''} must be reassigned first
                </p>
              </div>
              <p className="text-[11px]" style={{ color: C.muted }}>
                This role cannot be deleted while team members are assigned to it.
                Reassign each member to a different role to unlock deletion.
              </p>

              {/* Reassign list */}
              <div className="flex flex-col gap-2 mt-1">
                {blockedByMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border"
                       style={{ borderColor: C.border, backgroundColor: C.bg }}>
                    <Avatar name={member.name} email={member.email} size={28} avatarUrl={member.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate" style={{ color: C.dark }}>
                        {member.name ?? member.email.split('@')[0]}
                      </p>
                      <p className="text-[9px] truncate" style={{ color: C.muted }}>{member.email}</p>
                    </div>
                    <select
                      value={reassignMap[member.id] ?? ''}
                      onChange={e => setReassignMap(prev => ({ ...prev, [member.id]: e.target.value }))}
                      className="h-7 px-2 rounded-lg border text-[11px] outline-none"
                      style={{ borderColor: reassignMap[member.id] ? C.lime : C.border, backgroundColor: C.surface, color: C.text, minWidth: 120 }}>
                      <option value="">Reassign to...</option>
                      {otherRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.role_name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Reassign all button */}
              {allReassigned && (
                <button
                  onClick={handleReassignAll}
                  disabled={reassigning}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  {reassigning
                    ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} /> Reassigning...</>
                    : <><Check size={13} /> Confirm Reassignments</>}
                </button>
              )}
            </div>
          )}

          {/* Safe to delete */}
          {!isBlocked && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border"
                 style={{ backgroundColor: 'rgba(22,163,74,0.06)', borderColor: 'rgba(22,163,74,0.3)' }}>
              <CheckCircle size={15} style={{ color: C.green }} />
              <p className="text-[12px] font-semibold" style={{ color: C.green }}>
                No members assigned — safe to delete.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted, backgroundColor: '#fff' }}>
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ backgroundColor: canDelete ? C.red : C.border, color: '#fff' }}>
            {deleting
              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
              : <><Trash2 size={13} /> Delete Role</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// PERMISSION MATRIX — Right panel editor
// --------------------------------------------------------------
function PermissionMatrix({ role, allRoles, allMembers, onSaved, onDeleted, onMembersReassigned, showToast, isCreating, canEdit = true, canDelete = true }: {
  role:                 AdminRole | null
  allRoles:             AdminRole[]
  allMembers:           TeamMember[]
  onSaved:              (updated: AdminRole) => void
  onDeleted:            () => void
  onMembersReassigned:  (userId: string, roleId: string) => void
  showToast:            (msg: string, type: 'success' | 'error' | 'info') => void
  isCreating:           boolean
  canEdit?:             boolean
  canDelete?:           boolean
}) {
  const supabase = createClient()

  const [name,        setName]        = useState(role?.role_name    ?? '')
  const [description, setDescription] = useState(role?.description  ?? '')
  const [scopes,      setScopes]      = useState<Set<AdminScope>>(new Set(role?.scopes ?? []))
  const [saving,      setSaving]      = useState(false)
  const [showDelete,  setShowDelete]  = useState(false)

  // Track dirty state — has anything changed from original?
  const originalScopes = useMemo(() => new Set(role?.scopes ?? []), [role?.id, role?.updated_at])
  const isDirty = isCreating
    ? name.trim().length > 0
    : name !== role?.role_name ||
      description !== role?.description ||
      scopes.size !== originalScopes.size ||
      [...scopes].some(s => !originalScopes.has(s))

  // Reset when role changes
  useEffect(() => {
    setName(role?.role_name   ?? '')
    setDescription(role?.description ?? '')
    setScopes(new Set(role?.scopes ?? []))
  }, [role?.id, role?.updated_at, isCreating])

  const isSystem   = role?.is_system_role ?? false
    const isReadOnly = !canEdit

  function toggleScope(scope: AdminScope) {
    if (isReadOnly) return
    setScopes(prev => {
      const next = new Set(prev)
      next.has(scope) ? next.delete(scope) : next.add(scope)
      return next
    })
  }

  async function handleSave() {
    if (!isDirty || saving) return
    if (name.trim().length < 2) { showToast('Role name must be at least 2 characters', 'error'); return }
    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const endpoint = isCreating ? '/api/admin/roles/create' : '/api/admin/roles/update'
      const body     = isCreating
        ? { roleName: name.trim(), description: description.trim(), scopes: [...scopes] }
        : { roleId: role!.id, roleName: name.trim(), description: description.trim(), scopes: [...scopes] }

      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Save failed', 'error'); return }

      // Cast scopes back to AdminScope[] — API returns raw strings from Supabase
      const savedRole: AdminRole = {
        ...json.role,
        scopes: (json.role.scopes ?? []) as AdminScope[],
      }

      showToast(isCreating ? `Role "${name.trim()}" created` : `Role "${name.trim()}" updated`, 'success')
      onSaved(savedRole)
    } catch {
      showToast('Network error', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Members assigned to this role (for delete block check)
  const assignedMembers = allMembers.filter(m => m.role_id === role?.id)

  if (!role && !isCreating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl border"
           style={{ backgroundColor: C.surface, borderColor: C.border, minHeight: 400 }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.bg }}>
          <Shield size={24} style={{ color: C.muted }} />
        </div>
        <p className="text-[14px] font-bold" style={{ color: C.text }}>Select a role to edit</p>
        <p className="text-[12px]" style={{ color: C.muted }}>Or create a new custom role</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 flex flex-col rounded-2xl border overflow-hidden"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: isSystem ? 'rgba(139,92,246,0.1)' : 'rgba(143,255,0,0.12)' }}>
              {isSystem
                ? <Lock size={16} style={{ color: '#8b5cf6' }} />
                : <Edit3 size={16} style={{ color: C.limeDeep }} />}
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: C.dark }}>
                {isCreating ? 'New Custom Role' : isSystem ? 'System Role (Read-only)' : 'Edit Role'}
              </p>
              {!isCreating && role && (
                <p className="text-[10px]" style={{ color: C.muted }}>
                  {assignedMembers.length} member{assignedMembers.length !== 1 ? 's' : ''} assigned · Updated {timeAgo(role.updated_at)}
                </p>
              )}
            </div>
          </div>

          {/* Delete button — only for non-system roles */}
          {!isSystem && !isCreating && role && (
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold hover:opacity-80"
              style={{ borderColor: 'rgba(185,28,28,0.3)', color: C.red, backgroundColor: 'rgba(185,28,28,0.06)' }}>
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5" style={{ maxHeight: 520 }}>

          {/* Name + Description */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>ROLE NAME</p>
              <input
                value={name}
                onChange={e => !isReadOnly && setName(e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. Operations Manager"
                className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                style={{
                  borderColor:     isReadOnly ? C.border : name.length > 1 ? C.lime : C.border,
                  backgroundColor: isReadOnly ? C.bg     : C.surface,
                  color:           C.text,
                  cursor:          isReadOnly ? 'not-allowed' : 'text',
                }} />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>DESCRIPTION</p>
              <input
                value={description}
                onChange={e => !isReadOnly && setDescription(e.target.value)}
                disabled={isReadOnly}
                placeholder="Brief description of this role's responsibilities"
                className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                style={{
                  borderColor:     isReadOnly ? C.border : C.border,
                  backgroundColor: isReadOnly ? C.bg     : C.surface,
                  color:           C.text,
                  cursor:          isReadOnly ? 'not-allowed' : 'text',
                }} />
            </div>
          </div>

          {/* Permission matrix grouped by category */}
          {SCOPE_CATEGORIES.map(cat => {
            const catScopes = SCOPE_DEFS.filter(s => s.category === cat.key)
            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-2">
                  <cat.Icon size={12} style={{ color: C.limeDeep }} />
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.limeDeep }}>{cat.label}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {catScopes.map(scope => {
                    const isActive  = scopes.has(scope.key)
                    // Dirty check — was this scope different from original?
                    const wasDirty  = !isCreating && (isActive !== originalScopes.has(scope.key))
                    return (
                      <div
                        key={scope.key}
                        onClick={() => toggleScope(scope.key)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all"
                        style={{
                          borderColor:     wasDirty ? C.amber : isActive ? (isReadOnly ? C.border : C.lime) : C.border,
                          backgroundColor: wasDirty ? 'rgba(217,119,6,0.04)' : isActive ? (isReadOnly ? C.bg : C.limeTint) : C.bg,
                          cursor:          isReadOnly ? 'default' : 'pointer',
                          borderLeft:      wasDirty ? `3px solid ${C.amber}` : isActive ? `3px solid ${C.lime}` : `3px solid transparent`,
                        }}>
                        {/* Checkbox */}
                        <div className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0"
                             style={{
                               backgroundColor: isActive ? (isReadOnly ? '#8b5cf6' : C.dark) : 'transparent',
                               borderColor:     isActive ? (isReadOnly ? '#8b5cf6' : C.dark) : C.border,
                             }}>
                          {isActive && <Check size={9} style={{ color: isReadOnly ? '#fff' : C.lime }} />}
                        </div>

                        {/* Label */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold" style={{ color: isActive ? '#1a2410' : C.muted }}>
                              {scope.key}
                            </span>
                            {scope.danger && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>
                                DANGER
                              </span>
                            )}
                            {wasDirty && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: 'rgba(217,119,6,0.12)', color: C.amber }}>
                                CHANGED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] truncate mt-0.5" style={{ color: C.muted }}>
                            {scope.label} — {scope.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Save footer */}
        {!isReadOnly && (
          <div className="px-5 py-4 border-t flex items-center justify-between"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[11px]" style={{ color: isDirty ? C.amber : C.muted }}>
              {isDirty ? 'Unsaved changes' : 'No changes'}
            </p>
            {canEdit && <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40 transition-all"
              style={{
                backgroundColor: isDirty ? C.lime : C.border,
                color:           isDirty ? C.dark : C.muted,
              }}>
              {saving
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
                : <><Save size={14} /> {isCreating ? 'Create Role' : 'Save Changes'}</>}
            </button>}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {showDelete && role && (
        <DeleteRoleModal
          role={role}
          allRoles={allRoles}
          blockedByMembers={assignedMembers}
          onClose={() => setShowDelete(false)}
          onDeleted={() => { setShowDelete(false); onDeleted() }}
          onMembersReassigned={updates => {
            updates.forEach(u => onMembersReassigned(u.userId, u.roleId))
          }}
          showToast={showToast}
        />
      )}
    </>
  )
}

// --------------------------------------------------------------
// ROLE LIST — Left panel
// --------------------------------------------------------------
function RoleList({ roles, allMembers, selectedId, onSelect, onCreateNew, canCreate = true }: {
  roles:       AdminRole[]
  allMembers:  TeamMember[]
  selectedId:  string | null
  onSelect:    (role: AdminRole) => void
  onCreateNew: () => void
  canCreate?:  boolean
}) {
  function memberCount(roleId: string) {
    return allMembers.filter(m => m.role_id === roleId).length
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Role cards */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {roles.map(role => {
          const isSelected = selectedId === role.id
          const count      = memberCount(role.id)
          return (
            <button
              key={role.id}
              onClick={() => onSelect(role)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all hover:opacity-90"
              style={{
                backgroundColor: isSelected ? C.dark     : C.surface,
                borderColor:     isSelected ? C.dark     : C.border,
              }}>
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor: isSelected ? 'rgba(143,255,0,0.15)' : role.is_system_role ? 'rgba(139,92,246,0.1)' : 'rgba(143,255,0,0.08)' }}>
                {role.is_system_role
                  ? <Lock size={15} style={{ color: isSelected ? C.lime : '#8b5cf6' }} />
                  : <Shield size={15} style={{ color: isSelected ? C.lime : C.limeDeep }} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold truncate" style={{ color: isSelected ? '#fff' : C.dark }}>
                    {role.role_name}
                  </p>
                  {role.is_system_role && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded shrink-0"
                          style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(139,92,246,0.1)', color: isSelected ? '#fff' : '#8b5cf6' }}>
                      SYSTEM
                    </span>
                  )}
                </div>
                <p className="text-[10px] truncate mt-0.5" style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : C.muted }}>
                  {role.scopes.length} scope{role.scopes.length !== 1 ? 's' : ''} · {count} member{count !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Arrow indicator */}
              {isSelected && (
                <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: C.lime }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Create new role button */}
      {canCreate && <button
        onClick={onCreateNew}
        className="flex items-center justify-center gap-2 py-3 rounded-2xl border text-[13px] font-bold transition-all hover:opacity-80"
        style={{
          borderColor:     selectedId === '__new__' ? C.dark        : C.lime,
          borderStyle:     selectedId === '__new__' ? 'solid'       : 'dashed',
          backgroundColor: selectedId === '__new__' ? C.dark        : C.limeTint,
          color:           selectedId === '__new__' ? C.lime        : C.limeDeep,
        }}>
        <Plus size={15} />
        {selectedId === '__new__' ? 'Creating New Role...' : 'Create Custom Role'}
      </button>}
    </div>
  )
}

function RoleDropdown({ value, roles, onChange, disabled = false }: {
    value:    string | null
    roles:    AdminRole[]
    onChange: (roleId: string | null) => void
    disabled?: boolean
  }) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selected = roles.find(r => r.id === value)

  function openMenu() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const menuHeight = (roles.length + 1) * 44
    // Open upward if not enough space below
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      setMenuStyle({
        position: 'fixed',
        bottom:   window.innerHeight - rect.top + 4,
        left:     rect.left,
        width:    rect.width,
        zIndex:   9999,
      })
    } else {
      setMenuStyle({
        position: 'fixed',
        top:      rect.bottom + 4,
        left:     rect.left,
        width:    rect.width,
        zIndex:   9999,
      })
    }
    setOpen(true)
  }

  return (
    <div className="relative">
        <button
          ref={triggerRef}
          disabled={disabled}
          onClick={() => !disabled && (open ? setOpen(false) : openMenu())}
          className="w-full flex items-center justify-between h-8 px-3 rounded-xl border text-[11px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            backgroundColor: C.surface,
            borderColor:     open ? C.lime : C.border,
            color:           C.text,
          }}>
        <span style={{ color: selected ? C.text : C.muted }}>
          {selected ? selected.role_name : 'No role'}
        </span>
        <ChevronDown size={13}
          style={{
            color:      C.muted,
            transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="rounded-2xl border overflow-hidden"
               style={{
                 ...menuStyle,
                 backgroundColor: C.surface,
                 borderColor:     C.border,
                 boxShadow:       '0 8px 24px rgba(0,0,0,0.12)',
               }}>
            <div className="p-1.5 flex flex-col gap-0.5"
                 style={{ maxHeight: 220, overflowY: 'auto' }}>
            {/* No role option */}
            <button
              onClick={() => { onChange(null); setOpen(false) }}
              className="w-full flex items-center px-3 py-2 text-left text-[12px] font-semibold rounded-xl transition-all duration-150"
              style={{
                backgroundColor: !value ? C.lime : 'transparent',
                color:           !value ? C.dark : C.muted,
              }}
              onMouseEnter={e => { if (value) e.currentTarget.style.backgroundColor = C.limeTint }}
              onMouseLeave={e => { if (value) e.currentTarget.style.backgroundColor = 'transparent' }}>
              No role
            </button>
            {/* Role options */}
            {roles.map((r) => {
              const isSelected = r.id === value
              return (
                <button
                  key={r.id}
                  onClick={() => { onChange(r.id); setOpen(false) }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-[12px] font-semibold rounded-xl transition-all duration-150 group relative"
                  style={{
                    backgroundColor: isSelected ? C.lime : 'transparent',
                    color:           isSelected ? C.dark : C.text,
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = C.limeTint
                    const tip = e.currentTarget.querySelector('.scope-tip') as HTMLElement | null
                    if (tip) tip.style.display = 'block'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                    const tip = e.currentTarget.querySelector('.scope-tip') as HTMLElement | null
                    if (tip) tip.style.display = 'none'
                  }}>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{r.role_name}</span>
                    {!isSelected && (
                      <span className="text-[9px] font-normal truncate" style={{ color: C.muted }}>
                        {r.scopes.length} scope{r.scopes.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {/* Permission tooltip */}
                  <div className="scope-tip"
                       style={{
                         display:         'none',
                         position:        'absolute',
                         left:            'calc(100% + 8px)',
                         top:             '50%',
                         transform:       'translateY(-50%)',
                         backgroundColor: C.dark,
                         borderRadius:    12,
                         padding:         '8px 10px',
                         minWidth:        180,
                         zIndex:          99999,
                         pointerEvents:   'none',
                         boxShadow:       '0 4px 16px rgba(0,0,0,0.2)',
                       }}>
                    <p className="text-[9px] font-black tracking-wider mb-1.5"
                       style={{ color: 'rgba(143,255,0,0.7)' }}>PERMISSIONS</p>
                    {r.scopes.map(s => (
                      <div key={s} className="flex items-center gap-1.5 mb-1">
                        <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: C.lime }} />
                        <span className="text-[10px] font-mono" style={{ color: '#fff' }}>{s}</span>
                      </div>
                    ))}
                    {r.scopes.length === 0 && (
                      <span className="text-[10px]" style={{ color: C.muted }}>No permissions</span>
                    )}
                  </div>
                </button>
              )
            })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
// --------------------------------------------------------------
// INVITE MEMBER MODAL
// --------------------------------------------------------------
function InviteMemberModal({ roles, onClose, onInvited, showToast, canInvite = true }: {
    roles:     AdminRole[]
    onClose:   () => void
    onInvited: () => void
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void
    canInvite?: boolean
  }) {
  const supabase  = createClient()
  const [email,   setEmail]   = useState('')
  const [roleId,  setRoleId]  = useState<string>('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const isValidEmail = (e: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(e.trim())
  const isValid      = isValidEmail(email) && roleId !== ''
  const selectedRole = roles.find(r => r.id === roleId)

  async function handleInvite() {
    if (!isValid || sending) return
    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/roles/invite', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ email: email.trim(), adminRoleId: roleId }),
      })
      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Failed to send invite', 'error'); setSending(false); return }
      // json.assigned = true means user already existed and role was assigned directly
      setSuccess(true)
      setSuccessMessage(json.message)
      showToast(json.assigned ? `Role assigned to ${email.trim()}` : `Invite sent to ${email.trim()}`, 'success')
      onInvited()
    } catch {
      showToast('Network error', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
         onClick={e => e.target === e.currentTarget && !sending && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: C.dark }}>
              <UserPlus size={16} style={{ color: C.lime }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: C.dark }}>Invite Team Member</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Send an invite link via email</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {success ? (
            <div className="flex flex-col items-center py-6 gap-3 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: C.limeTint }}>
                <CheckCircle size={28} style={{ color: C.limeDeep }} />
              </div>
              <p className="text-[16px] font-black" style={{ color: C.dark }}>
                {successMessage.includes('directly') ? 'Role Assigned!' : 'Invite Sent!'}
              </p>
              <p className="text-[13px]" style={{ color: C.muted }}>{successMessage}</p>
              <button onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Email */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>EMAIL ADDRESS</p>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  type="email"
                  autoFocus
                  className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                  style={{
                    borderColor:     email.length > 0 ? (isValidEmail(email) ? C.lime : C.red) : C.border,
                    backgroundColor: C.bg,
                    color:           C.text,
                  }} />
                {email.length > 0 && !isValidEmail(email) && (
                  <p className="text-[11px] mt-1" style={{ color: C.red }}>Enter a valid email address</p>
                )}
              </div>

              {/* Role selector */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>ASSIGN ROLE</p>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {roles.filter(r => !r.is_system_role).map(r => {
                    const isSelected = roleId === r.id
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRoleId(r.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                        style={{
                          borderColor:     isSelected ? C.lime     : C.border,
                          backgroundColor: isSelected ? C.limeTint : C.bg,
                        }}>
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                             style={{ borderColor: isSelected ? C.limeDeep : C.border }}>
                          {isSelected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.limeDeep }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold" style={{ color: C.dark }}>{r.role_name}</p>
                          <p className="text-[10px] truncate" style={{ color: C.muted }}>
                            {r.scopes.length} scope{r.scopes.length !== 1 ? 's' : ''}{r.description ? ` · ${r.description}` : ''}
                          </p>
                        </div>
                        {isSelected && <Check size={14} style={{ color: C.limeDeep, flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                  {roles.filter(r => !r.is_system_role).length === 0 && (
                    <p className="text-[12px] text-center py-4" style={{ color: C.muted }}>
                      No custom roles yet — create one in Role Builder first
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!isValid || sending || !canInvite}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
                    style={{ backgroundColor: (isValid && canInvite) ? C.lime : C.border, color: (isValid && canInvite) ? C.dark : C.muted }}>
                    {sending
                      ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
                      : <><UserPlus size={14} /> {canInvite ? 'Send Invite' : 'View only'}</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// TEAM SEATS TAB
// --------------------------------------------------------------
function TeamSeatsTab({ members, roles, onMemberUpdated, showToast, canManage = true, canView = true, canInvite = true, canRevoke = true }: {
    members:          TeamMember[]
    roles:            AdminRole[]
    onMemberUpdated:  (id: string, roleId: string | null) => void
    showToast:        (msg: string, type: 'success' | 'error' | 'info') => void
    canManage?:       boolean
    canView?:         boolean
    canInvite?:       boolean
    canRevoke?:       boolean
  }) {
  const supabase = createClient()
  const [loadingId,        setLoadingId]        = useState<string | null>(null)
  const [revokeTarget,     setRevokeTarget]     = useState<TeamMember | null>(null)
  const [revokeConfirmText,setRevokeConfirmText]= useState('')
  const [showInvite,     setShowInvite]     = useState(false)
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [loadingInvites, setLoadingInvites] = useState(true)
  const [cancellingId,   setCancellingId]   = useState<string | null>(null)
  const [resendingId,    setResendingId]    = useState<string | null>(null)
  const [pendingChange,  setPendingChange]  = useState<{
    userId:    string
    oldRoleId: string | null
    newRoleId: string
    oldName:   string
    newName:   string
  } | null>(null)
  const [undoTimer,    setUndoTimer]    = useState(0)
  const [undoInterval, setUndoInterval] = useState<NodeJS.Timeout | null>(null)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [historyData,     setHistoryData]     = useState<Record<string, any[]>>({})
  const [historyLoading,  setHistoryLoading]  = useState<string | null>(null)
  const [selectedIds,     setSelectedIds]     = useState<Set<string>>(new Set())
  const [showBulkRole,    setShowBulkRole]    = useState(false)
  const [bulkRoleId,      setBulkRoleId]      = useState('')
  const [bulkLoading,     setBulkLoading]     = useState(false)
  const [showBulkRevoke,  setShowBulkRevoke]  = useState(false)

  async function fetchRoleHistory(userId: string) {
    if (historyData[userId]) {
      setExpandedHistory(prev => prev === userId ? null : userId)
      return
    }
    setHistoryLoading(userId)
    setExpandedHistory(userId)
    try {
      // Fetch role change events
      const { data: events } = await (supabase.from('user_events') as any)
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'admin_action')
        .in('event_title', ['Role Assigned', 'Role Revoked'])
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch last 5 logins from login_history
      const { data: logins } = await supabase
        .from('login_history')
        .select('login_at, ip_address, location_name, device_info')
        .eq('user_id', userId)
        .order('login_at', { ascending: false })
        .limit(5)

      setHistoryData(prev => ({
        ...prev,
        [userId]: {
          events: events ?? [],
          logins: logins ?? [],
        } as any,
      }))
    } catch {
      setHistoryData(prev => ({ ...prev, [userId]: { events: [], logins: [] } as any }))
    }
    setHistoryLoading(null)
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll(filtered: any[]) {
    const allSelected = filtered.every(m => selectedIds.has(m.id))
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(m => m.id)))
  }

  async function bulkChangeRole() {
    if (!bulkRoleId || selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      for (const userId of Array.from(selectedIds)) {
        await fetch('/api/admin/roles/assign', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body:    JSON.stringify({ userId, roleId: bulkRoleId }),
        })
        onMemberUpdated(userId, bulkRoleId)
      }
      showToast(`${selectedIds.size} member${selectedIds.size !== 1 ? 's' : ''} updated`, 'success')
      setSelectedIds(new Set())
      setShowBulkRole(false)
      setBulkRoleId('')
    } catch { showToast('Bulk update failed', 'error') }
    setBulkLoading(false)
  }

  async function bulkRevoke() {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      for (const userId of Array.from(selectedIds)) {
        await fetch('/api/admin/roles/assign', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body:    JSON.stringify({ userId, roleId: null }),
        })
        await fetch('/api/admin/force-logout', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body:    JSON.stringify({ userId }),
        })
        onMemberUpdated(userId, null)
      }
      showToast(`${selectedIds.size} member${selectedIds.size !== 1 ? 's' : ''} revoked`, 'success')
      setSelectedIds(new Set())
      setShowBulkRevoke(false)
    } catch { showToast('Bulk revoke failed', 'error') }
    setBulkLoading(false)
  }

  const loadPendingInvites = useCallback(async () => {
    try {
      const { data } = await (supabase.from('team_invites') as any)
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      setPendingInvites(data ?? [])
    } catch { /* non-critical */ }
    setLoadingInvites(false)
  }, [supabase])

  useEffect(() => { loadPendingInvites() }, [loadPendingInvites])

  // -- No seat limits in admin panel ------------------------
  const atLimit = false

  function exportRoster() {
    const headers = ['Name', 'Email', 'Role', 'Date Added', 'Last Active', 'Activity (7d)', 'Status']
    const escape  = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`
    const rows = members.map(m => [
      escape(m.name ?? m.email.split('@')[0]),
      escape(m.email),
      escape(m.role_name ?? 'No role'),
      escape(m.created_at
        ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—'),
      escape(m.last_seen
        ? new Date(m.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Never'),
      escape(m.activityCount ?? 0),
      escape(m.role_id ? 'Active' : 'No Role'),
    ])
    const csv  = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    link.href     = url
    link.download = `riazify-team-roster-${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast(`Exported ${members.length} members to CSV`, 'success')
  }

  async function cancelInvite(inviteId: string) {
    setCancellingId(inviteId)
    try {
      await (supabase.from('team_invites') as any)
        .update({ status: 'expired' })
        .eq('id', inviteId)
      setPendingInvites(prev => prev.filter(i => i.id !== inviteId))
      showToast('Invite cancelled', 'info')
    } catch { showToast('Failed to cancel invite', 'error') }
    setCancellingId(null)
  }

  async function resendInvite(invite: any) {
    setResendingId(invite.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/team/invite', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ email: invite.email, role: invite.role }),
      })
      if (res.ok) { showToast(`Invite resent to ${invite.email}`, 'success'); loadPendingInvites() }
      else showToast('Failed to resend invite', 'error')
    } catch { showToast('Network error', 'error') }
    setResendingId(null)
  }

  async function changeRole(userId: string, newRoleId: string) {
    // Find old and new role names for the confirmation bar
    const member  = members.find(m => m.id === userId)
    const oldName = roles.find(r => r.id === member?.role_id)?.role_name ?? 'No role'
    const newName = roles.find(r => r.id === newRoleId)?.role_name ?? newRoleId
    // Don't do anything if same role selected
    if (member?.role_id === newRoleId) return
    // Set pending — show confirmation bar instead of saving immediately
    setPendingChange({ userId, oldRoleId: member?.role_id ?? null, newRoleId, oldName, newName })
  }

  async function confirmRoleChange() {
    if (!pendingChange) return
    const { userId, newRoleId, oldRoleId, newName } = pendingChange
    setLoadingId(userId)
    setPendingChange(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/roles/assign', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ userId, roleId: newRoleId }),
      })
      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Failed to update role', 'error'); setLoadingId(null); return }
      onMemberUpdated(userId, newRoleId)

      // Start 5-second undo countdown
      let t = 5
      setUndoTimer(t)
      const interval = setInterval(() => {
        t--
        setUndoTimer(t)
        if (t <= 0) {
          clearInterval(interval)
          setUndoTimer(0)
        }
      }, 1000)
      setUndoInterval(interval)

      // Store undo info in a ref-like state so toast can revert
      setPendingChange({ userId, oldRoleId, newRoleId, oldName: '', newName })
      setTimeout(() => setPendingChange(null), 5000)
    } catch { showToast('Network error', 'error') }
    setLoadingId(null)
  }

  async function undoRoleChange() {
    if (!pendingChange) return
    const { userId, oldRoleId } = pendingChange
    if (undoInterval) clearInterval(undoInterval)
    setUndoTimer(0)
    setPendingChange(null)
    setLoadingId(userId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/admin/roles/assign', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ userId, roleId: oldRoleId }),
      })
      onMemberUpdated(userId, oldRoleId)
      showToast('Role change undone', 'info')
    } catch { showToast('Failed to undo', 'error') }
    setLoadingId(null)
  }

  async function revokeAccess(userId: string) {
    setLoadingId(userId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/roles/assign', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ userId, roleId: null }),
      })
      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Failed to revoke access', 'error'); return }
      await fetch('/api/admin/force-logout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ userId }),
      })
      onMemberUpdated(userId, null)
      showToast('Access revoked and session terminated', 'success')
    } catch {
      showToast('Network error', 'error')
    } finally {
      setLoadingId(null)
      setRevokeTarget(null)
      setRevokeConfirmText('')
    }
  }

  if (members.length === 0 && pendingInvites.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.bg }}>
          <Users size={24} style={{ color: C.muted }} />
        </div>
        <p className="text-[14px] font-bold" style={{ color: C.text }}>No team seats assigned</p>
        <p className="text-[12px]" style={{ color: C.muted }}>Invite a team member to get started</p>
        <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
          <UserPlus size={14} /> Invite Member
        </button>
        {showInvite && (
          <InviteMemberModal roles={roles} onClose={() => setShowInvite(false)}
              onInvited={() => { setShowInvite(false); loadPendingInvites() }} showToast={showToast} canInvite={canInvite} />
          )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Top bar — invite button */}
      <div className="flex flex-col gap-2">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold" style={{ color: C.text }}>
              {members.length} active seat{members.length !== 1 ? 's' : ''}
              {pendingInvites.length > 0 && (
                <span className="ml-2 text-[11px] font-semibold" style={{ color: C.amber }}>
                  · {pendingInvites.length} pending invite{pendingInvites.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Export CSV */}
            {members.length > 0 && (
              <button
                onClick={exportRoster}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold hover:opacity-80 transition-all border"
                style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
                ? Export CSV
              </button>
            )}
            {/* Invite Member */}
              <div className="relative group">
                <button
                  onClick={() => !atLimit && setShowInvite(true)}
                  disabled={atLimit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
                style={{
                  backgroundColor: atLimit ? C.border : C.dark,
                  color:           atLimit ? C.muted  : C.lime,
                  cursor:          atLimit ? 'not-allowed' : 'pointer',
                  opacity:         atLimit ? 0.6 : 1,
                }}>
                <UserPlus size={13} /> Invite Member
              </button>
              {atLimit && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                     style={{ backgroundColor: C.dark, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                  Seat limit reached — upgrade your plan
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending invites section */}
        {canView && pendingInvites.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>PENDING INVITES</p>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            {/* Pending invites header */}
            <div className="grid px-4 py-2 border-b" style={{ gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 1fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
              {['EMAIL', 'ROLE', 'STATUS', 'EXPIRES', 'ACTIONS'].map(h => (
                <span key={h} className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
              ))}
            </div>
            {pendingInvites.map((invite, i) => {
                const isExpired    = new Date(invite.expires_at) < new Date()
                const isCancelling = cancellingId === invite.id
                const isResending  = resendingId  === invite.id
                const daysLeft     = Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / 86400000)
                const roleName     = invite.admin_role_id
                  ? (roles.find(r => r.id === invite.admin_role_id)?.role_name ?? '—')
                  : '—'
                return (
                  <div key={invite.id}
                       className="grid px-4 py-3 items-center border-b last:border-b-0"
                       style={{ gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 1fr', gap: 12, borderColor: C.border }}>

                    {/* Email */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                           style={{ backgroundColor: 'rgba(217,119,6,0.1)' }}>
                        <Mail size={14} style={{ color: C.amber }} />
                      </div>
                      <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>{invite.email}</p>
                    </div>

                    {/* Role */}
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                        {roleName}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: isExpired ? 'rgba(185,28,28,0.1)' : 'rgba(217,119,6,0.1)',
                              color:           isExpired ? C.red : C.amber,
                            }}>
                        {isExpired ? 'EXPIRED' : 'PENDING'}
                      </span>
                    </div>

                    {/* Expires */}
                    <div>
                      <p className="text-[11px] font-semibold"
                         style={{ color: isExpired ? C.red : C.muted }}>
                        {isExpired ? 'Expired' : `${daysLeft}d left`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => resendInvite(invite)} disabled={isResending}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-80"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                        {isResending ? '...' : 'Resend'}
                      </button>
                      <button onClick={() => cancelInvite(invite.id)} disabled={isCancelling}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-80"
                        style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                        {isCancelling ? '...' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Active members table */}
        {canView && members.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>ACTIVE MEMBERS</p>

          {/* Search bar */}
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl border transition-all"
               id="team-search-bar"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <Search size={14} style={{ color: C.muted, flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email or role..."
              className="flex-1 text-[13px] bg-transparent"
              style={{ color: C.text, outline: 'none', border: 'none', boxShadow: 'none' }}
              onFocus={() => {
                const bar = document.getElementById('team-search-bar')
                if (bar) bar.style.borderColor = 'rgba(143,255,0,0.5)'
              }}
              onBlur={() => {
                const bar = document.getElementById('team-search-bar')
                if (bar) bar.style.borderColor = C.border
              }} />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={13} style={{ color: C.muted }} />
              </button>
            )}
          </div>

      {/* Table rows */}
      <div className="rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        {/* Active members header */}
        <div className="grid px-4 py-2.5 border-b"
             style={{
               gridTemplateColumns: '32px 2fr 1.5fr 1fr 0.7fr 0.7fr 0.8fr 0.7fr',
               gap: 12,
               borderColor:     C.border,
               backgroundColor: C.bg,
             }}>
          <div
            onClick={() => toggleAll(members)}
            className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center cursor-pointer mt-0.5"
            style={{
              backgroundColor: members.length > 0 && members.every(m => selectedIds.has(m.id)) ? C.dark : 'transparent',
              borderColor:     members.length > 0 && members.every(m => selectedIds.has(m.id)) ? C.dark : C.border,
            }}>
            {members.length > 0 && members.every(m => selectedIds.has(m.id)) && (
              <Check size={9} style={{ color: C.lime }} />
            )}
            {members.some(m => selectedIds.has(m.id)) && !members.every(m => selectedIds.has(m.id)) && (
              <div className="w-2 h-0.5 rounded" style={{ backgroundColor: C.muted }} />
            )}
          </div>
          {['TEAM MEMBER', 'ASSIGNED ROLE', 'DATE ADDED', 'STATUS', 'ACTIVITY', 'LAST ACTIVE', 'ACTIONS'].map(h => (
            <span key={h} className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
          ))}
        </div>
        {(() => {
          const q = searchQuery.toLowerCase().trim()
          const filtered = q
            ? members.filter(m =>
                (m.name  ?? '').toLowerCase().includes(q) ||
                (m.email ?? '').toLowerCase().includes(q) ||
                (m.role_name ?? '').toLowerCase().includes(q)
              )
            : members

          if (filtered.length === 0) return (
            <div className="flex flex-col items-center py-10 gap-2">
              <Search size={20} style={{ color: C.muted }} />
              <p className="text-[13px] font-bold" style={{ color: C.text }}>No members match</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Try a different name, email or role</p>
            </div>
          )

          return filtered.map((member) => {
          const isLoading   = loadingId === member.id

          return (
            <div key={member.id}>
              <div className="grid px-4 py-3 items-center border-b last:border-b-0 hover:bg-[#fafcf8] transition-colors"
                   style={{
                     gridTemplateColumns: '32px 2fr 1.5fr 1fr 0.7fr 0.7fr 0.8fr 0.7fr',
                     gap: 12,
                     borderColor: C.border,
                     backgroundColor: selectedIds.has(member.id) ? C.limeTint : undefined,
                   }}>
                {/* Checkbox */}
                <div
                  onClick={() => toggleOne(member.id)}
                  className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center cursor-pointer shrink-0"
                  style={{
                    backgroundColor: selectedIds.has(member.id) ? C.dark : 'transparent',
                    borderColor:     selectedIds.has(member.id) ? C.dark : C.border,
                  }}>
                  {selectedIds.has(member.id) && <Check size={9} style={{ color: C.lime }} />}
                </div>

                {/* Member */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={member.name} email={member.email} size={32} avatarUrl={member.avatar_url} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>
                      {member.name ?? member.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: C.muted }}>{member.email}</p>
                  </div>
                </div>

                {/* Role dropdown — clean, no date inside */}
                <div>
                  {isLoading ? (
                    <div className="flex items-center gap-2 h-8">
                      <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.limeDeep }} />
                      <span className="text-[11px]" style={{ color: C.muted }}>Updating...</span>
                    </div>
                  ) : (
                    <RoleDropdown
                        value={member.role_id}
                        roles={roles}
                        disabled={!canManage}
                        onChange={newRoleId => {
                        if (newRoleId === null) revokeAccess(member.id)
                        else changeRole(member.id, newRoleId)
                      }}
                    />
                  )}
                </div>

                {/* Date Added — dedicated column */}
                <div>
                  <p className="text-[11px] font-semibold" style={{ color: C.text }}>
                    {member.created_at
                      ? new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: member.role_id ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)',
                          color:           member.role_id ? C.green : C.amber,
                        }}>
                    {member.role_id ? 'Active' : 'No Role'}
                  </span>
                </div>

                {/* Activity count */}
                <div>
                  {(() => {
                    const count = member.activityCount ?? 0
                    const color = count >= 10 ? C.green : count >= 1 ? C.amber : C.muted
                    const bg    = count >= 10 ? 'rgba(22,163,74,0.1)' : count >= 1 ? 'rgba(217,119,6,0.1)' : C.bg
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
                              style={{ backgroundColor: bg, color }}>
                          {count} action{count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[9px] px-1" style={{ color: C.muted }}>last 7 days</span>
                      </div>
                    )
                  })()}
                </div>

                {/* Last active */}
                <div>
                  <p className="text-[11px]" style={{ color: C.muted }}>{timeAgo(member.last_seen)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => fetchRoleHistory(member.id)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg hover:opacity-80"
                    style={{
                      backgroundColor: expandedHistory === member.id ? C.dark : C.bg,
                      color:           expandedHistory === member.id ? C.lime : C.muted,
                      border:          `1px solid ${C.border}`,
                    }}>
                    {historyLoading === member.id ? '...' : 'History'}
                  </button>
                  {canRevoke && <button
                      onClick={() => { setRevokeTarget(member); setRevokeConfirmText('') }}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg hover:opacity-80"
                    style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                    Revoke
                  </button>}
                </div>
              </div>
              {/* Role history timeline */}
              {expandedHistory === member.id && (
                <div className="px-4 py-3 border-b"
                     style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  {historyLoading === member.id ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                           style={{ borderTopColor: C.limeDeep }} />
                      <span className="text-[11px]" style={{ color: C.muted }}>Loading history...</span>
                    </div>
                  ) : (
                    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

                      {/* Left — Role Changes */}
                      <div>
                        <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>
                          ROLE CHANGES
                        </p>
                        {((historyData[member.id] as any)?.events ?? []).length === 0 ? (
                          <p className="text-[11px]" style={{ color: C.muted }}>No role changes recorded yet</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {((historyData[member.id] as any)?.events ?? []).map((event: any, idx: number) => {
                              const isAssign  = event.event_title === 'Role Assigned'
                              const adminName = event.metadata?.admin_name ?? 'Admin'
                              const date      = new Date(event.created_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })
                              return (
                                <div key={event.id ?? idx} className="flex items-start gap-2 px-3 py-2 rounded-xl border"
                                     style={{ borderColor: C.border, backgroundColor: C.surface }}>
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                                       style={{ backgroundColor: isAssign ? C.limeDeep : C.red }} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold" style={{ color: C.dark }}>
                                      {event.event_title}
                                    </p>
                                    <p className="text-[9px]" style={{ color: C.muted }}>
                                      {date} · by {adminName}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right — Recent Logins */}
                      <div>
                        <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>
                          RECENT LOGINS
                        </p>
                        {((historyData[member.id] as any)?.logins ?? []).length === 0 ? (
                          <p className="text-[11px]" style={{ color: C.muted }}>No login history found</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {((historyData[member.id] as any)?.logins ?? []).map((login: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-xl border"
                                   style={{ borderColor: C.border, backgroundColor: C.surface }}>
                                <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                                     style={{ backgroundColor: C.green }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold truncate" style={{ color: C.dark }}>
                                    {login.location_name || 'Unknown location'}
                                  </p>
                                  <p className="text-[9px] font-mono truncate" style={{ color: C.muted }}>
                                    {login.ip_address} · {login.device_info || 'Unknown'}
                                  </p>
                                  <p className="text-[9px]" style={{ color: C.muted }}>
                                    {new Date(login.login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )}
              {pendingChange?.userId === member.id && pendingChange.oldName !== '' && (
                <div className="flex items-center gap-3 px-4 py-2.5 border-b"
                     style={{ backgroundColor: 'rgba(143,255,0,0.06)', borderColor: C.lime }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold" style={{ color: C.dark }}>
                      Change role from{' '}
                      <span style={{ color: C.red }}>{pendingChange.oldName}</span>
                      {' ? '}
                      <span style={{ color: C.limeDeep }}>{pendingChange.newName}</span>
                      ?
                    </p>
                    <p className="text-[9px]" style={{ color: C.muted }}>This will take effect on their next page load</p>
                  </div>
                  <button onClick={confirmRoleChange}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                    style={{ backgroundColor: C.lime, color: C.dark }}>
                    <Check size={11} /> Confirm
                  </button>
                  <button onClick={() => setPendingChange(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                    style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}` }}>
                    <X size={11} /> Cancel
                  </button>
                </div>
              )}
            </div>
          )
          })
        })()}
      </div>
        </div>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 z-[9990] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
             style={{
               transform:       'translateX(-50%)',
               backgroundColor: C.dark,
               border:          `1px solid rgba(143,255,0,0.3)`,
               boxShadow:       '0 8px 32px rgba(0,0,0,0.35)',
             }}>
          {/* Count */}
          <div className="flex items-center gap-2 pr-3"
               style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: C.lime }}>
              <span className="text-[10px] font-black" style={{ color: C.dark }}>{selectedIds.size}</span>
            </div>
            <span className="text-[12px] font-semibold text-white">
              member{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Change Role */}
          {canManage && <div className="relative">
            <button
              onClick={() => setShowBulkRole(s => !s)}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              <Shield size={13} style={{ color: C.lime }} />
              Change Role
            </button>
            {showBulkRole && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBulkRole(false)} />
                <div className="absolute bottom-full mb-2 left-0 z-50 rounded-2xl border overflow-hidden p-1.5 flex flex-col gap-0.5"
                     style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                  {roles.filter(r => !r.is_system_role).map(r => (
                    <button key={r.id}
                      onClick={() => setBulkRoleId(r.id)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold text-left transition-all"
                      style={{
                        backgroundColor: bulkRoleId === r.id ? C.lime : 'transparent',
                        color:           bulkRoleId === r.id ? C.dark : C.text,
                      }}
                      onMouseEnter={e => { if (bulkRoleId !== r.id) e.currentTarget.style.backgroundColor = C.limeTint }}
                      onMouseLeave={e => { if (bulkRoleId !== r.id) e.currentTarget.style.backgroundColor = 'transparent' }}>
                      {r.role_name}
                      {bulkRoleId === r.id && <Check size={12} style={{ color: C.dark }} />}
                    </button>
                  ))}
                  <div className="h-px my-1" style={{ backgroundColor: C.border }} />
                  <button
                    onClick={bulkChangeRole}
                    disabled={!bulkRoleId || bulkLoading}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold disabled:opacity-40"
                    style={{ backgroundColor: bulkRoleId ? C.dark : C.border, color: bulkRoleId ? C.lime : C.muted }}>
                    {bulkLoading
                      ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                      : <><Check size={12} /> Apply to {selectedIds.size}</>}
                  </button>
                </div>
              </>
            )}
          </div>}
          
          {/* Bulk Revoke */}
            {canRevoke && <button
              onClick={() => setShowBulkRevoke(true)}
              disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(185,28,28,0.3)', color: '#fca5a5' }}>
            Revoke {selectedIds.size}
          </button>}

          {/* Clear */}
          <button onClick={() => setSelectedIds(new Set())}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>
      )}

      {/* Bulk revoke confirm modal */}
      {showBulkRevoke && (
        <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={e => e.target === e.currentTarget && setShowBulkRevoke(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
               style={{ border: `1px solid ${C.border}` }}>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
                  <Shield size={18} style={{ color: C.red }} />
                </div>
                <div>
                  <p className="text-[15px] font-black" style={{ color: C.dark }}>Revoke {selectedIds.size} Members</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>Sessions will be terminated immediately</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowBulkRevoke(false)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button onClick={bulkRevoke} disabled={bulkLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50"
                  style={{ backgroundColor: C.red, color: '#fff' }}>
                  {bulkLoading
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                    : 'Confirm Revoke All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke confirmation modal */}
      {revokeTarget && (
        <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
             onClick={e => e.target === e.currentTarget && setRevokeTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
               style={{ border: `1px solid ${C.border}` }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b"
                 style={{ borderColor: C.border, backgroundColor: 'rgba(185,28,28,0.04)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
                <Shield size={18} style={{ color: C.red }} />
              </div>
              <div>
                <p className="text-[15px] font-black" style={{ color: C.dark }}>Revoke Admin Access</p>
                <p className="text-[11px]" style={{ color: C.muted }}>This action cannot be undone</p>
              </div>
              <button onClick={() => setRevokeTarget(null)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
                <X size={15} style={{ color: C.muted }} />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Member info */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                   style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <Avatar name={revokeTarget.name} email={revokeTarget.email} size={36} avatarUrl={revokeTarget.avatar_url} />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: C.dark }}>
                    {revokeTarget.name ?? revokeTarget.email.split('@')[0]}
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{revokeTarget.email}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: C.amber }}>
                    {revokeTarget.role_name ?? 'No role'}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border"
                   style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.2)' }}>
                <p className="text-[12px] font-bold" style={{ color: C.red }}>What will happen:</p>
                {[
                  'Their admin role will be removed immediately',
                  'Their active session will be terminated instantly',
                  'They will be logged out and cannot log back in as admin',
                  'All pending work they have open will be lost',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: C.red }} />
                    <p className="text-[11px]" style={{ color: C.muted }}>{item}</p>
                  </div>
                ))}
              </div>

              {/* Name confirmation input */}
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Type <strong style={{ color: C.dark }}>
                    {revokeTarget.name ?? revokeTarget.email.split('@')[0]}
                  </strong> to confirm
                </p>
                <input
                  value={revokeConfirmText}
                  onChange={e => setRevokeConfirmText(e.target.value)}
                  placeholder="Type name to confirm..."
                  autoFocus
                  className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                  style={{
                    borderColor:     revokeConfirmText === (revokeTarget.name ?? revokeTarget.email.split('@')[0]) ? C.red : C.border,
                    backgroundColor: C.bg,
                    color:           C.text,
                  }} />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={() => { setRevokeTarget(null); setRevokeConfirmText('') }}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button
                  onClick={() => revokeAccess(revokeTarget.id)}
                  disabled={revokeConfirmText !== (revokeTarget.name ?? revokeTarget.email.split('@')[0]) || loadingId === revokeTarget.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
                  style={{ backgroundColor: C.red, color: '#fff' }}>
                  {loadingId === revokeTarget.id
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                    : <><Shield size={14} /> Revoke Access</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <InviteMemberModal
            roles={roles}
            onClose={() => setShowInvite(false)}
            onInvited={() => { setShowInvite(false); loadPendingInvites() }}
            showToast={showToast}
            canInvite={canInvite}
          />
        )}

      {/* Undo toast — shows after role change is confirmed */}
      {undoTimer > 0 && pendingChange && (
        <div className="fixed bottom-6 left-1/2 z-[99999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
             style={{
               transform:       'translateX(-50%)',
               backgroundColor: C.dark,
               border:          `1px solid rgba(143,255,0,0.3)`,
             }}>
          <p className="text-[13px] font-semibold text-white">
            Role changed to <span style={{ color: C.lime }}>{pendingChange.newName}</span>
          </p>
          <button onClick={undoRoleChange}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}>
            ? Undo ({undoTimer}s)
          </button>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------
// MAIN — RoleBuilderTab
// --------------------------------------------------------------
export default function RoleBuilderTab() {
  const { can } = useTabPermissions('role_builder')
  const supabase = createClient()

  const [roles,              setRoles]              = useState<AdminRole[]>([])
  const [members,            setMembers]            = useState<TeamMember[]>([])
  const [adminActionsToday,  setAdminActionsToday]  = useState(0)
  const [loading,            setLoading]            = useState(true)
  const [selectedRole,       setSelectedRole]       = useState<AdminRole | null>(null)
  const [isCreating,         setIsCreating]         = useState(false)
  const [activeTab,          setActiveTab]          = useState<'builder' | 'seats'>('builder')
  const [toast,              setToast]              = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // -- Load all data --------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      // Fetch roles
      const { data: rolesData } = await (supabase.from('admin_roles') as any)
        .select('*')
        .order('is_system_role', { ascending: false })
        .order('created_at', { ascending: true })

      // Fetch admin team members (anyone with a role_id assigned)
      const { data: membersData } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url, role_id, last_seen, created_at')
        .not('role_id', 'is', null)

      // Fetch today's admin action count — only if admin_logs table exists
      let actionsToday = 0
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count, error: logsError } = await (supabase.from('admin_logs') as any)
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
        if (!logsError) actionsToday = count ?? 0
      } catch { /* admin_logs table not built yet — skip silently */ }

      const rolesArr   = (rolesData   ?? []) as AdminRole[]
      const membersArr = (membersData ?? []) as TeamMember[]

      // Fetch activity counts from admin_logs (silently skip if table doesn't exist)
      const activityMap: Record<string, number> = {}
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: logs } = await (supabase.from('admin_logs') as any)
          .select('admin_id')
          .gte('created_at', sevenDaysAgo)
        for (const log of (logs ?? []) as any[]) {
          if (log.admin_id) activityMap[log.admin_id] = (activityMap[log.admin_id] ?? 0) + 1
        }
      } catch { /* admin_logs not built yet — show 0 for all */ }

      // Enrich members with role_name + activityCount
      const enriched = membersArr.map(m => ({
        ...m,
        role_name:     rolesArr.find(r => r.id === m.role_id)?.role_name ?? null,
        activityCount: activityMap[m.id] ?? 0,
      }))

      setRoles(rolesArr)
      setMembers(enriched)
      setAdminActionsToday(actionsToday)
    } catch (e) {
      console.error('[RoleBuilderTab]', e)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // -- Handlers -------------------------------------------------
  function handleSelectRole(role: AdminRole) {
    setSelectedRole(role)
    setIsCreating(false)
  }

  function handleCreateNew() {
    setSelectedRole(null)
    setIsCreating(true)
  }

  function handleSaved(updated: AdminRole) {
    setRoles(prev => {
      const exists = prev.find(r => r.id === updated.id)
      if (exists) return prev.map(r => r.id === updated.id ? updated : r)
      return [...prev, updated]
    })
    setSelectedRole(updated)
    setIsCreating(false)
  }

  function handleDeleted() {
    setRoles(prev => prev.filter(r => r.id !== selectedRole?.id))
    setSelectedRole(null)
    setIsCreating(false)
  }

  function handleMemberUpdated(userId: string, roleId: string | null) {
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, role_id: roleId } : m))
  }

  // -- Loading skeleton -----------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: C.border }} />)}
        </div>
        <div className="h-10 rounded-2xl animate-pulse" style={{ backgroundColor: C.border }} />
        <div className="flex gap-4">
          <div className="w-[35%] h-96 rounded-2xl animate-pulse" style={{ backgroundColor: C.border }} />
          <div className="flex-1 h-96 rounded-2xl animate-pulse" style={{ backgroundColor: C.border }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-20">

      {/* HUD */}
      <HudDeck roles={roles} members={members} adminActionsToday={adminActionsToday} />

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-2">
        {[
          { key: 'builder', label: 'Role Builder',  Icon: Shield },
          { key: 'seats',   label: 'Team Seats',    Icon: Users  },
        ].map(tab => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'builder' | 'seats')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-all"
              style={{
                backgroundColor: isActive ? C.dark    : C.surface,
                borderColor: isActive ? '#8fff00' : C.border,
                color:           isActive ? '#ffffff' : C.muted,
              }}>
              <tab.Icon size={14} style={{ color: isActive ? C.lime : C.muted }} />
              {tab.label}
              {tab.key === 'seats' && members.length > 0 && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: isActive ? C.lime : C.bg, color: isActive ? C.dark : C.limeDeep }}>
                  {members.length}
                </span>
              )}
            </button>
          )
        })}

        {/* Refresh */}
        <button onClick={loadData}
          className="ml-auto w-9 h-9 flex items-center justify-center rounded-xl border hover:opacity-80"
          style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <RefreshCw size={14} style={{ color: C.muted }} />
        </button>
      </div>

      {/* Role Builder view — split layout */}
      {activeTab === 'builder' && (
        <div className="flex gap-4" style={{ minHeight: 500 }}>

        {/* Left — 35% role list */}
            <div className="flex flex-col" style={{ width: '35%', minWidth: 240 }}>
              {can('view_roles') ? (
                <>
                  <div className="mb-3">
                    <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>ROLES REGISTRY</p>
                    <p className="text-[11px]" style={{ color: C.muted }}>
                      {roles.filter(r => r.is_system_role).length} system · {roles.filter(r => !r.is_system_role).length} custom
                    </p>
                  </div>
                  <RoleList
                    roles={roles}
                    allMembers={members}
                    selectedId={isCreating ? '__new__' : selectedRole?.id ?? null}
                    onSelect={handleSelectRole}
                    onCreateNew={handleCreateNew}
                    canCreate={can('create_role')}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                  <p className="text-[13px] font-bold" style={{ color: C.muted }}>You don't have access to view roles</p>
                </div>
              )}
            </div>

          {/* Right — 65% permission matrix */}
          <div className="flex flex-col flex-1">
            <div className="mb-3">
              <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>PERMISSION MATRIX</p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                {selectedRole ? `Editing: ${selectedRole.role_name}` : isCreating ? 'Creating new role' : 'Select a role from the left'}
              </p>
            </div>
            <PermissionMatrix
              role={selectedRole}
              allRoles={roles}
              allMembers={members}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
              onMembersReassigned={(userId, roleId) => handleMemberUpdated(userId, roleId)}
              showToast={showToast}
              isCreating={isCreating}
              canEdit={can('edit_role')}
              canDelete={can('delete_role')}
            />
          </div>
        </div>
      )}

     {/* Team Seats view */}
        {activeTab === 'seats' && (
          <TeamSeatsTab
            members={members}
            roles={roles}
            onMemberUpdated={handleMemberUpdated}
            showToast={showToast}
            canManage={can('manage_team')}
            canView={can('view_team')}
            canInvite={can('invite_member')}
            canRevoke={can('revoke_access')}
          />
        )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e8ede2' }}>
        {can('view_team') ? (
          <TeamMembersPanel canEdit={can('manage_team')} />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border" style={{ borderColor: '#e8ede2', backgroundColor: '#f7f9f5' }}>
            <p className="text-[13px] font-bold" style={{ color: '#8a9e78' }}>You don't have access to view team members</p>
          </div>
        )}
      </div>
    </div>
  )
}
