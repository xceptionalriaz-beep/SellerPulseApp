'use client'
// components/admin/settings-tabs/PermissionBuilderTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Shield, RefreshCw, Check, Save, ChevronDown, ChevronUp,
  Clock, Globe, FileText, Activity, Copy, RotateCcw, Lock,
  Eye, EyeOff, AlertTriangle, Users, CreditCard, BarChart2,
  MessageCircle, BookOpen, Settings, Zap, Star
} from 'lucide-react'

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
  blue:        '#1d4ed8',
  blueBg:      '#eff6ff',
  blueBorder:  '#bfdbfe',
  green:       '#15803d',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
  amber:       '#b45309',
  amberBg:     '#fffbeb',
  amberBorder: '#fde68a',
  purple:      '#7c3aed',
  purpleBg:    '#f5f3ff',
  purpleBorder:'#ddd6fe',
}

type Permission = 'none' | 'view' | 'full'

// ── Tab definitions ────────────────────────────────────────────
const ALL_TABS = [
  { key: 'user_crm',        label: 'User CRM'        },
  { key: 'role_builder',    label: 'Role Builder'    },
  { key: 'security_logs',   label: 'Security Logs'   },
  { key: 'promos',          label: 'Promos & Codes'  },
  { key: 'kill_switches',   label: 'Kill Switches'   },
  { key: 'plan_limits',     label: 'Plan Limits'     },
  { key: 'emails',          label: 'Emails'          },
  { key: 'webhooks',        label: 'Webhooks'        },
  { key: 'gamification',    label: 'Gamification'    },
  { key: 'api_vault',       label: 'API Vault'       },
  { key: 'affiliate_vault', label: 'Affiliate Vault' },
  { key: 'founder_ops',     label: 'Founder Ops'     },
  { key: 'marketing',       label: 'Marketing'       },
  { key: 'payments',        label: 'Payments'        },
  { key: 'tickets',         label: 'Tickets'         },
  { key: 'blog',            label: 'Blog'            },
  { key: 'changelog',       label: 'Changelog'       },
  { key: 'page_editor',     label: 'Page Editor'     },
]

// ── Action permissions per tab ─────────────────────────────────
const TAB_ACTIONS: Record<string, { key: string; label: string; danger?: boolean }[]> = {
  user_crm: [
    { key: 'view_users',       label: 'View users list'                    },
    { key: 'view_contacts',    label: 'View contact details (email, phone)' },
    { key: 'edit_users',       label: 'Edit user details'                  },
    { key: 'view_billing',     label: 'View billing information'           },
    { key: 'edit_billing',     label: 'Edit billing / change plan'         },
    { key: 'suspend_users',    label: 'Suspend users',          danger: true },
    { key: 'delete_users',     label: 'Delete users',           danger: true },
    { key: 'export_users',     label: 'Export user data CSV'               },
    { key: 'impersonate',      label: 'Impersonate users',      danger: true },
  ],
  payments: [
    { key: 'view_transactions', label: 'View transactions'       },
    { key: 'view_amounts',      label: 'View payment amounts'    },
    { key: 'issue_refunds',     label: 'Issue refunds', danger: true },
    { key: 'export_csv',        label: 'Export transactions CSV' },
    { key: 'delete_records',    label: 'Delete records', danger: true },
  ],
  tickets: [
    { key: 'view_tickets',   label: 'View tickets'          },
    { key: 'reply_tickets',  label: 'Reply to tickets'      },
    { key: 'close_tickets',  label: 'Close tickets'         },
    { key: 'delete_tickets', label: 'Delete tickets', danger: true },
    { key: 'assign_tickets', label: 'Assign tickets'        },
  ],
  blog: [
    { key: 'view_posts',    label: 'View posts'             },
    { key: 'create_posts',  label: 'Create posts'           },
    { key: 'edit_posts',    label: 'Edit posts'             },
    { key: 'publish_posts', label: 'Publish posts'          },
    { key: 'delete_posts',  label: 'Delete posts', danger: true },
  ],
  emails: [
    { key: 'view_emails',   label: 'View email logs'        },
    { key: 'send_emails',   label: 'Send emails'            },
    { key: 'delete_emails', label: 'Delete email records', danger: true },
    { key: 'view_content',  label: 'View email content'     },
  ],
  affiliate_vault: [
    { key: 'view_affiliates',   label: 'View affiliates'           },
    { key: 'approve_payouts',   label: 'Approve payouts', danger: true },
    { key: 'reject_payouts',    label: 'Reject payouts',  danger: true },
    { key: 'edit_commission',   label: 'Edit commission rates'     },
    { key: 'export_affiliates', label: 'Export affiliate data'     },
  ],
  kill_switches: [
    { key: 'view_switches',   label: 'View kill switches'              },
    { key: 'toggle_switches', label: 'Toggle kill switches', danger: true },
  ],
  security_logs: [
    { key: 'view_logs',      label: 'View security logs'   },
    { key: 'view_ips',       label: 'View IP addresses'    },
    { key: 'block_ips',      label: 'Block IPs', danger: true },
    { key: 'export_logs',    label: 'Export logs'          },
  ],
  founder_ops: [
    { key: 'view_mrr',       label: 'View MRR / revenue'   },
    { key: 'view_metrics',   label: 'View growth metrics'  },
    { key: 'view_churn',     label: 'View churn data'      },
  ],
}

// ── Section permissions per tab ────────────────────────────────
const TAB_SECTIONS: Record<string, { key: string; label: string }[]> = {
  user_crm: [
    { key: 'profile_section',  label: 'Profile information'  },
    { key: 'billing_section',  label: 'Billing & plan info'  },
    { key: 'orders_section',   label: 'Orders history'       },
    { key: 'activity_section', label: 'Activity & usage'     },
    { key: 'notes_section',    label: 'Admin notes'          },
  ],
  payments: [
    { key: 'transactions',  label: 'Transactions list' },
    { key: 'refunds',       label: 'Refunds section'   },
    { key: 'analytics',     label: 'Payment analytics' },
  ],
  founder_ops: [
    { key: 'mrr_section',     label: 'MRR & revenue'    },
    { key: 'users_section',   label: 'User growth'      },
    { key: 'churn_section',   label: 'Churn analysis'   },
    { key: 'goals_section',   label: 'Revenue goals'    },
  ],
}

// ── Data visibility ────────────────────────────────────────────
const DATA_FIELDS = [
  { key: 'email_addresses',  label: 'Email addresses',      desc: 'User and customer emails'      },
  { key: 'ip_addresses',     label: 'IP addresses',          desc: 'Login and activity IPs'        },
  { key: 'revenue_numbers',  label: 'Revenue amounts',       desc: 'MRR, LTV, payment amounts'    },
  { key: 'phone_numbers',    label: 'Phone numbers',         desc: 'Contact phone numbers'         },
  { key: 'full_names',       label: 'Full names',            desc: 'User real names'               },
  { key: 'billing_details',  label: 'Billing details',       desc: 'Payment methods, addresses'   },
  { key: 'api_keys',         label: 'API keys',              desc: 'User and system API keys'      },
]

// ── Permission templates ───────────────────────────────────────
const TEMPLATES = [
  {
    id: 'support_agent',
    label: 'Support Agent',
    icon: MessageCircle,
    desc: 'Handles tickets and basic user support',
    color: C.blue,
    permissions: { tickets: 'full', user_crm: 'view' } as Record<string, Permission>,
    actions: { view_tickets: true, reply_tickets: true, close_tickets: true, view_users: true, view_contacts: true },
    data: { email_addresses: true, full_names: true },
  },
  {
    id: 'content_manager',
    label: 'Content Manager',
    icon: BookOpen,
    desc: 'Manages blog, changelog and page editor',
    color: C.green,
    permissions: { blog: 'full', changelog: 'full', page_editor: 'full' } as Record<string, Permission>,
    actions: { view_posts: true, create_posts: true, edit_posts: true, publish_posts: true },
    data: {},
  },
  {
    id: 'finance_manager',
    label: 'Finance Manager',
    icon: CreditCard,
    desc: 'Manages payments, revenue and billing',
    color: C.purple,
    permissions: { payments: 'full', founder_ops: 'view', user_crm: 'view' } as Record<string, Permission>,
    actions: { view_transactions: true, view_amounts: true, issue_refunds: true, export_csv: true, view_mrr: true, view_metrics: true, view_users: true, view_billing: true },
    data: { email_addresses: true, revenue_numbers: true, billing_details: true },
  },
  {
    id: 'affiliate_manager',
    label: 'Affiliate Manager',
    icon: Users,
    desc: 'Manages affiliate program and payouts',
    color: C.amber,
    permissions: { affiliate_vault: 'full' } as Record<string, Permission>,
    actions: { view_affiliates: true, approve_payouts: true, reject_payouts: true, export_affiliates: true },
    data: { email_addresses: true, full_names: true },
  },
]

// ── Default helpers ────────────────────────────────────────────
function defaultPerms(): Record<string, Permission> {
  const p: Record<string, Permission> = {}
  ALL_TABS.forEach(t => { p[t.key] = 'none' })
  return p
}

interface Role {
  id:                   string
  role_name:            string
  is_system_role:       boolean
  permissions?:         Record<string, Permission>
  action_permissions?:  Record<string, boolean>
  section_permissions?: Record<string, boolean>
  data_permissions?:    Record<string, boolean>
  access_restrictions?: {
    time_restricted?: boolean
    start_hour?: number
    end_hour?: number
    ip_whitelist?: string[]
    expires_at?: string
  }
}

// ── Sub-tab types ──────────────────────────────────────────────
type SubTab = 'tabs' | 'actions' | 'sections' | 'data' | 'restrictions' | 'audit'

export interface PermissionRole { id: string; role_name: string; is_system_role: boolean; permissions?: Record<string, any>; action_permissions?: Record<string, boolean>; section_permissions?: Record<string, boolean>; data_permissions?: Record<string, boolean>; access_restrictions?: any }

export default function PermissionBuilderTab({ selectedRole: propRole }: { selectedRole?: PermissionRole | null }) {
  const supabase = createClient()
  const [roles, setRoles]           = useState<Role[]>([])
  const [_selectedRole, _setSelectedRole] = useState<Role | null>(null)
  const selectedRole = propRole as Role | null ?? _selectedRole
  const [subTab, setSubTab]         = useState<SubTab>('tabs')
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [dirty, setDirty]           = useState(false)
  const [toast, setToast]           = useState<string | null>(null)
  const [members, setMembers]       = useState<{ id: string; name: string | null; email: string; role_id: string | null }[]>([])
  const [auditLogs, setAuditLogs]   = useState<any[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [showCopyMenu, setShowCopyMenu] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  // Permission states
  const [perms, setPerms]           = useState<Record<string, Permission>>(defaultPerms())
  const [actionPerms, setActionPerms] = useState<Record<string, boolean>>({})
  const [sectionPerms, setSectionPerms] = useState<Record<string, boolean>>({})
  const [dataPerms, setDataPerms]   = useState<Record<string, boolean>>({})
  const [restrictions, setRestrictions] = useState<Role['access_restrictions']>({})

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: rolesData }, { data: membersData }] = await Promise.all([
        (supabase.from('admin_roles') as any).select('*').order('is_system_role', { ascending: false }).order('created_at', { ascending: true }),
        supabase.from('profiles').select('id, name, email, role_id').not('role_id', 'is', null),
      ])
      setRoles(rolesData ?? [])
      setMembers((membersData ?? []) as any)
    } catch {}
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  function selectRole(role: Role) {
    _setSelectedRole(role)
    const isSuper = role.is_system_role && role.role_name === 'Super Admin'
    if (isSuper) {
      const allFull = defaultPerms()
      ALL_TABS.forEach(t => { allFull[t.key] = 'full' })
      setPerms(allFull)
      const allActions: Record<string, boolean> = {}
      Object.values(TAB_ACTIONS).flat().forEach(a => { allActions[a.key] = true })
      setActionPerms(allActions)
      const allSections: Record<string, boolean> = {}
      Object.values(TAB_SECTIONS).flat().forEach(s => { allSections[s.key] = true })
      setSectionPerms(allSections)
      const allData: Record<string, boolean> = {}
      DATA_FIELDS.forEach(d => { allData[d.key] = true })
      setDataPerms(allData)
    } else {
      setPerms({ ...defaultPerms(), ...(role.permissions ?? {}) })
      setActionPerms(role.action_permissions ?? {})
      setSectionPerms(role.section_permissions ?? {})
      setDataPerms(role.data_permissions ?? {})
      setRestrictions(role.access_restrictions ?? {})
    }
    setDirty(false)
    setSubTab('tabs')
    setShowCopyMenu(false)
    setActiveTemplate(null)
  }

  async function loadAudit() {
    if (!selectedRole) return
    setLoadingAudit(true)
    try {
      const roleMemberIds = members.filter(m => m.role_id === selectedRole.id).map(m => m.id)
      if (roleMemberIds.length === 0) { setAuditLogs([]); setLoadingAudit(false); return }
      const { data } = await (supabase.from('admin_audit_log') as any)
        .select('*')
        .in('admin_id', roleMemberIds)
        .order('created_at', { ascending: false })
        .limit(50)
      setAuditLogs(data ?? [])
    } catch {}
    setLoadingAudit(false)
  }

  useEffect(() => { if (subTab === 'audit') loadAudit() }, [subTab, selectedRole])

  async function save() {
    await saveWithData(perms, actionPerms, dataPerms)
  }

  async function applyTemplate(template: typeof TEMPLATES[0]) {
    const newPerms   = { ...defaultPerms(), ...template.permissions }
    const newActions = template.actions as unknown as Record<string, boolean>
    const newData    = template.data as unknown as Record<string, boolean>
    setPerms(newPerms)
    setActionPerms(newActions)
    setDataPerms(newData)
    setActiveTemplate(template.id)
    setDirty(false)
    // Save immediately with the new data directly
    await saveWithData(newPerms, newActions, newData)
    showToast(`${template.label} template applied and saved ✓`)
  }

  async function saveWithData(
    newPerms: Record<string, any>,
    newActions: Record<string, boolean>,
    newData: Record<string, boolean>
  ) {
    if (!selectedRole) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin-roles', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          id:                  selectedRole.id,
          permissions:         newPerms,
          action_permissions:  newActions,
          section_permissions: sectionPerms,
          data_permissions:    newData,
          access_restrictions: restrictions,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: newPerms, action_permissions: newActions, data_permissions: newData } : r))
      setSaved(true); setTimeout(() => setSaved(false), 2000)
      setDirty(false)
      showToast('Permissions saved ✓')
    } catch (e: any) { showToast(`Error: ${e.message}`) }
    setSaving(false)
  }

  function copyFromRole(roleId: string) {
    const source = roles.find(r => r.id === roleId)
    if (!source) return
    setPerms({ ...defaultPerms(), ...(source.permissions ?? {}) })
    setActionPerms(source.action_permissions ?? {})
    setSectionPerms(source.section_permissions ?? {})
    setDataPerms(source.data_permissions ?? {})
    setDirty(true)
    showToast(`Copied from ${source.role_name}`)
  }

  const isSuper       = selectedRole?.is_system_role && selectedRole?.role_name === 'Super Admin'
  const roleMembers   = members.filter(m => m.role_id === selectedRole?.id)
  const fullCount     = Object.values(perms).filter(p => p === 'full').length
  const viewCount     = Object.values(perms).filter(p => p === 'view').length
  const actionCount   = Object.values(actionPerms).filter(Boolean).length
  const dataCount     = Object.values(dataPerms).filter(Boolean).length

  const SUB_TABS: { key: SubTab; label: string; icon: any; count?: number }[] = [
    { key: 'tabs',         label: 'Tab access',     icon: Settings,  count: fullCount + viewCount },
    { key: 'actions',      label: 'Actions',        icon: Zap,       count: actionCount },
    { key: 'sections',     label: 'Sections',       icon: Eye,       count: Object.values(sectionPerms).filter(Boolean).length },
    { key: 'data',         label: 'Data visibility', icon: EyeOff,   count: dataCount },
    { key: 'restrictions', label: 'Restrictions',   icon: Clock      },
    { key: 'audit',        label: 'Audit log',      icon: Activity   },
  ]

  function RadioBtn({ current, value, onChange }: { current: Permission; value: Permission; onChange: () => void }) {
    const sel = current === value
    const cfg = {
      none: { b: C.border, bg: 'transparent', d: C.muted },
      view: { b: C.blue,   bg: C.blueBg,      d: C.blue  },
      full: { b: C.green,  bg: C.greenBg,     d: C.green },
    }
    const s = cfg[value]
    return (
      <div onClick={!isSuper ? onChange : undefined}
           style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${sel ? s.b : C.border}`, background: sel ? s.bg : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isSuper ? 'not-allowed' : 'pointer', opacity: isSuper && value !== 'full' ? 0.3 : 1 }}>
        {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.d }}/>}
      </div>
    )
  }

  function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
      <div onClick={!disabled ? onChange : undefined}
           style={{ width: 34, height: 18, borderRadius: 100, background: checked ? C.lime : C.border, position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, transition: 'background .2s', opacity: disabled ? 0.5 : 1 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.surface, position: 'absolute', top: 3, left: checked ? 19 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: C.dark, border: `1px solid ${C.lime}`, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <Check size={14} style={{ color: C.lime }}/><span style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>Permission Builder</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Full granular control over what each role can access and do</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          {selectedRole && !isSuper && (
            <button onClick={save} disabled={saving}
                    style={{ fontSize: 12, fontWeight: 900, background: dirty ? (saved ? C.limeDeep : C.lime) : C.border, color: dirty ? C.dark : C.muted, border: 'none', borderRadius: 8, padding: '6px 16px', cursor: dirty ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 5 }}>
              {saving ? <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }}/>Saving...</> : saved ? <><Check size={12}/>Saved!</> : <><Save size={12}/>Save all</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }}>

        {/* Permission editor */}
        {selectedRole ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Role header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 12 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 900, color: C.text, margin: '0 0 2px' }}>{selectedRole.role_name}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: C.green, background: C.greenBg, border: `0.5px solid ${C.greenBorder}`, borderRadius: 100, padding: '2px 8px' }}>{fullCount} full</span>
                  <span style={{ fontSize: 11, color: C.blue, background: C.blueBg, border: `0.5px solid ${C.blueBorder}`, borderRadius: 100, padding: '2px 8px' }}>{viewCount} view</span>
                  <span style={{ fontSize: 11, color: C.purple, background: C.purpleBg, border: `0.5px solid ${C.purpleBorder}`, borderRadius: 100, padding: '2px 8px' }}>{actionCount} actions</span>
                  <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 100, padding: '2px 8px' }}>{dataCount} data fields</span>
                  {roleMembers.length > 0 && <span style={{ fontSize: 11, color: C.amber, background: C.amberBg, border: `0.5px solid ${C.amberBorder}`, borderRadius: 100, padding: '2px 8px' }}>{roleMembers.length} members</span>}
                </div>
              </div>
              {!isSuper && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {/* Copy from dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowCopyMenu(s => !s)}
                      style={{ fontSize: 11, fontWeight: 600, height: 30, padding: '0 12px', borderRadius: 8, border: `0.5px solid ${C.border}`, color: C.muted, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Copy size={11}/> Copy from...
                    </button>
                    {showCopyMenu && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowCopyMenu(false)}/>
                        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 6, zIndex: 50, minWidth: 180, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                          {roles.filter(r => r.id !== selectedRole?.id).map(r => (
                            <button key={r.id}
                                    onClick={() => { copyFromRole(r.id); setShowCopyMenu(false) }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: 12, color: C.text, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.limeTint }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                              <Shield size={12} style={{ color: C.muted, flexShrink: 0 }}/>
                              {r.role_name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Super Admin warning */}
            {isSuper && (
              <div style={{ padding: '10px 14px', background: C.amberBg, border: `0.5px solid ${C.amberBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={14} style={{ color: C.amber, flexShrink: 0 }}/>
                <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>Super Admin always has full access to everything and cannot be restricted.</span>
              </div>
            )}

            {/* Templates */}
            {!isSuper && subTab === 'tabs' && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 8px' }}>Quick templates</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TEMPLATES.map(t => {
                    const isActive = activeTemplate === t.id
                    return (
                      <button key={t.id} onClick={() => applyTemplate(t)}
                              style={{ padding: '6px 12px', borderRadius: 100, border: `0.5px solid ${isActive ? t.color : C.border}`, background: isActive ? `${t.color}15` : C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s', flexShrink: 0 }}>
                        <t.icon size={12} style={{ color: t.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? t.color : C.text }}>{t.label}</span>
                        {isActive && <Check size={10} style={{ color: t.color }}/>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sub tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: `0.5px solid ${C.border}`, paddingBottom: 0 }}>
              {SUB_TABS.map(st => {
                const isAct = subTab === st.key
                return (
                  <button key={st.key} onClick={() => setSubTab(st.key)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: '8px 8px 0 0', border: 'none', borderBottom: isAct ? `2px solid ${C.lime}` : '2px solid transparent', background: isAct ? C.limeTint : 'transparent', color: isAct ? C.dark : C.muted, fontSize: 12, fontWeight: isAct ? 700 : 500, cursor: 'pointer' }}>
                    <st.icon size={13}/>
                    {st.label}
                    {st.count !== undefined && st.count > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: isAct ? C.lime : C.border, color: isAct ? C.dark : C.muted, borderRadius: 100, padding: '0 5px', minWidth: 16, textAlign: 'center' }}>{st.count}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── TAB ACCESS ── */}
            {subTab === 'tabs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!isSuper && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 12, color: C.muted, alignSelf: 'center' }}>Set all:</span>
                    {(['none', 'view', 'full'] as Permission[]).map(v => (
                      <button key={v} onClick={() => { const p = defaultPerms(); ALL_TABS.forEach(t => { p[t.key] = v }); setPerms(p); setDirty(true) }}
                              style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, border: `0.5px solid ${v === 'full' ? C.greenBorder : v === 'view' ? C.blueBorder : C.border}`, background: v === 'full' ? C.greenBg : v === 'view' ? C.blueBg : C.bg, color: v === 'full' ? C.green : v === 'view' ? C.blue : C.muted, cursor: 'pointer' }}>
                        {v === 'none' ? 'No access' : v === 'view' ? 'View only' : 'Full access'}
                      </button>
                    ))}
                    <button onClick={() => { setPerms(defaultPerms()); setDirty(true) }}
                            style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, border: `0.5px solid ${C.redBorder}`, background: C.redBg, color: C.red, cursor: 'pointer' }}>
                      Reset all
                    </button>
                  </div>
                )}
                <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px', padding: '8px 14px', background: C.bg, borderBottom: `0.5px solid ${C.border}` }}>
                    {['Tab', 'No access', 'View only', 'Full access'].map((h, i) => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, color: i === 2 ? C.blue : i === 3 ? C.green : C.muted, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: i > 0 ? 'center' : 'left' }}>{h}</span>
                    ))}
                  </div>
                  {ALL_TABS.map((tab, i) => {
                    const perm = perms[tab.key] || 'none'
                    return (
                      <div key={tab.key} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px', padding: '9px 14px', borderBottom: i < ALL_TABS.length - 1 ? `0.5px solid ${C.border}` : 'none', alignItems: 'center', background: perm === 'full' ? '#f0fdf4' : perm === 'view' ? '#eff6ff' : 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, color: C.text, fontWeight: perm !== 'none' ? 600 : 400 }}>{tab.label}</span>
                          {perm === 'view' && <span style={{ fontSize: 9, color: C.blue, background: C.blueBg, border: `0.5px solid ${C.blueBorder}`, borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>VIEW</span>}
                          {perm === 'none' && <span style={{ fontSize: 9, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: '1px 5px' }}>HIDDEN</span>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}><RadioBtn current={perm} value="none" onChange={() => { setPerms(p => ({ ...p, [tab.key]: 'none' })); setDirty(true) }}/></div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}><RadioBtn current={perm} value="view" onChange={() => { setPerms(p => ({ ...p, [tab.key]: 'view' })); setDirty(true) }}/></div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}><RadioBtn current={perm} value="full" onChange={() => { setPerms(p => ({ ...p, [tab.key]: 'full' })); setDirty(true) }}/></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── ACTIONS ── */}
            {subTab === 'actions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(TAB_ACTIONS).map(([tabKey, actions]) => {
                  const tabPerm = perms[tabKey]
                  if (tabPerm === 'none') return null
                  const tabLabel = ALL_TABS.find(t => t.key === tabKey)?.label ?? tabKey
                  return (
                    <div key={tabKey} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: C.bg, borderBottom: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{tabLabel}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { const u = { ...actionPerms }; actions.forEach(a => { u[a.key] = true }); setActionPerms(u); setDirty(true) }}
                                  style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, border: `0.5px solid ${C.greenBorder}`, background: C.greenBg, color: C.green, cursor: 'pointer' }}>All on</button>
                          <button onClick={() => { const u = { ...actionPerms }; actions.forEach(a => { u[a.key] = false }); setActionPerms(u); setDirty(true) }}
                                  style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, border: `0.5px solid ${C.redBorder}`, background: C.redBg, color: C.red, cursor: 'pointer' }}>All off</button>
                        </div>
                      </div>
                      {actions.map((action, i) => (
                        <div key={action.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < actions.length - 1 ? `0.5px solid ${C.border}` : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: C.text }}>{action.label}</span>
                            {action.danger && <span style={{ fontSize: 9, fontWeight: 700, color: C.red, background: C.redBg, border: `0.5px solid ${C.redBorder}`, borderRadius: 4, padding: '1px 5px' }}>DANGER</span>}
                          </div>
                          <Toggle checked={!!actionPerms[action.key]} onChange={() => { setActionPerms(p => ({ ...p, [action.key]: !p[action.key] })); setDirty(true) }} disabled={isSuper}/>
                        </div>
                      ))}
                    </div>
                  )
                })}
                {Object.entries(TAB_ACTIONS).every(([k]) => perms[k] === 'none') && (
                  <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>
                    No tabs have access — enable tab access first
                  </div>
                )}
              </div>
            )}

            {/* ── SECTIONS ── */}
            {subTab === 'sections' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(TAB_SECTIONS).map(([tabKey, sections]) => {
                  const tabPerm = perms[tabKey]
                  if (tabPerm === 'none') return null
                  const tabLabel = ALL_TABS.find(t => t.key === tabKey)?.label ?? tabKey
                  return (
                    <div key={tabKey} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: C.bg, borderBottom: `0.5px solid ${C.border}` }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{tabLabel} — visible sections</p>
                      </div>
                      {sections.map((section, i) => (
                        <div key={section.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < sections.length - 1 ? `0.5px solid ${C.border}` : 'none' }}>
                          <span style={{ fontSize: 13, color: C.text }}>{section.label}</span>
                          <Toggle checked={sectionPerms[section.key] !== false} onChange={() => { setSectionPerms(p => ({ ...p, [section.key]: !p[section.key] })); setDirty(true) }} disabled={isSuper}/>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── DATA VISIBILITY ── */}
            {subTab === 'data' && (
              <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', background: C.bg, borderBottom: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Visible data fields</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Control what sensitive data this role can see</p>
                </div>
                {DATA_FIELDS.map((field, i) => (
                  <div key={field.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: i < DATA_FIELDS.length - 1 ? `0.5px solid ${C.border}` : 'none' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 1px' }}>{field.label}</p>
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{field.desc}</p>
                    </div>
                    <Toggle checked={!!dataPerms[field.key]} onChange={() => { setDataPerms(p => ({ ...p, [field.key]: !p[field.key] })); setDirty(true) }} disabled={isSuper}/>
                  </div>
                ))}
              </div>
            )}

            {/* ── RESTRICTIONS ── */}
            {subTab === 'restrictions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Time restriction */}
                <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', borderBottom: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Clock size={16} style={{ color: C.muted }}/>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 1px' }}>Time-based access</p>
                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Restrict access to business hours only</p>
                      </div>
                    </div>
                    <Toggle checked={!!restrictions?.time_restricted} onChange={() => { setRestrictions(r => ({ ...r, time_restricted: !r?.time_restricted })); setDirty(true) }} disabled={isSuper}/>
                  </div>
                  {restrictions?.time_restricted && (
                    <div style={{ padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: C.muted }}>Access hours:</span>
                      <input type="number" min={0} max={23} value={restrictions?.start_hour ?? 9}
                             onChange={e => { setRestrictions(r => ({ ...r, start_hour: Number(e.target.value) })); setDirty(true) }}
                             style={{ width: 60, height: 32, fontSize: 13, padding: '0 8px', borderRadius: 8, border: `0.5px solid ${C.border}`, outline: 'none', textAlign: 'center' }}/>
                      <span style={{ fontSize: 12, color: C.muted }}>to</span>
                      <input type="number" min={0} max={23} value={restrictions?.end_hour ?? 18}
                             onChange={e => { setRestrictions(r => ({ ...r, end_hour: Number(e.target.value) })); setDirty(true) }}
                             style={{ width: 60, height: 32, fontSize: 13, padding: '0 8px', borderRadius: 8, border: `0.5px solid ${C.border}`, outline: 'none', textAlign: 'center' }}/>
                      <span style={{ fontSize: 12, color: C.muted }}>(24h format, UTC)</span>
                    </div>
                  )}
                </div>

                {/* IP whitelist */}
                <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Globe size={16} style={{ color: C.muted }}/>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 1px' }}>IP whitelist</p>
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Only allow access from specific IP addresses (one per line)</p>
                    </div>
                  </div>
                  <textarea
                    value={(restrictions?.ip_whitelist ?? []).join('\n')}
                    onChange={e => { setRestrictions(r => ({ ...r, ip_whitelist: e.target.value.split('\n').filter(ip => ip.trim()) })); setDirty(true) }}
                    placeholder="192.168.1.1&#10;10.0.0.0/24&#10;Leave empty to allow all IPs"
                    rows={4}
                    disabled={isSuper}
                    style={{ width: '100%', fontSize: 12, padding: '8px 12px', borderRadius: 8, border: `0.5px solid ${C.border}`, outline: 'none', color: C.text, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Expiry */}
                <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Clock size={16} style={{ color: C.muted }}/>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 1px' }}>Access expiry</p>
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Automatically revoke access after a date (great for freelancers)</p>
                    </div>
                  </div>
                  <input type="date"
                         value={restrictions?.expires_at ? restrictions.expires_at.split('T')[0] : ''}
                         onChange={e => { setRestrictions(r => ({ ...r, expires_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })); setDirty(true) }}
                         disabled={isSuper}
                         style={{ height: 36, fontSize: 13, padding: '0 12px', borderRadius: 8, border: `0.5px solid ${C.border}`, outline: 'none', color: C.text, fontFamily: 'Inter, sans-serif' }}/>
                  {restrictions?.expires_at && (
                    <button onClick={() => { setRestrictions(r => ({ ...r, expires_at: undefined })); setDirty(true) }}
                            style={{ marginLeft: 8, fontSize: 11, color: C.red, background: C.redBg, border: `0.5px solid ${C.redBorder}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                      Remove expiry
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── AUDIT LOG ── */}
            {subTab === 'audit' && (
              <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', background: C.bg, borderBottom: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Admin actions by members of this role</p>
                  <button onClick={loadAudit} style={{ fontSize: 11, color: C.muted, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RefreshCw size={12} className={loadingAudit ? 'animate-spin' : ''}/> Refresh
                  </button>
                </div>
                {loadingAudit ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <RefreshCw size={20} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>
                    {roleMembers.length === 0 ? 'No members assigned to this role yet' : 'No audit log entries yet'}
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 100px', padding: '8px 14px', background: C.bg, borderBottom: `0.5px solid ${C.border}` }}>
                      {['Action', 'Tab', 'Admin', 'Date'].map(h => (
                        <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
                      ))}
                    </div>
                    {auditLogs.map((log, i) => (
                      <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 100px', padding: '10px 14px', borderBottom: i < auditLogs.length - 1 ? `0.5px solid ${C.border}` : 'none', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime, flexShrink: 0 }}/>
                          <span style={{ fontSize: 12, color: C.text }}>{log.action}</span>
                        </div>
                        <span style={{ fontSize: 11, color: C.muted }}>{log.tab || '—'}</span>
                        <span style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.admin_email || '—'}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} style={{ color: C.muted }}/>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>Select a role</p>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, textAlign: 'center' }}>Choose a role from the sidebar</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
