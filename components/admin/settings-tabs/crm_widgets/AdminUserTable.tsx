'use client'
// components/admin/settings-tabs/crm_widgets/AdminUserTable.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/crm_widgets/admin_user_table.dart

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import UserDetailDrawer from './UserDetailDrawer'
import {
  User, MoreVertical, Copy, AlertTriangle,
  CloudOff, CheckCircle, Monitor, Smartphone,
} from 'lucide-react'

const C = {
  dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0',
  bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8',
}

interface Props {
  allUsers:        any[]
  isInvestorMode:  boolean
  searchQuery:     string
  selectedFilter:  string
  onUserUpdated:   (id: string, field: string, value: any) => void
}

// ── Format DB user (matches Dart _formatDatabaseUser) ─────────
function formatUser(db: any) {
  const email    = db.email ?? 'unknown@user.com'
  let name       = db.name ?? ''
  if (!name) name = email.split('@')[0]

  let joinDate = 'Today', time = 'Just Now'
  if (db.created_at) {
    try {
      const dt     = new Date(db.created_at)
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      joinDate     = `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`
      let h = dt.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'
      h = h > 12 ? h - 12 : h === 0 ? 12 : h
      time = `${h}:${dt.getMinutes().toString().padStart(2,'0')} ${ampm}`
    } catch {}
  }

  function getInitials(n: string) {
    const parts = n.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return n.length >= 2 ? n.substring(0, 2).toUpperCase() : n.toUpperCase()
  }

  let avatarUrl = db.avatar_url ?? db.avatarUrl ?? null
  const gender  = db.gender ?? ''
  if (!avatarUrl) {
    if (gender === 'Male'   || gender === 'male')   avatarUrl = 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png'
    if (gender === 'Female' || gender === 'female') avatarUrl = 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png'
  }

  return {
    id:          db.id?.toString() ?? 'Unknown',
    shortId:     db.display_id?.toString() ?? 'Generating...',
    name,
    initials:    getInitials(name),
    email,
    plan:        db.plan_name    ?? 'Free Trial',
    status:      db.account_status ?? 'Active',
    joinDate, time,
    usage:       db.usage_score ? Number(db.usage_score) : 0.5,
    dispute:     db.dispute_note ?? null,
    avatarUrl,
    platform:    db.device_platform ?? 'Unknown',
    browser:     db.browser_agent   ?? 'Browser',
    ip:          db.last_login_ip   ?? 'No IP Logged',
    deviceCount: db.device_platform && db.device_platform !== 'Unknown' ? '1' : '0',
  }
}

function statusColors(status: string) {
  if (status === 'Expired')  return { color: '#F87171', bg: 'rgba(248,113,113,0.12)' }
  if (status === 'Past Due') return { color: '#FB923C', bg: 'rgba(251,146,60,0.12)'  }
  return { color: '#16A34A', bg: 'rgba(22,163,74,0.12)' }
}

// ── Support note dialog (matches Dart _showSupportNoteDialog) ──
function SupportNoteDialog({ userId, userName, onClose, onSaved }: {
  userId: string; userName: string; onClose: () => void; onSaved: (note: string) => void
}) {
  const supabase = createClient()
  const [note, setNote]           = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSave() {
    if (!note.trim()) return
    setSubmitting(true)
    try {
      await (supabase.from('profiles') as any).update({ dispute_note: note.trim() }).eq('id', userId)
      onSaved(note.trim())
      onClose()
    } catch (e) { console.error(e) }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border" style={{ borderColor: C.border }}>
        <h3 className="text-[16px] font-bold mb-1" style={{ color: C.dark }}>Flag {userName} for Support</h3>
        <p className="text-[13px] mb-3" style={{ color: C.muted }}>Enter the specific issue or reason:</p>
        <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
          placeholder="e.g., eBay sync failing, requested refund..."
          className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none resize-none mb-5"
          style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold" style={{ color: C.hint }}>Cancel</button>
          <button onClick={handleSave} disabled={!note.trim() || submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold text-white"
            style={{ backgroundColor: C.dark }}>
            {submitting ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} /> : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Device manager dialog (matches Dart _showDeviceManagerDialog)
function DeviceManagerDialog({ userId, userName, onClose }: {
  userId: string; userName: string; onClose: () => void
}) {
  const supabase = createClient()
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('user_devices').select('*').eq('user_id', userId)
      setDevices((data ?? []) as any[])
      setLoading(false)
    }
    load()
  }, [])

  async function revokeDevice(deviceId: string) {
    await (supabase.from('user_devices') as any).delete().eq('device_id', deviceId)
    setDevices(d => d.filter(x => x.device_id !== deviceId))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[500px] border" style={{ borderColor: C.border }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[18px] font-bold" style={{ color: C.dark }}>Active Devices: {userName}</h3>
            <p className="text-[12px]" style={{ color: C.muted }}>Manage active sessions and revoke access.</p>
          </div>
          <button onClick={onClose} className="text-[13px]" style={{ color: C.hint }}>✕</button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
          </div>
        ) : devices.length === 0 ? (
          <p className="text-center py-8 text-[13px]" style={{ color: C.muted }}>No active devices found.</p>
        ) : devices.map((d, i) => {
          const isMobile = d.platform?.includes('iOS') || d.platform?.includes('Android')
          return (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border mb-3"
                 style={{ backgroundColor: d.is_current ? C.bg : '#fff', borderColor: C.border }}>
              {isMobile ? <Smartphone size={20} style={{ color: C.muted }} /> : <Monitor size={20} style={{ color: C.muted }} />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold" style={{ color: C.dark }}>{d.platform} • {d.browser}</span>
                  {d.is_current && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: 'rgba(143,255,0,0.3)', color: C.dark }}>Current</span>
                  )}
                </div>
                <p className="text-[11px]" style={{ color: C.muted }}>IP: {d.ip_address} • Last Active: {d.last_active}</p>
              </div>
              {!d.is_current && (
                <button onClick={() => revokeDevice(d.device_id)}
                  className="px-3 py-1.5 rounded-lg border text-[11px] font-bold"
                  style={{ borderColor: '#F87171', color: '#F87171' }}>Revoke</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Action buttons (matches Dart _buildActionButtons) ─────────
function ActionButtons({ user, rawUser, onUserUpdated, onOpenDrawer }: {
  user: any; rawUser: any; onUserUpdated: (id: string, f: string, v: any) => void; onOpenDrawer: () => void
}) {
  const supabase = createClient()
  const [showMenu,    setShowMenu]    = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showDevices, setShowDevices] = useState(false)

  async function changePlan(newPlan: string) {
    onUserUpdated(user.id, 'plan_name',       newPlan)
    onUserUpdated(user.id, 'account_status',  'Active')
    try {
      await (supabase.from('profiles') as any).update({ plan_name: newPlan, account_status: 'Active' }).eq('id', user.id)
    } catch { onUserUpdated(user.id, 'plan_name', user.plan) }
    setShowMenu(false)
  }

  async function updateStatus(newStatus: string, rollback: string) {
    onUserUpdated(user.id, 'account_status', newStatus)
    try {
      await (supabase.from('profiles') as any).update({ account_status: newStatus }).eq('id', user.id)
    } catch { onUserUpdated(user.id, 'account_status', rollback) }
    setShowMenu(false)
  }

  async function resolveSupport() {
    onUserUpdated(user.id, 'dispute_note', null)
    try { await (supabase.from('profiles') as any).update({ dispute_note: null }).eq('id', user.id) } catch {}
    setShowMenu(false)
  }

  const plans = ['Free Trial', 'Pro Plan', 'Elite Plan'].filter(p => p !== user.plan)
  const hasDispute = user.dispute && user.dispute.toString().trim() !== ''

  return (
    <div className="flex items-center justify-end gap-2 relative">
      {/* View profile button */}
      <button onClick={onOpenDrawer}
        title="View Detailed Profile"
        className="p-1.5 rounded-lg border"
        style={{ backgroundColor: 'rgba(143,255,0,0.10)', borderColor: C.lime }}>
        <User size={17} style={{ color: C.dark }} />
      </button>

      {/* More actions */}
      <button onClick={() => setShowMenu(s => !s)}
        className="p-1.5 rounded-lg hover:bg-gray-50">
        <MoreVertical size={19} style={{ color: C.hint }} />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-2xl border shadow-xl overflow-hidden"
               style={{ borderColor: C.border, minWidth: 200 }}>
            {/* Change plan */}
            {plans.map(p => (
              <button key={p} onClick={() => changePlan(p)}
                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-gray-50"
                style={{ color: C.dark }}>Switch to {p}</button>
            ))}
            <div className="h-px" style={{ backgroundColor: C.border }} />
            <button onClick={() => { setShowDevices(true); setShowMenu(false) }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-gray-50"
              style={{ color: C.dark }}>Manage Devices</button>
            <div className="h-px" style={{ backgroundColor: C.border }} />
            {/* Conditional actions */}
            {user.plan === 'Free Trial' && user.status !== 'Expired' && (
              <button onClick={() => updateStatus('Expired', 'Active')}
                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-gray-50"
                style={{ color: '#F87171' }}>Force Expire Trial</button>
            )}
            {!hasDispute ? (
              <button onClick={() => { setShowSupport(true); setShowMenu(false) }}
                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-gray-50"
                style={{ color: '#FB923C' }}>Flag for Support</button>
            ) : (
              <button onClick={resolveSupport}
                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-gray-50"
                style={{ color: '#16A34A' }}>Resolve Support Issue</button>
            )}
            {(user.status === 'Past Due' || user.status === 'Expired') ? (
              <button onClick={() => updateStatus('Active', user.status)}
                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-gray-50"
                style={{ color: '#60A5FA' }}>
                {user.status === 'Expired' && user.plan === 'Free Trial' ? 'Extend Trial' : 'Reactivate User'}
              </button>
            ) : (
              <button onClick={() => updateStatus('Past Due', 'Active')}
                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-gray-50"
                style={{ color: '#F87171' }}>Suspend User</button>
            )}
          </div>
        </>
      )}

      {showSupport && (
        <SupportNoteDialog userId={user.id} userName={user.name} onClose={() => setShowSupport(false)}
          onSaved={note => onUserUpdated(user.id, 'dispute_note', note)} />
      )}
      {showDevices && (
        <DeviceManagerDialog userId={user.id} userName={user.name} onClose={() => setShowDevices(false)} />
      )}
    </div>
  )
}

// ── Main table ────────────────────────────────────────────────
export default function AdminUserTable({ allUsers, isInvestorMode, searchQuery, selectedFilter, onUserUpdated }: Props) {
  const supabase = createClient()
  const [userHistories, setUserHistories] = useState<Record<string, any[]>>({})
  const [drawerUser,    setDrawerUser]    = useState<any | null>(null)

  // Preload login history for scam detector (matches Dart _preloadSecurityData)
  useEffect(() => {
    async function preload() {
      const histories: Record<string, any[]> = {}
      for (const u of allUsers) {
        if (!u.id) continue
        try {
          const { data } = await supabase.from('login_history').select('ip_address')
            .eq('user_id', u.id).order('login_at', { ascending: false }).limit(5)
          histories[u.id] = (data ?? []) as any[]
        } catch {}
      }
      setUserHistories(histories)
    }
    preload()
  }, [allUsers])

  // Filter users (matches Dart build filter logic)
  let filtered = [...allUsers]
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(u =>
      (u.name ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q)
    )
  }
  if (selectedFilter !== 'All') {
    filtered = filtered.filter(u => {
      const plan    = u.plan_name    ?? 'Free Trial'
      const status  = u.account_status ?? 'Active'
      const dispute = u.dispute_note
      if (selectedFilter === 'Active Tiers')    return status === 'Active' && plan !== 'Free Trial'
      if (selectedFilter === 'Expired Trials')  return status === 'Expired' && plan === 'Free Trial'
      if (selectedFilter === 'Past Due')        return status === 'Past Due'
      if (selectedFilter === 'Support waiting') return dispute && dispute.toString().trim() !== ''
      return true
    })
  }

  const headerStyle = "text-[11px] font-bold tracking-wider"

  return (
    <div className="w-full rounded-2xl border overflow-hidden"
         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>

      {/* ── Desktop table ── */}
      <div className="hidden xl:block overflow-x-auto">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <div style={{ flex: 30 }}>
            <span className="text-[11px] font-bold tracking-wider" style={{ color: C.hint }}>USER</span>
          </div>
          <div style={{ flex: 15 }}><span className="text-[11px] font-bold tracking-wider" style={{ color: C.hint }}>PLAN / STATUS</span></div>
          <div style={{ flex: 15 }}><span className="text-[11px] font-bold tracking-wider" style={{ color: C.hint }}>JOINED</span></div>
          <div style={{ flex: 15 }}><span className="text-[11px] font-bold tracking-wider" style={{ color: C.hint }}>LOCATION</span></div>
          <div style={{ flex: 20 }}><span className="text-[11px] font-bold tracking-wider" style={{ color: C.hint }}>PLATFORM & ID</span></div>
          <div style={{ flex: 10 }}><span className="text-[11px] font-bold tracking-wider" style={{ color: C.hint }}>DEVICES</span></div>
          <div style={{ flex: 10, textAlign: 'right' }}><span className="text-[11px] font-bold tracking-wider" style={{ color: C.hint }}>ACTION</span></div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <EmptyState filter={selectedFilter} />
        ) : filtered.map((dbUser, i) => {
          const user      = formatUser(dbUser)
          const sc        = statusColors(user.status)
          const history   = userHistories[user.id] ?? []
          const uniqueIps = new Set(history.map((h: any) => h.ip_address)).size
          const isHighRisk = uniqueIps > 1
          const isLiveNow  = user.deviceCount !== '0' && user.ip !== 'No IP Logged'
          const dispName   = isInvestorMode ? `${user.name.split(' ')[0]} ***` : user.name
          const dispEmail  = isInvestorMode && user.email.includes('@')
            ? `${user.email[0]}***@${user.email.split('@')[1]}` : user.email

          return (
            <div key={user.id}>
              <div className="flex items-center gap-4 px-6 py-3">
                {/* 1. User */}
                <div className="flex items-center gap-3 min-w-0" style={{ flex: 30 }}>
                  <div className="relative shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                           style={{ backgroundColor: C.lime }}>
                        <span className="text-[13px] font-extrabold" style={{ color: C.dark }}>{user.initials}</span>
                      </div>
                    )}
                    {isLiveNow && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                           style={{ backgroundColor: C.lime }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: C.dark }}>{dispName}</p>
                    <p className="text-[11px] truncate" style={{ color: C.muted }}>{dispEmail}</p>
                  </div>
                </div>

                {/* 2. Plan / Status */}
                <div style={{ flex: 15 }}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-extrabold" style={{ color: C.dark }}>{user.plan}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{ backgroundColor: sc.bg, color: sc.color }}>{user.status}</span>
                  </div>
                  {/* Usage bar */}
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ width: 80, backgroundColor: '#F1F5F9' }}>
                    <div className="h-full rounded-full" style={{ width: `${user.usage * 100}%`, backgroundColor: sc.color }} />
                  </div>
                </div>

                {/* 3. Joined */}
                <div style={{ flex: 15 }}>
                  <p className="text-[12px] font-semibold" style={{ color: C.dark }}>{user.joinDate}</p>
                  <p className="text-[10px]" style={{ color: C.hint }}>{user.time}</p>
                </div>

                {/* 4. Location */}
                <div style={{ flex: 15 }}>
                  {user.ip === 'No IP Logged' ? (
                    <div className="flex items-center gap-1.5">
                      <CloudOff size={13} style={{ color: C.hint }} />
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: C.dark }}>Offline</p>
                        <p className="text-[10px]" style={{ color: C.hint }}>No IP Logged</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-1">
                        <span className="text-[14px]">🌍</span>
                        <p className="text-[12px] font-semibold" style={{ color: C.dark }}>
                          {dbUser.verified_city ?? 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {dbUser.is_location_verified && (
                          <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                               style={{ backgroundColor: C.lime }}>
                            <span style={{ fontSize: 8 }}>✓</span>
                          </div>
                        )}
                        <p className="text-[10px]" style={{ color: C.hint }}>{user.ip}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Platform & ID */}
                <div style={{ flex: 20 }}>
                  <p className="text-[12px] font-semibold truncate" style={{ color: C.dark }}>{user.platform} • {user.browser}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-mono" style={{ color: C.muted }}>ID: {user.shortId}</span>
                    <button onClick={() => navigator.clipboard.writeText(user.id)}>
                      <Copy size={10} style={{ color: C.hint }} />
                    </button>
                  </div>
                </div>

                {/* 6. Devices */}
                <div style={{ flex: 10 }}>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md border"
                       style={{
                         backgroundColor: isHighRisk ? 'rgba(248,113,113,0.12)' : C.bg,
                         borderColor:     isHighRisk ? '#F87171' : C.border,
                       }}>
                    {isHighRisk
                      ? <AlertTriangle size={11} style={{ color: '#F87171' }} />
                      : <Monitor       size={11} style={{ color: C.muted    }} />}
                    <span className="text-[12px] font-bold"
                          style={{ color: isHighRisk ? '#F87171' : '#334155' }}>
                      {isHighRisk ? `${uniqueIps} IPs` : user.deviceCount}
                    </span>
                  </div>
                </div>

                {/* 7. Actions */}
                <div style={{ flex: 10 }}>
                  <ActionButtons user={user} rawUser={dbUser} onUserUpdated={onUserUpdated}
                    onOpenDrawer={() => setDrawerUser(dbUser)} />
                </div>
              </div>
              <div className="h-px" style={{ backgroundColor: '#F1F5F9' }} />
            </div>
          )
        })}
      </div>

      {/* ── Mobile cards ── */}
      <div className="xl:hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <span className="text-[11px] font-bold tracking-wider" style={{ color: C.hint }}>USERS LIST</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState filter={selectedFilter} />
        ) : filtered.map(dbUser => {
          const user     = formatUser(dbUser)
          const sc       = statusColors(user.status)
          const isLive   = user.deviceCount !== '0' && user.ip !== 'No IP Logged'
          const dispName = isInvestorMode ? `${user.name.split(' ')[0]} ***` : user.name
          const dispEmail = isInvestorMode && user.email.includes('@')
            ? `${user.email[0]}***@${user.email.split('@')[1]}` : user.email

          return (
            <div key={user.id} className="mx-4 my-2 p-4 rounded-2xl border"
                 style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              {/* Top row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: C.lime }}>
                      <span className="text-[12px] font-extrabold" style={{ color: C.dark }}>{user.initials}</span>
                    </div>
                  )}
                  {isLive && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: C.lime }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate" style={{ color: C.dark }}>{dispName}</p>
                  <p className="text-[11px] truncate" style={{ color: C.muted }}>{dispEmail}</p>
                </div>
              </div>
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold" style={{ backgroundColor: '#F1F5F9', color: '#334155' }}>{user.plan}</span>
                <span className="px-2 py-1 rounded-md text-[10px] font-bold" style={{ backgroundColor: sc.bg, color: sc.color }}>{user.status}</span>
              </div>
              <div className="h-px mb-4" style={{ backgroundColor: '#F1F5F9' }} />
              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.hint }}>JOIN DATE</p>
                  <p className="text-[12px] font-semibold" style={{ color: C.dark }}>{user.joinDate}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{user.time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.hint }}>ACCOUNT ID</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-mono font-semibold" style={{ color: '#334155' }}>{user.shortId}</span>
                    <button onClick={() => navigator.clipboard.writeText(user.id)}>
                      <Copy size={13} style={{ color: C.hint }} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.hint }}>PLATFORM & LOGIN</p>
                  <p className="text-[12px] font-semibold truncate" style={{ color: C.dark }}>{user.platform} • {user.browser}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{user.ip}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.hint }}>DEVICES</p>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <Monitor size={11} style={{ color: C.muted }} />
                    <span className="text-[12px] font-bold" style={{ color: '#334155' }}>{user.deviceCount}</span>
                  </div>
                </div>
              </div>
              <div className="h-px mb-4" style={{ backgroundColor: '#F1F5F9' }} />
              <ActionButtons user={user} rawUser={dbUser} onUserUpdated={onUserUpdated}
                onOpenDrawer={() => setDrawerUser(dbUser)} />
            </div>
          )
        })}
      </div>

      {/* User detail drawer */}
      {drawerUser && (
        <UserDetailDrawer
          user={drawerUser}
          onUserUpdated={onUserUpdated}
          onClose={() => setDrawerUser(null)}
        />
      )}

    </div>
  )
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <User size={40} style={{ color: C.hint }} />
      <p className="text-[14px] font-bold mt-4" style={{ color: C.muted }}>No users match '{filter}'</p>
    </div>
  )
}