'use client'
// components/admin/settings-tabs/crm_widgets/UserDetailDrawer.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/crm_widgets/user_detail_drawer.dart

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  X, Mail, Lock, LogOut, DollarSign, Calendar,
  Store, Monitor, Smartphone, Copy, Trash2,
  ChevronDown, AlertTriangle, Check,
} from 'lucide-react'

const C = {
  dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0',
  bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8',
}

interface Props {
  user:          any
  onUserUpdated: (id: string, field: string, value: any) => void
  onClose:       () => void
}

// ── Helpers ───────────────────────────────────────────────────
function safeStr(v: any, fallback = ''): string {
  if (v == null) return fallback
  const s = v.toString().trim()
  return s.toLowerCase() === 'null' || s === '' ? fallback : s
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
  return name.length >= 2 ? name.substring(0,2).toUpperCase() : name.toUpperCase()
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function monthName(m: number) { return MONTHS[m-1] }

function calcMRR(plan: string): number {
  const p = plan.toLowerCase()
  if (p.includes('elite')) return 99
  if (p.includes('pro'))   return 49
  return 0
}

function formatDate(raw: string): string {
  try {
    const dt = new Date(raw)
    return `${monthName(dt.getMonth()+1)} ${dt.getDate()}, ${dt.getFullYear()}`
  } catch { return raw.split('T')[0] }
}

function formatDateTime(raw: string): string {
  try {
    const dt = new Date(raw)
    const h  = dt.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'
    const hr  = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${monthName(dt.getMonth()+1)} ${dt.getDate()}, ${dt.getFullYear()} at ${hr}:${dt.getMinutes().toString().padStart(2,'0')} ${ampm}`
  } catch { return 'Recent' }
}

// ── Section label ──────────────────────────────────────────────
function SectionLabel({ text, color }: { text: string; color?: string }) {
  return <p className="text-[11px] font-bold tracking-wider mb-3" style={{ color: color ?? C.hint }}>{text}</p>
}

// ── Metric card ────────────────────────────────────────────────
function MetricCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex-1 p-4 rounded-xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
      <Icon size={19} style={{ color: C.hint }} />
      <p className="text-[18px] font-black mt-3 mb-1" style={{ color: C.text }}>{value}</p>
      <p className="text-[11px] font-bold" style={{ color: C.muted }}>{title}</p>
    </div>
  )
}

// ── Quick action button ────────────────────────────────────────
function QuickAction({ icon: Icon, label, loading, onTap, isDanger = false }: {
  icon: React.ElementType; label: string; loading: boolean; onTap: () => void; isDanger?: boolean
}) {
  return (
    <button onClick={loading ? undefined : onTap} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all hover:opacity-80"
      style={{
        borderColor: isDanger ? 'rgba(248,113,113,0.3)' : C.border,
        backgroundColor: isDanger ? 'rgba(248,113,113,0.05)' : '#fff',
      }}>
      {loading
        ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
               style={{ borderTopColor: isDanger ? '#F87171' : C.dark }} />
        : <Icon size={13} style={{ color: isDanger ? '#F87171' : C.muted }} />}
      <span className="text-[11px] font-bold" style={{ color: isDanger ? '#F87171' : '#334155' }}>{label}</span>
    </button>
  )
}

// ── System row ─────────────────────────────────────────────────
function SystemRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12px]" style={{ color: C.muted }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold truncate text-right" style={{ maxWidth: 150, color: '#334155' }}>{value}</span>
        {copyable && (
          <button onClick={() => navigator.clipboard.writeText(value)}>
            <Copy size={13} style={{ color: C.hint }} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Plan/Status badge dropdown ─────────────────────────────────
function BadgeDropdown({ value, options, onSelect, bgColor, textColor }: {
  value: string; options: { value: string; label?: string }[]
  onSelect: (v: string) => void; bgColor: string; textColor: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(s => !s)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold"
        style={{ backgroundColor: bgColor, color: textColor }}>
        {value}
        <ChevronDown size={13} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-50 bg-white rounded-2xl border shadow-xl p-1"
               style={{ borderColor: C.border, minWidth: 160 }}>
            {options.map(o => (
              <button key={o.value} onClick={() => { onSelect(o.value); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-[13px] transition-all"
                style={{
                  backgroundColor: value === o.value ? C.lime : 'transparent',
                  color: C.text, fontWeight: value === o.value ? 700 : 600,
                }}>
                {o.label ?? o.value}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function UserDetailDrawer({ user, onUserUpdated, onClose }: Props) {
  const supabase = createClient()

  const [note,          setNote]          = useState(safeStr(user.dispute_note))
  const [savingNote,    setSavingNote]    = useState(false)
  const [resettingPass, setResettingPass] = useState(false)
  const [loggingOut,    setLoggingOut]    = useState(false)
  const [loadingStores, setLoadingStores] = useState(true)
  const [loadingDevices,setLoadingDevices]= useState(true)
  const [loadingHistory,setLoadingHistory]= useState(true)
  const [stores,        setStores]        = useState<any[]>([])
  const [devices,       setDevices]       = useState<any[]>([])
  const [history,       setHistory]       = useState<any[]>([])
  const [currentPlan,   setCurrentPlan]   = useState(safeStr(user.plan_name,       'Free'))
  const [currentStatus, setCurrentStatus] = useState(safeStr(user.account_status,  'Active'))
  const [showDelete,    setShowDelete]    = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: storesData }, { data: devicesData }, { data: histData }] = await Promise.all([
          supabase.from('user_stores').select('*').eq('user_id', user.id),
          supabase.from('user_devices').select('*').eq('user_id', user.id),
          supabase.from('login_history').select('*').eq('user_id', user.id).order('login_at', { ascending: false }).limit(10),
        ])
        setStores((storesData ?? []) as any[])
        setDevices((devicesData ?? []) as any[])
        setHistory((histData ?? []) as any[])
      } catch (e) { console.error(e) }
      setLoadingStores(false); setLoadingDevices(false); setLoadingHistory(false)
    }
    fetchData()
  }, [user.id])

  // ── Derived values ─────────────────────────────────────────
  const name        = safeStr(user.name,        'Unknown User')
  const email       = safeStr(user.email,        'No Email')
  const shortId     = safeStr(user.display_id,   'Generating...')
  const fullId      = safeStr(user.id,           'Unknown')
  const lastIp      = safeStr(user.last_login_ip,'Unknown IP')
  const platform    = safeStr(user.device_platform,'Unknown Device')
  const browser     = safeStr(user.browser_agent, 'Unknown Browser')
  const platformStr = (platform === 'Unknown Device' && browser === 'Unknown Browser') ? 'No data recorded' : `${platform} • ${browser}`

  let avatarUrl = safeStr(user.avatar_url) || safeStr(user.avatarUrl)
  const gender  = safeStr(user.gender).toLowerCase()
  if (!avatarUrl) {
    if (gender === 'male')   avatarUrl = 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png'
    if (gender === 'female') avatarUrl = 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png'
  }

  const joinDate    = user.created_at ? formatDate(user.created_at) : 'Unknown'
  const mrr         = calcMRR(currentPlan)
  const maxStores   = currentPlan.toLowerCase().includes('elite') ? 5 : currentPlan.toLowerCase().includes('pro') ? 2 : 1
  const usageRatio  = maxStores > 0 ? stores.length / maxStores : 0
  const isOverLimit = usageRatio > 1
  const displayUsage = Math.min(usageRatio, 1)
  const progressColor = isOverLimit ? '#F87171' : C.lime

  const statusColor = currentStatus === 'Active' ? '#16A34A' : '#F87171'
  const statusBg    = currentStatus === 'Active' ? 'rgba(22,163,74,0.1)' : 'rgba(248,113,113,0.1)'

  async function changePlan(newPlan: string) {
    try {
      await (supabase.from('profiles') as any).update({ plan_name: newPlan }).eq('id', user.id)
      onUserUpdated(user.id, 'plan_name', newPlan)
      setCurrentPlan(newPlan)
    } catch (e) { console.error(e) }
  }

  async function changeStatus(newStatus: string) {
    try {
      await (supabase.from('profiles') as any).update({ account_status: newStatus }).eq('id', user.id)
      onUserUpdated(user.id, 'account_status', newStatus)
      setCurrentStatus(newStatus)
    } catch (e) { console.error(e) }
  }

  async function saveNote() {
    setSavingNote(true)
    try {
      const val = note.trim() || null
      await (supabase.from('profiles') as any).update({ dispute_note: val }).eq('id', user.id)
      onUserUpdated(user.id, 'dispute_note', val)
    } catch (e) { console.error(e) }
    setSavingNote(false)
  }

  async function sendPasswordReset() {
    setResettingPass(true)
    try { await supabase.auth.resetPasswordForEmail(email) } catch (e) { console.error(e) }
    setResettingPass(false)
  }

  async function forceLogout() {
    setLoggingOut(true)
    try { await supabase.auth.admin.signOut(user.id) } catch (e) { console.error(e) }
    setLoggingOut(false)
  }

  async function revokeDevice(deviceId: string) {
    try {
      await (supabase.from('user_devices') as any).delete().eq('device_id', deviceId)
      setDevices(d => d.filter(x => x.device_id !== deviceId))
    } catch (e) { console.error(e) }
  }

  async function deleteUser() {
    try {
      await supabase.auth.admin.deleteUser(user.id)
      onUserUpdated(user.id, 'deleted', true)
      onClose()
    } catch (e) { console.error(e) }
    setShowDelete(false)
  }

  return (
    // Slide-in from right — matches Dart SlideTransition + BackdropFilter
    <div className="fixed inset-0 z-[9999] flex justify-end"
         style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[420px] h-full bg-white overflow-y-auto flex flex-col"
           style={{ borderRadius: '24px 0 0 24px', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)' }}>

        {/* Close button */}
        <div className="p-4 shrink-0">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-50">
            <X size={18} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-10">

          {/* ── Hero ── */}
          <div className="flex flex-col items-center mb-6">
            {avatarUrl ? (
              <img src={avatarUrl} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: C.lime }}>
                <span className="text-[28px] font-black" style={{ color: C.dark }}>{getInitials(name)}</span>
              </div>
            )}
            <h2 className="text-[22px] font-black mt-4 mb-1" style={{ color: C.dark }}>{name}</h2>
            <p className="text-[14px] mb-4" style={{ color: C.muted }}>{email}</p>
            {/* Plan + Status dropdowns */}
            <div className="flex items-center gap-2">
              <BadgeDropdown value={currentPlan} bgColor="#F1F5F9" textColor={C.dark}
                options={[{value:'Free'},{value:'Starter'},{value:'Growth'}]}
                onSelect={changePlan} />
              <BadgeDropdown value={currentStatus} bgColor={statusBg} textColor={statusColor}
                options={[{value:'Active',label:'Set to Active'},{value:'Past Due',label:'Set to Past Due'},{value:'Expired',label:'Set to Expired'}]}
                onSelect={changeStatus} />
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <QuickAction icon={Mail}    label="Email"        loading={false}          onTap={() => {}} />
            <QuickAction icon={Lock}    label="Reset Pass"   loading={resettingPass}  onTap={sendPasswordReset} />
            <QuickAction icon={LogOut}  label="Force Logout" loading={loggingOut}     onTap={forceLogout} isDanger />
          </div>

          <div className="h-px mb-6" style={{ backgroundColor: '#F1F5F9' }} />

          {/* ── Metrics ── */}
          <SectionLabel text="ACCOUNT METRICS" />
          <div className="flex gap-3 mb-8">
            <MetricCard title="Monthly Value" value={`$${mrr.toFixed(0)}`} icon={DollarSign} />
            <MetricCard title="Member Since"  value={joinDate}             icon={Calendar} />
          </div>

          {/* ── Plan Usage ── */}
          <SectionLabel text="PLAN USAGE" />
          <div className="p-4 rounded-xl border mb-8"
               style={{
                 backgroundColor: isOverLimit ? 'rgba(248,113,113,0.02)' : C.bg,
                 borderColor:     isOverLimit ? 'rgba(248,113,113,0.4)'  : C.border,
               }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold" style={{ color: isOverLimit ? '#F87171' : C.dark }}>
                  {Math.round(usageRatio * 100)}% Used
                </span>
                {isOverLimit && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: '#F87171' }}>
                    ⚠️ Over Limit
                  </span>
                )}
              </div>
              <span className="text-[12px]" style={{ color: C.muted }}>{currentPlan}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: C.border }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${displayUsage * 100}%`, backgroundColor: progressColor }} />
            </div>
            <p className="text-[11px]"
               style={{ color: isOverLimit ? '#F87171' : C.muted, fontWeight: isOverLimit ? 700 : 400 }}>
              {stores.length} / {maxStores} Stores Connected
            </p>
          </div>

          {/* ── Connected Stores ── */}
          <div className="flex items-center justify-between mb-3">
            <SectionLabel text="CONNECTED STORES" />
            {!loadingStores && <span className="text-[11px] font-bold mb-3" style={{ color: '#16A34A' }}>{stores.length} Active</span>}
          </div>
          {loadingStores ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
            </div>
          ) : stores.length > 0 ? stores.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                 style={{ backgroundColor: '#fff', borderColor: C.border }}>
              <Store size={17} style={{ color: C.hint }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold" style={{ color: C.dark }}>{s.name}</p>
                <p className="text-[11px]" style={{ color: C.muted }}>Last synced: {s.last_sync}</p>
              </div>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: C.lime }}>
                <Check size={10} style={{ color: C.dark }} />
              </div>
            </div>
          )) : (
            <div className="p-4 rounded-xl border mb-8 text-center" style={{ borderColor: C.border }}>
              <p className="text-[13px]" style={{ color: C.hint }}>No stores connected yet</p>
            </div>
          )}

          <div className="h-px my-6" style={{ backgroundColor: '#F1F5F9' }} />

          {/* ── Active Devices ── */}
          <div className="flex items-center justify-between mb-3">
            <SectionLabel text="ACTIVE DEVICES" />
            {!loadingDevices && <span className="text-[11px] font-bold mb-3" style={{ color: '#16A34A' }}>{devices.length} Online</span>}
          </div>
          {loadingDevices ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
            </div>
          ) : devices.length > 0 ? devices.map((d, i) => {
            const isMobile = d.platform?.includes('iOS') || d.platform?.includes('Android')
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                   style={{ backgroundColor: d.is_current ? C.bg : '#fff', borderColor: C.border }}>
                {isMobile ? <Smartphone size={17} style={{ color: C.hint }} /> : <Monitor size={17} style={{ color: C.hint }} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold" style={{ color: C.dark }}>{d.platform} • {d.browser}</p>
                    {d.is_current && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{ backgroundColor: 'rgba(143,255,0,0.3)', color: C.dark }}>Current</span>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: C.muted }}>IP: {d.ip_address} • Active: {d.last_active}</p>
                </div>
                {!d.is_current && (
                  <button onClick={() => revokeDevice(d.device_id)}
                    className="text-[11px] font-bold" style={{ color: '#F87171' }}>Revoke</button>
                )}
              </div>
            )
          }) : (
            <div className="p-4 rounded-xl border mb-8 text-center" style={{ borderColor: C.border }}>
              <p className="text-[13px]" style={{ color: C.hint }}>No active sessions recorded</p>
            </div>
          )}

          {/* ── Security & Login Audit ── */}
          <SectionLabel text="SECURITY & LOGIN AUDIT" />
          {loadingHistory ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
            </div>
          ) : history.length > 0 ? history.map((log, i) => {
            const isMobile = log.device_info?.toString().includes('iPhone') || log.device_info?.toString().includes('Android')
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                   style={{ backgroundColor: '#fff', borderColor: C.border }}>
                {isMobile ? <Smartphone size={17} style={{ color: C.hint }} /> : <Monitor size={17} style={{ color: C.hint }} />}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold" style={{ color: C.dark }}>{log.device_info ?? 'Unknown Device'}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    IP: {log.ip_address} • {log.login_at ? formatDateTime(log.login_at) : 'Unknown'}
                  </p>
                </div>
              </div>
            )
          }) : (
            <div className="p-4 rounded-xl border mb-8 text-center" style={{ borderColor: C.border }}>
              <p className="text-[13px]" style={{ color: C.hint }}>No historical logins found</p>
            </div>
          )}

          <div className="h-px my-6" style={{ backgroundColor: '#F1F5F9' }} />

          {/* ── Admin Support Notes ── */}
          <SectionLabel text="ADMIN SUPPORT NOTES" />
          <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add a private note about this user..."
            className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none resize-none mb-3"
            style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }} />
          <button onClick={saveNote} disabled={savingNote}
            className="w-full flex items-center justify-center py-4 rounded-xl text-[14px] font-bold text-white mb-8"
            style={{ backgroundColor: C.dark }}>
            {savingNote
              ? <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
              : 'Save Note'}
          </button>

          <div className="h-px mb-6" style={{ backgroundColor: '#F1F5F9' }} />

          {/* ── System Metadata ── */}
          <SectionLabel text="SYSTEM METADATA" />
          <div className="flex flex-col gap-3 mb-8">
            <SystemRow label="Display ID"   value={shortId}     copyable />
            <SystemRow label="Account UUID" value={fullId}      copyable />
            <SystemRow label="Last Login IP" value={lastIp} />
            <SystemRow label="Platform"     value={platformStr} />
          </div>

          <div className="h-px mb-6" style={{ backgroundColor: '#F1F5F9' }} />

          {/* ── Danger Zone ── */}
          <SectionLabel text="DANGER ZONE" color="#F87171" />
          <button onClick={() => setShowDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border text-[13px] font-bold"
            style={{ borderColor: 'rgba(248,113,113,0.3)', color: '#F87171' }}>
            <Trash2 size={15} /> Delete User Account
          </button>

        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={e => e.target === e.currentTarget && setShowDelete(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" style={{ borderColor: C.border }}>
            <h3 className="text-[16px] font-bold mb-2" style={{ color: '#F87171' }}>Delete User?</h3>
            <p className="text-[13px] mb-5" style={{ color: C.muted }}>
              Are you absolutely sure you want to permanently delete {name}? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
              <button onClick={deleteUser}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{ backgroundColor: '#F87171' }}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}