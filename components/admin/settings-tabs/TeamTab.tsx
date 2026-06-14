'use client'
// components/settings/TeamTab.tsx
// ─────────────────────────────────────────────────────────────
// Team management tab in user Settings page
// Owner can: invite members, see team, remove members
// Member can: see whose team they're in, leave team
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClient }         from '@/lib/supabase'
import {
  Users, Mail, Plus, X, Crown, Eye,
  ShieldCheck, Zap, Clock, CheckCircle,
  AlertTriangle, Copy, UserMinus, LogOut,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#0a0d08',
  text:     '#1a2410',
  muted:    '#6b7280',
  border:   '#e8ede2',
  surface:  '#fafcf8',
  bg:       '#f7f9f5',
  red:      '#b91c1c',
  amber:    '#d97706',
  green:    '#16a34a',
}

// ── Role config ───────────────────────────────────────────────
const ROLES = [
  {
    key:   'viewer',
    label: 'Viewer',
    desc:  'Can view orders and tools — cannot make changes',
    Icon:  Eye,
    color: '#1d70f5',
    bg:    '#EFF6FF',
  },
  {
    key:   'order_manager',
    label: 'Order Manager',
    desc:  'Can view and manage orders — cannot change settings',
    Icon:  ShieldCheck,
    color: C.limeDeep,
    bg:    C.limeTint,
  },
  {
    key:   'full_access',
    label: 'Full Access',
    desc:  'Full access to all tools — cannot see billing',
    Icon:  Zap,
    color: '#8b5cf6',
    bg:    '#F5F3FF',
  },
]

// ── Plan limits ───────────────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = {
  'free trial': 0,
  'pro plan':   3,
  'elite plan': 10,
}

function roleCfg(role: string) {
  return ROLES.find(r => r.key === role) ?? ROLES[0]
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function TeamTab() {
  const supabase = createClient()

  const [profile,       setProfile]       = useState<any>(null)
  const [members,       setMembers]       = useState<any[]>([])
  const [invites,       setInvites]       = useState<any[]>([])
  const [myTeams,       setMyTeams]       = useState<any[]>([])   // teams I'm a member of
  const [loading,       setLoading]       = useState(true)
  const [inviteEmail,   setInviteEmail]   = useState('')
  const [inviteRole,    setInviteRole]    = useState('viewer')
  const [sending,       setSending]       = useState(false)
  const [removing,      setRemoving]      = useState<string|null>(null)
  const [editingRole,   setEditingRole]   = useState<string|null>(null)  // member_id being edited
  const [newRole,       setNewRole]       = useState('viewer')
  const [toast,         setToast]         = useState<{ msg:string; ok:boolean }|null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load all data ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Profile
        const { data: prof } = await supabase
          .from('profiles').select('*').eq('id', user.id).single()
        setProfile(prof)

        // My team members (I am the owner)
        const { data: membersRaw } = await (supabase.from('team_members') as any)
          .select('*, member:member_id(id, name, email, avatar_url)')
          .eq('owner_id', user.id)
          .eq('status', 'active')
          .order('joined_at', { ascending: false })
        setMembers(membersRaw ?? [])

        // My pending + expired invites
        const { data: invitesRaw } = await (supabase.from('team_invites') as any)
          .select('*')
          .eq('owner_id', user.id)
          .in('status', ['pending', 'expired'])
          .order('created_at', { ascending: false })
        setInvites(invitesRaw ?? [])

        // Teams I belong to (I am a member)
        const { data: myTeamsRaw } = await (supabase.from('team_members') as any)
          .select('*, owner:owner_id(id, name, email, avatar_url, plan_name)')
          .eq('member_id', user.id)
          .eq('status', 'active')
        setMyTeams(myTeamsRaw ?? [])

      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  // ── Send invite ───────────────────────────────────────────
  async function sendInvite() {
    if (!inviteEmail.trim()) return
    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res  = await fetch('/api/team/invite', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      showToast(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')

      // Refresh invites list
      const { data: { user } } = await supabase.auth.getUser()
      const { data: inv } = await (supabase.from('team_invites') as any)
        .select('*').eq('owner_id', user!.id).eq('status', 'pending')
        .order('created_at', { ascending: false })
      setInvites(inv ?? [])

    } catch (e: any) { showToast(e.message ?? 'Failed to send invite', false) }
    setSending(false)
  }

  // ── Remove member ─────────────────────────────────────────
  async function removeMember(memberId: string, ownerIdParam?: string) {
    setRemoving(memberId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res  = await fetch('/api/team/remove', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ownerId:  ownerIdParam ?? profile?.id,
          memberId,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      showToast(json.message)
      setMembers(m => m.filter(x => x.member_id !== memberId))
      setMyTeams(t => t.filter(x => x.owner_id !== ownerIdParam))
    } catch (e: any) { showToast(e.message ?? 'Failed to remove', false) }
    setRemoving(null)
  }

  // ── Update member role ──────────────────────────────────
  async function updateRole(memberId: string, role: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await (supabase.from('team_members') as any)
        .update({ role })
        .eq('owner_id', user!.id)
        .eq('member_id', memberId)
      setMembers(m => m.map(x => x.member_id === memberId ? { ...x, role } : x))
      setEditingRole(null)
      showToast('Role updated')
    } catch { showToast('Failed to update role', false) }
  }

  // ── Cancel invite ─────────────────────────────────────────
  async function cancelInvite(inviteId: string) {
    try {
      await (supabase.from('team_invites') as any)
        .update({ status: 'expired' }).eq('id', inviteId)
      setInvites(i => i.filter(x => x.id !== inviteId))
      showToast('Invite cancelled')
    } catch { showToast('Failed to cancel invite', false) }
  }

  // ── Plan info ─────────────────────────────────────────────
  const plan      = ((profile?.plan_name ?? 'free trial') as string).toLowerCase()
  const limit     = PLAN_LIMITS[plan] ?? 0
  const used      = members.length
  const remaining = Math.max(0, limit - used)

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-transparent animate-spin"
           style={{ borderTopColor: C.limeDeep }} />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: toast.ok ? C.dark : '#FEF2F2',
                      border: `1px solid ${toast.ok ? C.lime : '#fecaca'}` }}>
          {toast.ok
            ? <CheckCircle size={15} style={{ color: C.lime }} />
            : <AlertTriangle size={15} style={{ color: C.red }} />}
          <p className="text-[13px] font-semibold"
             style={{ color: toast.ok ? C.lime : C.red }}>
            {toast.msg}
          </p>
        </div>
      )}

      {/* ── HEADER ── */}
      <div>
        <h2 className="text-[20px] font-black" style={{ color: C.dark }}>Team</h2>
        <p className="text-[13px] mt-0.5" style={{ color: C.muted }}>
          Invite team members to manage your account
        </p>
      </div>

      {/* ── PLAN LIMIT BANNER ── */}
      <div className="p-4 rounded-2xl border flex items-center justify-between"
           style={{ borderColor: C.border, backgroundColor: C.surface }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: C.limeTint }}>
            <Users size={18} style={{ color: C.limeDeep }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: C.dark }}>
              {used} of {limit} team member{limit !== 1 ? 's' : ''} used
            </p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
              {limit === 0 ? ' — upgrade to invite team members' : ` — ${remaining} slot${remaining !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
        </div>
        {/* Progress dots */}
        {limit > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full"
                   style={{ backgroundColor: i < used ? C.limeDeep : C.border }} />
            ))}
          </div>
        )}
      </div>

      {/* ── INVITE FORM ── */}
      {limit > 0 && remaining > 0 && (
        <div className="p-5 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <p className="text-[13px] font-black mb-4" style={{ color: C.dark }}>
            Invite a Team Member
          </p>

          {/* Email input */}
          <div className="mb-3">
            <label className="text-[11px] font-bold block mb-1.5" style={{ color: C.muted }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendInvite()}
              placeholder="freelancer@gmail.com"
              className="w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}
            />
          </div>

          {/* Role selector */}
          <div className="mb-4">
            <label className="text-[11px] font-bold block mb-1.5" style={{ color: C.muted }}>
              ROLE
            </label>
            <div className="flex flex-col gap-2">
              {ROLES.map(r => {
                const active = inviteRole === r.key
                return (
                  <button key={r.key} onClick={() => setInviteRole(r.key)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                    style={{
                      backgroundColor: active ? r.bg      : 'transparent',
                      borderColor:     active ? r.color   : C.border,
                    }}>
                    <r.Icon size={15} style={{ color: active ? r.color : C.muted }} />
                    <div>
                      <p className="text-[12px] font-bold"
                         style={{ color: active ? r.color : C.text }}>{r.label}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>{r.desc}</p>
                    </div>
                    {active && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center ml-auto shrink-0"
                           style={{ backgroundColor: r.color }}>
                        <CheckCircle size={10} style={{ color: '#fff' }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <button onClick={sendInvite} disabled={!inviteEmail.trim() || sending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            {sending
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                     style={{ borderTopColor: C.lime }} />
              : <><Mail size={14} /> Send Invite</>}
          </button>
        </div>
      )}

      {/* Upgrade prompt for free trial */}
      {limit === 0 && (
        <div className="p-5 rounded-2xl border text-center"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <Crown size={28} style={{ color: C.amber, margin: '0 auto 8px' }} />
          <p className="text-[14px] font-bold mb-1" style={{ color: C.dark }}>
            Team members require Pro or Elite
          </p>
          <p className="text-[12px] mb-4" style={{ color: C.muted }}>
            Upgrade your plan to invite freelancers and team members
          </p>
          <a href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            Upgrade Plan →
          </a>
        </div>
      )}

      {/* ── PENDING INVITES ── */}
      {invites.filter(i => i.status === 'pending').length > 0 && (
        <div>
          <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>
            PENDING INVITES ({invites.filter(i => i.status === 'pending').length})
          </p>
          <div className="flex flex-col gap-2">
            {invites.filter(i => i.status === 'pending').map(inv => {
              const rc = roleCfg(inv.role)
              const daysLeft = Math.max(0, Math.ceil(
                (new Date(inv.expires_at).getTime() - Date.now()) / 86400000
              ))
              return (
                <div key={inv.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ borderColor: C.border, backgroundColor: C.bg }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: rc.bg }}>
                    <Mail size={14} style={{ color: rc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: C.dark }}>{inv.email}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: rc.bg, color: rc.color }}>{rc.label}</span>
                      <span className="text-[10px]" style={{ color: C.muted }}>
                        <Clock size={9} className="inline mr-0.5" />Expires in {daysLeft}d
                      </span>
                    </div>
                  </div>
                  <button onClick={() => cancelInvite(inv.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50"
                    title="Cancel invite">
                    <X size={13} style={{ color: C.muted }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── EXPIRED INVITES ── */}
      {invites.filter(i => i.status === 'expired').length > 0 && (
        <div>
          <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>
            EXPIRED INVITES ({invites.filter(i => i.status === 'expired').length})
          </p>
          <div className="flex flex-col gap-2">
            {invites.filter(i => i.status === 'expired').map(inv => {
              const rc = roleCfg(inv.role)
              return (
                <div key={inv.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ borderColor: C.border, backgroundColor: '#fafafa', opacity: 0.8 }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: '#f3f4f6' }}>
                    <Mail size={14} style={{ color: C.muted }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: C.muted }}>{inv.email}</p>
                    <span className="text-[10px]" style={{ color: C.muted }}>Expired · {rc.label}</span>
                  </div>
                  <button
                    onClick={() => { setInviteEmail(inv.email); setInviteRole(inv.role) }}
                    className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold hover:opacity-80"
                    style={{ borderColor: C.lime, color: C.limeDeep, backgroundColor: C.limeTint }}>
                    Resend
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ACTIVE TEAM MEMBERS ── */}
      {members.length > 0 && (
        <div>
          <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>
            TEAM MEMBERS ({members.length})
          </p>
          <div className="flex flex-col gap-2">
            {members.map(m => {
              const rc  = roleCfg(m.role)
              const mem = m.member ?? {}
              const initials = ((mem.name ?? mem.email ?? 'U') as string)
                .split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={m.id} className="flex flex-col">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                       style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                  {/* Avatar */}
                  {mem.avatar_url
                    ? <img src={mem.avatar_url} alt={mem.name}
                           className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    : <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-bold text-white"
                           style={{ backgroundColor: C.limeDeep }}>
                        {initials}
                      </div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: C.dark }}>
                      {mem.name ?? mem.email}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: rc.bg, color: rc.color }}>
                        {rc.label}
                      </span>
                      <span className="text-[10px]" style={{ color: C.muted }}>
                        Joined {new Date(m.joined_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(m.member_id)}
                    disabled={removing === m.member_id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold hover:opacity-80 disabled:opacity-40"
                    style={{ borderColor:'rgba(185,28,28,0.3)', color:C.red, backgroundColor:'rgba(185,28,28,0.05)' }}>
                    {removing === m.member_id
                      ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin"
                             style={{ borderTopColor: C.red }} />
                      : <><UserMinus size={11} /> Remove</>}
                  </button>
                  <button
                    onClick={() => { setEditingRole(m.member_id); setNewRole(m.role) }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold hover:opacity-80"
                    style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
                    Edit
                  </button>
                  </div>
                  {/* Edit role inline */}
                  {editingRole === m.member_id && (
                    <div className="mt-1 p-3 rounded-xl border" style={{ borderColor: C.lime, backgroundColor: C.limeTint }}>
                      <p className="text-[10px] font-black mb-2" style={{ color: C.limeDeep }}>CHANGE ROLE</p>
                      <div className="flex gap-2 flex-wrap">
                        {ROLES.map(r => (
                          <button key={r.key} onClick={() => setNewRole(r.key)}
                            className="px-2.5 py-1 rounded-lg border text-[11px] font-bold"
                            style={{
                              backgroundColor: newRole === r.key ? C.dark : C.bg,
                              borderColor:     newRole === r.key ? C.dark : C.border,
                              color:           newRole === r.key ? C.lime : C.muted,
                            }}>{r.label}</button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setEditingRole(null)}
                          className="flex-1 py-1.5 rounded-xl border text-[11px] font-semibold"
                          style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
                        <button onClick={() => updateRole(m.member_id, newRole)}
                          className="flex-1 py-1.5 rounded-xl text-[11px] font-bold"
                          style={{ backgroundColor: C.dark, color: C.lime }}>Save</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TEAMS I BELONG TO ── */}
      {myTeams.length > 0 && (
        <div>
          <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>
            ACCOUNTS I HAVE ACCESS TO
          </p>
          <div className="flex flex-col gap-2">
            {myTeams.map(t => {
              const rc    = roleCfg(t.role)
              const owner = t.owner ?? {}
              const initials = ((owner.name ?? owner.email ?? 'O') as string)
                .split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={t.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                  {owner.avatar_url
                    ? <img src={owner.avatar_url} alt={owner.name}
                           className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    : <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-bold text-white"
                           style={{ backgroundColor: '#8b5cf6' }}>
                        {initials}
                      </div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: C.dark }}>
                      {owner.name ?? owner.email}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Crown size={9} style={{ color: C.amber }} />
                      <span className="text-[10px]" style={{ color: C.muted }}>Account Owner</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: rc.bg, color: rc.color }}>
                        {rc.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(profile?.id, t.owner_id)}
                    disabled={removing === t.owner_id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold hover:opacity-80 disabled:opacity-40"
                    style={{ borderColor:'rgba(185,28,28,0.3)', color:C.red, backgroundColor:'rgba(185,28,28,0.05)' }}>
                    {removing === t.owner_id
                      ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin"
                             style={{ borderTopColor: C.red }} />
                      : <><LogOut size={11} /> Leave</>}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {limit > 0 && members.length === 0 && invites.length === 0 && myTeams.length === 0 && (
        <div className="text-center py-10">
          <Users size={36} style={{ color: C.border, margin: '0 auto 12px' }} />
          <p className="text-[14px] font-semibold" style={{ color: C.muted }}>
            No team members yet
          </p>
          <p className="text-[12px] mt-1" style={{ color: C.muted }}>
            Invite a freelancer or employee above to get started
          </p>
        </div>
      )}

    </div>
  )
}