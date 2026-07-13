'use client'
// components/admin/settings-tabs/SecurityLogsTab.tsx
// --------------------------------------------------------------
// RIAZIFY — Security Logs Tab
// Two-tab workspace: Activity (HUD + Fraud Sentinel + Logs)
//                    Network Guard (Anomalies + Blocked IPs)
// Silent 10-second auto-refresh via Visibility API
// --------------------------------------------------------------

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Shield, AlertTriangle, Lock, Globe, RefreshCw,
    Download, Ban, CheckCircle, Activity, Search, X,
    ChevronDown, Trash2,
  } from 'lucide-react'

// -- Design tokens ----------------------------------------------
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
  blue:     '#1d4ed8',
}

// -- Data interfaces --------------------------------------------
interface AdminLogEntry {
  id:         string
  admin_id:   string | null
  target_id:  string | null
  action:     string
  details:    string | null
  metadata:   Record<string, any>
  ip_address: string | null
  created_at: string
}

interface SecurityEvent {
  id:          string
  user_id:     string
  event_type:  string
  event_title: string
  event_desc:  string | null
  metadata:    Record<string, any>
  created_at:  string
}

interface LoginRecord {
  id:            string
  user_id:       string
  ip_address:    string | null
  device_info:   string | null
  login_at:      string
  location_name: string | null
  user_name?:    string | null
  user_email?:   string | null
}

interface BlockedIP {
  id:           string
  ip_address:   string
  reason:       string | null
  blocked_by:   string | null
  created_at:   string
  blocker_name?: string | null
}

interface HudStats {
  adminActionsToday:  number
  failedLoginsDay:    number
  blockedIpsTotal:    number
  activeAlerts:       number
}

// -- Time ago helper --------------------------------------------
function timeAgo(iso: string): string {
  const diffMs    = Date.now() - new Date(iso).getTime()
  const diffMins  = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays  = Math.floor(diffMs / 86400000)
  if (diffMins  <  1)  return 'Just now'
  if (diffMins  < 60)  return `${diffMins}m ago`
  if (diffHours < 24)  return `${diffHours}h ago`
  return `${diffDays}d ago`
}

// -- Action label + color mapper --------------------------------
function mapAction(action: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    suspend_user:  { label: 'Suspended User',    color: C.red,      bg: 'rgba(185,28,28,0.08)'   },
    delete_user:   { label: 'Deleted User',      color: C.red,      bg: 'rgba(185,28,28,0.08)'   },
    force_logout:  { label: 'Force Logout',      color: C.amber,    bg: 'rgba(217,119,6,0.08)'   },
    change_plan:   { label: 'Changed Plan',      color: C.blue,     bg: 'rgba(29,78,216,0.08)'   },
    assign_role:   { label: 'Assigned Role',     color: C.limeDeep, bg: 'rgba(74,143,0,0.08)'    },
    write_note:    { label: 'Wrote Note',        color: C.muted,    bg: 'rgba(138,158,120,0.08)' },
    send_email:    { label: 'Sent Email',        color: C.blue,     bg: 'rgba(29,78,216,0.08)'   },
    revoke_role:   { label: 'Revoked Role',      color: C.red,      bg: 'rgba(185,28,28,0.08)'   },
    impersonate:   { label: 'Impersonated User', color: C.red,      bg: 'rgba(185,28,28,0.08)'   },
  }
  return map[action] ?? { label: action.replace(/_/g, ' '), color: C.muted, bg: C.bg }
}

// -- Event color mapper -----------------------------------------
function mapEventColor(eventTitle: string): { color: string; bg: string } {
  if (eventTitle.toLowerCase().includes('failed'))     return { color: C.red,      bg: 'rgba(185,28,28,0.08)'   }
  if (eventTitle.toLowerCase().includes('impossible')) return { color: C.red,      bg: 'rgba(185,28,28,0.08)'   }
  if (eventTitle.toLowerCase().includes('multi'))      return { color: C.amber,    bg: 'rgba(217,119,6,0.08)'   }
  if (eventTitle.toLowerCase().includes('password'))   return { color: C.blue,     bg: 'rgba(29,78,216,0.08)'   }
  if (eventTitle.toLowerCase().includes('reset'))      return { color: C.blue,     bg: 'rgba(29,78,216,0.08)'   }
  return { color: C.muted, bg: C.bg }
}

// -- Toast component --------------------------------------------
function SecurityToast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark,    border: C.lime,   text: C.lime, icon: '?' },
    error:   { bg: '#FEF2F2', border: '#FECACA', text: C.red,  icon: '?' },
    info:    { bg: C.bg,      border: C.border,  text: C.text, icon: 'i' },
  }
  const t = map[type]
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
         style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}>
      <span className="text-[13px] font-black" style={{ color: t.text }}>{t.icon}</span>
      <p className="text-[13px] font-bold" style={{ color: t.text }}>{msg}</p>
    </div>
  )
}

// -- Custom Dropdown --------------------------------------------
function CustomDropdown({ value, options, onChange }: {
  value:    string
  options:  { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen]       = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const triggerRef            = useRef<HTMLButtonElement>(null)
  const selected              = options.find(o => o.value === value)

  function openMenu() {
    if (!triggerRef.current) return
    const rect       = triggerRef.current.getBoundingClientRect()
    const menuHeight = options.length * 40
    const spaceBelow = window.innerHeight - rect.bottom
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      setMenuStyle({ position: 'fixed', bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width, zIndex: 9999 })
    } else {
      setMenuStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 })
    }
    setOpen(true)
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => open ? setOpen(false) : openMenu()}
        className="flex items-center justify-between h-9 px-3 rounded-xl border text-[12px] font-semibold transition-all"
        style={{
          backgroundColor: C.surface,
          borderColor:     open ? C.lime : C.border,
          color:           C.text,
          minWidth:        140,
        }}>
        <span>{selected?.label ?? 'Select...'}</span>
        <ChevronDown size={12} style={{
          color:      C.muted,
          transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          marginLeft: 8,
          flexShrink: 0,
        }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="rounded-2xl border overflow-hidden p-1.5 flex flex-col gap-0.5"
               style={{
                 ...menuStyle,
                 backgroundColor: C.surface,
                 borderColor:     C.border,
                 boxShadow:       '0 8px 24px rgba(0,0,0,0.12)',
               }}>
            {options.map(o => {
              const isSelected = o.value === value
              return (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold text-left transition-all duration-150"
                  style={{
                    backgroundColor: isSelected ? C.lime : 'transparent',
                    color:           isSelected ? C.dark : C.text,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = C.limeTint }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  {o.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
function HudCards({ stats, loading }: { stats: HudStats; loading: boolean }) {
  const cards = [
    {
      title:    'Admin Actions Today',
      value:    stats.adminActionsToday,
      sub:      'across all team members',
      icon:     Activity,
      color:    C.limeDeep,
      bg:       C.limeTint,
    },
    {
      title:    'Security Alerts',
      value:    stats.failedLoginsDay,
      sub:      'failed logins & anomalies',
      icon:     AlertTriangle,
      color:    C.amber,
      bg:       'rgba(217,119,6,0.08)',
    },
    {
      title:    'Blocked IPs',
      value:    stats.blockedIpsTotal,
      sub:      'permanently blocked',
      icon:     Ban,
      color:    C.red,
      bg:       'rgba(185,28,28,0.08)',
    },
    {
      title:    'Active Alerts',
      value:    stats.activeAlerts,
      sub:      'need review now',
      icon:     Shield,
      color:    stats.activeAlerts > 0 ? C.red : C.green,
      bg:       stats.activeAlerts > 0 ? 'rgba(185,28,28,0.08)' : 'rgba(22,163,74,0.08)',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>
                {card.title.toUpperCase()}
              </p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: card.bg }}>
                <Icon size={15} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-[28px] font-black tracking-tight" style={{ color: loading ? C.border : C.dark }}>
              {loading ? '—' : card.value}
            </p>
            <p className="text-[11px] font-semibold" style={{ color: C.muted }}>{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}

// --------------------------------------------------------------
// FRAUD SENTINEL BANNER
// --------------------------------------------------------------
function FraudSentinelBanner({
    alerts,
    onLockAccount,
    onDismiss,
    canLock = true,
    canDismiss = true,
  }: {
    alerts:          SecurityEvent[]
    onLockAccount:   (userId: string, eventId: string) => void
    onDismiss:       (eventId: string) => void
    canLock?:        boolean
    canDismiss?:     boolean
  }) {
  const criticalAlerts = alerts.filter(a =>
    a.event_title.toLowerCase().includes('impossible') ||
    a.event_title.toLowerCase().includes('multi') ||
    a.event_title.toLowerCase().includes('failed')
  )

  if (criticalAlerts.length === 0) return null

  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl border"
         style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.25)' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.red }} />
        <p className="text-[13px] font-black" style={{ color: C.red }}>
          FRAUD SENTINEL — {criticalAlerts.length} Active Threat{criticalAlerts.length !== 1 ? 's' : ''} Detected
        </p>
      </div>
      {criticalAlerts.map(alert => (
        <div key={alert.id}
             className="flex items-center gap-3 px-4 py-3 rounded-xl border"
             style={{ backgroundColor: C.surface, borderColor: 'rgba(185,28,28,0.2)' }}>
          <AlertTriangle size={15} style={{ color: C.red, flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold" style={{ color: C.dark }}>{alert.event_title}</p>
            <p className="text-[11px]" style={{ color: C.muted }}>{alert.event_desc}</p>
          </div>
          <p className="text-[10px] font-semibold shrink-0" style={{ color: C.muted }}>
            {timeAgo(alert.created_at)}
          </p>
          {canLock && <button
            onClick={() => onLockAccount(alert.user_id, alert.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Lock size={11} /> Lock Account
          </button>}
          {canDismiss && <button
              onClick={() => onDismiss(alert.id)}
              className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 shrink-0">
              <X size={13} style={{ color: C.muted }} />
            </button>}
        </div>
      ))}
    </div>
  )
}

// --------------------------------------------------------------
// FILTERS BAR
// --------------------------------------------------------------
function FiltersBar({
    eventFilter,    setEventFilter,
    timeFilter,     setTimeFilter,
    searchQuery,    setSearchQuery,
    isAutoRefresh,
    lastUpdated,
    onExport,
    onManualRefresh,
    canExport = true,
    onClearLogs,
    canClear = true,
  }: {
    eventFilter:      string
    setEventFilter:   (v: string) => void
    timeFilter:       string
    setTimeFilter:    (v: string) => void
    searchQuery:      string
    setSearchQuery:   (v: string) => void
    isAutoRefresh:    boolean
    lastUpdated:      number
    onExport:         () => void
    onManualRefresh:  () => void
    canExport?:       boolean
    onClearLogs?:     () => void
    canClear?:        boolean
}) {
  const eventOptions = [
    { value: 'all',            label: 'All Events'       },
    { value: 'admin_action',   label: 'Admin Actions'    },
    { value: 'security_alert', label: 'Security Alerts'  },
    { value: 'password_reset', label: 'Password Resets'  },
  ]

  const timeOptions = [
    { value: '1h',  label: 'Last 1 hour'  },
    { value: '6h',  label: 'Last 6 hours' },
    { value: '24h', label: 'Last 24 hours'},
    { value: '7d',  label: 'Last 7 days'  },
    { value: '30d', label: 'Last 30 days' },
  ]

  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000))
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [lastUpdated])

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Event type filter */}
      <CustomDropdown
        value={eventFilter}
        options={eventOptions}
        onChange={setEventFilter}
      />

      {/* Time range filter */}
      <CustomDropdown
        value={timeFilter}
        options={timeOptions}
        onChange={setTimeFilter}
      />

      {/* Search */}
      <div className="flex items-center gap-2 h-9 px-3 rounded-xl border flex-1 min-w-[200px]"
           id="security-search-bar"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search IP address or email..."
          className="flex-1 text-[12px] bg-transparent"
          style={{ color: C.text, outline: 'none', border: 'none' }}
          onFocus={() => {
            const el = document.getElementById('security-search-bar')
            if (el) el.style.borderColor = 'rgba(143,255,0,0.5)'
          }}
          onBlur={() => {
            const el = document.getElementById('security-search-bar')
            if (el) el.style.borderColor = C.border
          }} />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}>
            <X size={12} style={{ color: C.muted }} />
          </button>
        )}
      </div>

      {/* Auto refresh indicator */}
      <div className="flex items-center gap-1.5 h-9 px-3 rounded-xl border"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse"
             style={{ backgroundColor: isAutoRefresh ? C.green : C.muted }} />
        <p className="text-[11px] font-semibold" style={{ color: C.muted }}>
          {isAutoRefresh ? `Updated ${secondsAgo}s ago` : 'Paused'}
        </p>
      </div>

      {/* Manual refresh */}
      <button
        onClick={onManualRefresh}
        className="h-9 w-9 flex items-center justify-center rounded-xl border hover:opacity-80"
        style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <RefreshCw size={14} style={{ color: C.muted }} />
      </button>

      {/* Export */}
     {canExport && <button
          onClick={onExport}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80"
          style={{ backgroundColor: '#8fff00', color: '#1a2410', borderColor: C.dark }}>
          <Download size={13} /> Export
        </button>}
        {canClear && onClearLogs && <button
          onClick={onClearLogs}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80"
          style={{ backgroundColor: '#FEF2F2', color: '#b91c1c', borderColor: '#FECACA' }}>
          <Trash2 size={13} /> Clear Logs
        </button>}
      </div>
    )
  }

// --------------------------------------------------------------
// ADMIN ACTION LOGS — Left column
// --------------------------------------------------------------
function AdminActionLogs({ logs, loading, obscureEmail }: {
  logs:          AdminLogEntry[]
  loading:       boolean
  obscureEmail:  (email: string) => string
}) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>ADMIN ACTION LOGS</p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
          {logs.length} entries
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ backgroundColor: C.bg }} />
          ))
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Activity size={22} style={{ color: C.border }} />
            <p className="text-[12px]" style={{ color: C.muted }}>No admin actions recorded</p>
          </div>
        ) : (
          logs.map(log => {
            const mapped     = mapAction(log.action)
            const adminName  = log.metadata?.admin_name  ?? 'Unknown Admin'
            const targetName = log.metadata?.target_name ?? 'Unknown User'
            return (
              <div key={log.id}
                   className="flex items-start gap-3 px-4 py-3 rounded-2xl border"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}>
                {/* Action badge */}
                <div className="px-2 py-0.5 rounded-lg shrink-0 mt-0.5"
                     style={{ backgroundColor: mapped.bg }}>
                  <p className="text-[9px] font-black tracking-wide" style={{ color: mapped.color }}>
                    {mapped.label.toUpperCase()}
                  </p>
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>
                    {obscureEmail(adminName)} ? {obscureEmail(targetName)}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: C.muted }}>
                    {log.details ?? 'No details recorded'}
                  </p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: C.muted }}>
                    {log.ip_address ?? 'Unknown IP'}
                  </p>
                </div>
                {/* Time */}
                <p className="text-[10px] font-semibold shrink-0" style={{ color: C.muted }}>
                  {timeAgo(log.created_at)}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// USER SECURITY EVENTS — Right column
// --------------------------------------------------------------
function UserSecurityEvents({
    events,
    loading,
    onBlockIp,
    dismissedIds,
    founderIps,
    blockedIps,
    canBlock = true,
  }: {
    events:       SecurityEvent[]
    loading:      boolean
    onBlockIp:    (ip: string, defaultReason: string) => void
    dismissedIds: Set<string>
    founderIps:   Set<string>
    blockedIps:   Set<string>
    canBlock?:    boolean
  }) {
  const visible = events.filter(e => !dismissedIds.has(e.id))

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>USER SECURITY EVENTS</p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
          {visible.filter(e => e.event_type === 'security_alert').length} alerts
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ backgroundColor: C.bg }} />
          ))
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <CheckCircle size={22} style={{ color: C.green }} />
            <p className="text-[12px]" style={{ color: C.muted }}>No security events detected</p>
          </div>
        ) : (
          visible.map(event => {
            const mapped    = mapEventColor(event.event_title)
            const ipAddress = event.metadata?.ip_address ?? null
            const isAlert   = event.event_type === 'security_alert'
            return (
              <div key={event.id}
                   className="flex items-start gap-3 px-4 py-3 rounded-2xl border"
                   style={{
                     backgroundColor: C.surface,
                     borderColor:     isAlert ? 'rgba(185,28,28,0.2)' : C.border,
                   }}>
                {/* Dot */}
                <div className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                     style={{ backgroundColor: mapped.color }} />
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold" style={{ color: C.dark }}>{event.event_title}</p>
                  <p className="text-[10px] truncate" style={{ color: C.muted }}>{event.event_desc}</p>
                  {ipAddress && (
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: C.muted }}>{ipAddress}</p>
                  )}
                </div>
                {/* Time */}
                <p className="text-[10px] font-semibold shrink-0" style={{ color: C.muted }}>
                  {timeAgo(event.created_at)}
                </p>
                {/* Block IP — hidden if founder IP, badge if already blocked */}
                  {isAlert && ipAddress && !founderIps.has(ipAddress) && (
                    blockedIps.has(ipAddress) ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                        <Ban size={10} /> Already Blocked
                      </span>
                    ) : canBlock ? (
                      <button
                        onClick={() => onBlockIp(ipAddress, `Security alert: ${event.event_title}`)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 hover:opacity-80"
                        style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                        <Ban size={10} /> Block IP
                      </button>
                    ) : null
                  )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// LOGIN ANOMALIES TABLE
// --------------------------------------------------------------
function LoginAnomaliesTable({
    logins,
    loading,
    onBlockIp,
    blockedIps,
    founderIps,
    canBlock = true,
  }: {
    logins:     LoginRecord[]
    loading:    boolean
    onBlockIp:  (ip: string, defaultReason: string) => void
    blockedIps: Set<string>
    founderIps: Set<string>
    canBlock?:  boolean
  }) {
  const [page, setPage] = useState(0)
  const pageSize        = 20
  const totalPages      = Math.ceil(logins.length / pageSize)
  const pageLogins      = logins.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>
          LOGIN ACTIVITY — {logins.length} records
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-[11px] font-bold px-3 py-1 rounded-lg border disabled:opacity-40"
              style={{ borderColor: C.border, color: C.muted }}>
              Prev
            </button>
            <p className="text-[11px]" style={{ color: C.muted }}>
              {page + 1} / {totalPages}
            </p>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="text-[11px] font-bold px-3 py-1 rounded-lg border disabled:opacity-40"
              style={{ borderColor: C.border, color: C.muted }}>
              Next
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
        {/* Header */}
        <div className="grid px-4 py-2.5 border-b"
             style={{
               gridTemplateColumns: '2fr 1.5fr 1.2fr 1.5fr 0.8fr 0.8fr',
               gap: 12,
               borderColor:     C.border,
               backgroundColor: C.bg,
             }}>
          {['USER', 'IP ADDRESS', 'LOCATION', 'DEVICE', 'TIME', 'ACTION'].map(h => (
            <span key={h} className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 border-b animate-pulse" style={{ backgroundColor: C.bg, borderColor: C.border }} />
          ))
        ) : pageLogins.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-[12px]" style={{ color: C.muted }}>No login records found</p>
          </div>
        ) : (
          pageLogins.map((login, i) => {
            const isBlocked = login.ip_address ? blockedIps.has(login.ip_address) : false
            return (
              <div key={login.id}
                   className="grid px-4 py-3 items-center border-b last:border-b-0 hover:bg-[#fafcf8] transition-colors"
                   style={{
                     gridTemplateColumns: '2fr 1.5fr 1.2fr 1.5fr 0.8fr 0.8fr',
                     gap:             12,
                     borderColor:     C.border,
                     backgroundColor: isBlocked ? 'rgba(185,28,28,0.03)' : undefined,
                   }}>
                {/* User */}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate" style={{ color: C.dark }}>
                    {login.user_name ?? login.user_email ?? login.user_id.slice(0, 8) + '...'}
                  </p>
                  <p className="text-[9px] truncate" style={{ color: C.muted }}>{login.user_email ?? '—'}</p>
                </div>
                {/* IP */}
                <div className="flex items-center gap-1.5">
                  {isBlocked && (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.red }} />
                  )}
                  <p className="text-[11px] font-mono truncate"
                     style={{ color: isBlocked ? C.red : C.text }}>
                    {login.ip_address ?? '—'}
                  </p>
                </div>
                {/* Location — shows Unknown when login_history.location_name is empty
                    Fix: GeoIP lookup must be called at login time in your auth middleware
                    using an API like ip-api.com or ipinfo.io, then stored to location_name.
                    This tab displays whatever is stored — it cannot resolve IPs retroactively. */}
                <p className="text-[11px] truncate" style={{ color: login.location_name ? C.text : C.muted }}>
                  {login.location_name || '— Not resolved'}
                </p>
                {/* Device */}
                <p className="text-[11px] truncate" style={{ color: C.muted }}>
                  {login.device_info || 'Unknown'}
                </p>
                {/* Time */}
                <p className="text-[10px]" style={{ color: C.muted }}>{timeAgo(login.login_at)}</p>
                {/* Action */}
                <div>
                  {isBlocked ? (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>
                      BLOCKED
                    </span>
                  ) : founderIps.has(login.ip_address ?? '') ? (
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                      YOUR IP
                    </span>
                  ) : login.ip_address && canBlock ? (
                      <button
                        onClick={() => onBlockIp(login.ip_address!, `Manually blocked from login history`)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg hover:opacity-80"
                        style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                        Block
                      </button>
                    ) : null}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// BLOCKED IPS MANAGEMENT
// --------------------------------------------------------------
function BlockedIpsPanel({
    blockedIps,
    loading,
    onUnblock,
    canUnblock = true,
  }: {
    blockedIps: BlockedIP[]
    loading:    boolean
    onUnblock:  (id: string) => void
    canUnblock?: boolean
  }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>
          BLOCKED IP REGISTRY — {blockedIps.length} entries
        </p>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
        {/* Header */}
        <div className="grid px-4 py-2.5 border-b"
             style={{
               gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr',
               gap:             12,
               borderColor:     C.border,
               backgroundColor: C.bg,
             }}>
          {['IP ADDRESS', 'REASON', 'BLOCKED', 'ACTION'].map(h => (
            <span key={h} className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
          ))}
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 border-b animate-pulse" style={{ backgroundColor: C.bg, borderColor: C.border }} />
          ))
        ) : blockedIps.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Shield size={22} style={{ color: C.green }} />
            <p className="text-[12px]" style={{ color: C.muted }}>No IPs are currently blocked</p>
          </div>
        ) : (
          blockedIps.map(entry => (
            <div key={entry.id}
                 className="grid px-4 py-3 items-center border-b last:border-b-0"
                 style={{
                   gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr',
                   gap:         12,
                   borderColor: C.border,
                 }}>
              {/* IP */}
              <p className="text-[12px] font-mono font-bold" style={{ color: C.red }}>
                {entry.ip_address}
              </p>
              {/* Reason */}
              <p className="text-[11px] truncate" style={{ color: C.muted }}>
                {entry.reason ?? 'No reason provided'}
              </p>
              {/* Time */}
              <p className="text-[10px]" style={{ color: C.muted }}>{timeAgo(entry.created_at)}</p>
              {/* Unblock */}
                {canUnblock && <button
                  onClick={() => onUnblock(entry.id)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-80"
                  style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                  Unblock
                </button>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------
export default function SecurityLogsTab({ isInvestorMode = false }: { isInvestorMode?: boolean }) {
  const { can } = useTabPermissions('security_logs')
  const supabase = createClient()

  // -- Toast --------------------------------------------------
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  function showToast(msg: string, type: 'success' | 'error' | 'info') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // -- Sub-tab state ------------------------------------------
  const [activeTab, setActiveTab] = useState<'activity' | 'network'>('activity')

  // -- Session state ------------------------------------------
  const [currentUserIps, setCurrentUserIps] = useState<Set<string>>(new Set())

  // -- Block IP modal state -----------------------------------
  const [blockIpModal, setBlockIpModal] = useState<string | null>(null)
  const [blockReason,  setBlockReason]  = useState('')
  const [blocking,     setBlocking]     = useState(false)
  const [hudStats,        setHudStats]        = useState<HudStats>({ adminActionsToday: 0, failedLoginsDay: 0, blockedIpsTotal: 0, activeAlerts: 0 })
  const [adminLogs,       setAdminLogs]        = useState<AdminLogEntry[]>([])
  const [securityEvents,  setSecurityEvents]   = useState<SecurityEvent[]>([])
  const [loginRecords,    setLoginRecords]     = useState<LoginRecord[]>([])
  const [blockedIpsList,  setBlockedIpsList]   = useState<BlockedIP[]>([])
  const [dismissedIds,    setDismissedIds]     = useState<Set<string>>(new Set())
  const [loading,         setLoading]          = useState(true)
  const [silentRefresh,   setSilentRefresh]    = useState(false)

  // -- Filter state -------------------------------------------
  const [eventFilter,  setEventFilter]  = useState('all')
  const [timeFilter,   setTimeFilter]   = useState('24h')
  const [searchQuery,  setSearchQuery]  = useState('')

  // -- Auto-refresh state -------------------------------------
  const [lastUpdated,   setLastUpdated]   = useState(Date.now())
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const intervalRef                       = useRef<NodeJS.Timeout | null>(null)

  // -- Parse time filter to milliseconds ---------------------
  function parseInterval(filter: string): number {
    const map: Record<string, number> = {
      '1h':  1  * 60 * 60 * 1000,
      '6h':  6  * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d':  7  * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }
    return map[filter] ?? 24 * 60 * 60 * 1000
  }

  // -- Load all data ------------------------------------------
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setSilentRefresh(true)

    try {
      const cutoff = new Date(Date.now() - parseInterval(timeFilter)).toISOString()

      // -- Admin logs (new table) ---------------------------
      const { data: adminLogsData } = await (supabase.from('admin_logs') as any)
        .select('*')
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(50)

      // -- Audit logs (legacy table) ------------------------
      const { data: auditLogsData } = await (supabase.from('audit_logs') as any)
        .select('*')
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(50)

      // Normalize audit_logs to AdminLogEntry shape
      const normalizedAuditLogs: AdminLogEntry[] = (auditLogsData ?? []).map((l: any) => ({
        id:         l.id,
        admin_id:   l.user_id ?? null,
        target_id:  null,
        action:     l.action_type ?? l.action ?? 'unknown',
        details:    l.details ?? null,
        metadata:   { admin_name: 'Admin', location: l.location ?? null },
        ip_address: l.ip_address ?? null,
        created_at: l.created_at,
      }))

      // Merge and sort by created_at descending
      const mergedLogs: AdminLogEntry[] = [
        ...(adminLogsData ?? []) as AdminLogEntry[],
        ...normalizedAuditLogs,
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 100)

      // -- Security events ----------------------------------
      const { data: eventsData } = await supabase
        .from('user_events')
        .select('*')
        .in('event_type', ['security_alert', 'password_reset'])
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(50)

      // -- Login records with user info ---------------------
      const { data: loginData } = await supabase
        .from('login_history')
        .select('id, user_id, ip_address, device_info, login_at, location_name')
        .gte('login_at', cutoff)
        .order('login_at', { ascending: false })
        .limit(200)

      // Enrich login records with user name + email
      const enrichedLogins: LoginRecord[] = []
      if (loginData && loginData.length > 0) {
        const userIds = [...new Set((loginData as any[]).map(l => l.user_id))]
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds)
        const profileMap = new Map((profilesData ?? []).map((p: any) => [p.id, p]))
        for (const login of loginData as any[]) {
          const profile = profileMap.get(login.user_id)
          enrichedLogins.push({
            ...login,
            user_name:  profile?.name  ?? null,
            user_email: profile?.email ?? null,
          })
        }
      }

      // -- Blocked IPs --------------------------------------
      const { data: blockedData } = await (supabase.from('blocked_ips') as any)
        .select('*')
        .order('created_at', { ascending: false })

      // -- HUD stats ----------------------------------------
      const todayMidnight = new Date()
      todayMidnight.setHours(0, 0, 0, 0)

      const adminActionsToday = mergedLogs.filter(l =>
        new Date(l.created_at) >= todayMidnight
      ).length

      const failedLoginsDay = (eventsData ?? []).filter((e: any) =>
        e.event_type === 'security_alert'
      ).length

      const blockedIpsTotal = (blockedData ?? []).length
      const totalAlerts     = (eventsData ?? []).filter((e: any) =>
        e.event_type === 'security_alert'
      ).length

      setAdminLogs(mergedLogs)
      setSecurityEvents((eventsData ?? []) as SecurityEvent[])
      setLoginRecords(enrichedLogins)
      setBlockedIpsList((blockedData ?? []) as BlockedIP[])
      setHudStats({
        adminActionsToday,
        failedLoginsDay,
        blockedIpsTotal,
        activeAlerts: totalAlerts,
      })
      setLastUpdated(Date.now())

    } catch (error) {
      console.error('[SecurityLogsTab] loadData error:', error)
    } finally {
      setLoading(false)
      setSilentRefresh(false)
    }
  }, [supabase, timeFilter])

  // -- Initial load -------------------------------------------
  useEffect(() => {
    loadData(false)
    // Fetch current session user + their known IPs for founder immunity
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('login_history')
        .select('ip_address')
        .eq('user_id', session.user.id)
        .then(({ data }) => {
          const ips = new Set((data ?? []).map((r: any) => r.ip_address).filter(Boolean))
          setCurrentUserIps(ips)
        })
    })
  }, [loadData])

  // -- Auto-refresh every 10 seconds via Visibility API ------
  useEffect(() => {
    function startInterval() {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadData(true)
        }
      }, 10000)
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        setIsAutoRefresh(true)
        loadData(true)
        startInterval()
      } else {
        setIsAutoRefresh(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }

    startInterval()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [loadData])

  // -- Open block IP modal ------------------------------------
  function openBlockIpModal(ipAddress: string, defaultReason: string) {
    if (currentUserIps.has(ipAddress)) return
    setBlockIpModal(ipAddress)
    setBlockReason(defaultReason)
  }

  // -- Confirm block IP ---------------------------------------
  async function confirmBlockIp() {
    if (!blockIpModal || !blockReason.trim() || blocking) return
    if (blockedIpSet.has(blockIpModal)) {
      showToast(`${blockIpModal} is already blocked`, 'info')
      setBlockIpModal(null)
      setBlockReason('')
      return
    }
    setBlocking(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await (supabase.from('blocked_ips') as any).insert({
        ip_address: blockIpModal,
        reason:     blockReason.trim(),
        blocked_by: session.user.id,
      })
      showToast(`${blockIpModal} has been blocked`, 'success')
      setBlockIpModal(null)
      setBlockReason('')
      loadData(true)
    } catch (error) {
      console.error('[SecurityLogsTab] confirmBlockIp error:', error)
      showToast('Failed to block IP — please try again', 'error')
    } finally {
      setBlocking(false)
    }
  }

  // -- Unblock IP ---------------------------------------------
  async function handleUnblockIp(id: string) {
    try {
      await (supabase.from('blocked_ips') as any).delete().eq('id', id)
      setBlockedIpsList(prev => prev.filter(b => b.id !== id))
      showToast('IP address unblocked successfully', 'success')
    } catch (error) {
      console.error('[SecurityLogsTab] unblockIp error:', error)
      showToast('Failed to unblock IP — please try again', 'error')
    }
  }

  // -- Lock account -------------------------------------------
  async function handleLockAccount(userId: string, eventId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/admin/suspend-user', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body:    JSON.stringify({ userId, action: 'suspend' }),
      })
      if (!res.ok) {
        const json = await res.json()
        showToast(json.error ?? 'Failed to lock account — please try again', 'error')
        return
      }
      // Only dismiss from banner after confirmed success
      setDismissedIds(prev => new Set([...prev, eventId]))
      showToast('Account locked successfully', 'success')
    } catch (error) {
      console.error('[SecurityLogsTab] lockAccount error:', error)
      showToast('Network error — account may not have been locked', 'error')
    }
  }

  // -- Dismiss alert ------------------------------------------
  function handleDismissAlert(eventId: string) {
    setDismissedIds(prev => new Set([...prev, eventId]))
  }

  // -- Export CSV ---------------------------------------------
  const [showClearLogs, setShowClearLogs] = useState(false)
    const [clearConfirmText, setClearConfirmText] = useState('')
    const [clearing, setClearing] = useState(false)

    async function handleClearLogs() {
      if (clearConfirmText !== 'DELETE' || clearing) return
      setClearing(true)
      try {
        await Promise.all([
          (supabase.from('admin_logs') as any).delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          (supabase.from('audit_logs') as any).delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          (supabase.from('user_events') as any).delete().in('event_type', ['security_alert', 'password_reset']),
        ])
        setAdminLogs([])
        setSecurityEvents([])
        showToast('Security logs cleared', 'success')
        setShowClearLogs(false)
        setClearConfirmText('')
      } catch (e) {
        console.error('[SecurityLogsTab] clearLogs error:', e)
        showToast('Failed to clear logs', 'error')
      }
      setClearing(false)
    }

    function handleExport() {
      const escape  = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`
    const headers = ['Type', 'Action/Event', 'User', 'IP Address', 'Details', 'Time']

    const adminRows = adminLogs.map(log => [
      escape('Admin Action'),
      escape(mapAction(log.action).label),
      escape(log.metadata?.admin_name ?? 'Unknown'),
      escape(log.ip_address ?? '—'),
      escape(log.details ?? '—'),
      escape(new Date(log.created_at).toLocaleString()),
    ])

    const eventRows = securityEvents.map(event => [
      escape('Security Event'),
      escape(event.event_title),
      escape(event.metadata?.target_email ?? event.metadata?.ip_address ?? event.user_id),
      escape(event.metadata?.ip_address ?? '—'),
      escape(event.event_desc ?? '—'),
      escape(new Date(event.created_at).toLocaleString()),
    ])

    const csv  = [headers.map(h => `"${h}"`).join(','), ...[...adminRows, ...eventRows].map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    link.href     = url
    link.download = `riazify-security-logs-${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // -- Obscure email for investor mode -----------------------
  function obscureEmail(email: string): string {
    if (!isInvestorMode) return email
    const parts = email.split('@')
    if (parts.length !== 2) return `${email[0]}***`
    return `${parts[0][0]}***@${parts[1]}`
  }

  // -- Filter admin logs --------------------------------------
  const filteredAdminLogs = adminLogs.filter(log => {
    const matchesSearch = !searchQuery ||
      (log.ip_address ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.metadata?.target_email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.metadata?.admin_name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    // Hide admin logs when user has selected a non-admin event filter
    const matchesEvent = eventFilter === 'all' || eventFilter === 'admin_action'
    return matchesSearch && matchesEvent
  })

  // -- Filter security events ---------------------------------
  const filteredSecurityEvents = securityEvents.filter(event => {
    const matchesSearch = !searchQuery ||
      (event.metadata?.ip_address ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.event_desc ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEvent = eventFilter === 'all' ||
      (eventFilter === 'security_alert' && event.event_type === 'security_alert') ||
      (eventFilter === 'password_reset' && event.event_type === 'password_reset')
    return matchesSearch && matchesEvent
  })

  // -- Blocked IPs set for quick lookup -----------------------
  const blockedIpSet = useMemo(
    () => new Set(blockedIpsList.map(b => b.ip_address)),
    [blockedIpsList]
  )

  // -- Filter login records -----------------------------------
  const filteredLogins = loginRecords.filter(login => {
    if (!searchQuery) return true
    return (
      (login.ip_address    ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (login.user_email    ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (login.location_name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // -- Render -------------------------------------------------
  return (
    <div className="flex flex-col gap-5">

      {/* Sub-tab switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-2xl border"
             style={{ backgroundColor: C.bg, borderColor: C.border }}>
          {([
            { key: 'activity', label: 'Activity Workspace', icon: Activity },
            { key: 'network',  label: 'Network Guard',      icon: Globe    },
          ] as const).map(tab => {
            const Icon     = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
                style={{
                  backgroundColor: isActive ? '#8fff00' : 'transparent',
                  color:           isActive ? C.lime      : C.muted,
                }}>
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Silent refresh indicator */}
        {silentRefresh && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.limeDeep }} />
            <p className="text-[11px] font-semibold" style={{ color: C.muted }}>Refreshing...</p>
          </div>
        )}
      </div>

      {/* -- ACTIVITY WORKSPACE ----------------------------- */}
      {activeTab === 'activity' && (
        <div className="flex flex-col gap-5">

          {/* HUD Cards */}
          <HudCards
            stats={{
              ...hudStats,
              activeAlerts: Math.max(0, hudStats.activeAlerts - dismissedIds.size),
            }}
            loading={loading}
          />

          {/* Fraud Sentinel */}
          <FraudSentinelBanner
              alerts={securityEvents.filter(e => !dismissedIds.has(e.id))}
              onLockAccount={handleLockAccount}
              onDismiss={handleDismissAlert}
              canLock={can('lock_account')}
              canDismiss={can('dismiss_alert')}
            />

          {/* Filters Bar */}
          <FiltersBar
            eventFilter={eventFilter}       setEventFilter={setEventFilter}
            timeFilter={timeFilter}         setTimeFilter={setTimeFilter}
           searchQuery={searchQuery}       setSearchQuery={setSearchQuery}
              isAutoRefresh={isAutoRefresh}
              lastUpdated={lastUpdated}
              onExport={handleExport}
              onManualRefresh={() => loadData(false)}
              canExport={can('export_logs')}
              onClearLogs={() => setShowClearLogs(true)}
              canClear={can('clear_logs')}
            />

          {/* Two column logs */}
            {can('view_logs') ? (
              <div className="flex gap-4 items-start">
                <AdminActionLogs
                  logs={filteredAdminLogs}
                  loading={loading}
                  obscureEmail={obscureEmail}
                />
                <UserSecurityEvents
                    events={filteredSecurityEvents}
                    loading={loading}
                    onBlockIp={openBlockIpModal}
                    dismissedIds={dismissedIds}
                    founderIps={currentUserIps}
                    blockedIps={blockedIpSet}
                    canBlock={can('block_ip')}
                  />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[13px] font-bold" style={{ color: C.muted }}>You don't have access to view security logs</p>
              </div>
            )}

          </div>
        )}

      {/* -- NETWORK GUARD ---------------------------------- */}
      {activeTab === 'network' && (
        <div className="flex flex-col gap-5">

          {/* Filters Bar */}
          <FiltersBar
              eventFilter={eventFilter}       setEventFilter={setEventFilter}
              timeFilter={timeFilter}         setTimeFilter={setTimeFilter}
              searchQuery={searchQuery}       setSearchQuery={setSearchQuery}
              isAutoRefresh={isAutoRefresh}
              lastUpdated={lastUpdated}
              onExport={handleExport}
              onManualRefresh={() => loadData(false)}
              canExport={can('export_logs')}
            />

            {/* Login Anomalies Table */}
          <LoginAnomaliesTable
              logins={filteredLogins}
              loading={loading}
              onBlockIp={openBlockIpModal}
              blockedIps={blockedIpSet}
              founderIps={currentUserIps}
              canBlock={can('block_ip')}
            />

          {/* Blocked IPs Panel */}
          <BlockedIpsPanel
              blockedIps={blockedIpsList}
              loading={loading}
              onUnblock={handleUnblockIp}
              canUnblock={can('unblock_ip')}
            />

        </div>
      )}

      {/* Block IP confirmation modal */}
      {blockIpModal && (
        <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
             onClick={e => e.target === e.currentTarget && !blocking && setBlockIpModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
               style={{ border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3 px-6 py-4 border-b"
                 style={{ borderColor: C.border, backgroundColor: 'rgba(185,28,28,0.04)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
                <Ban size={18} style={{ color: C.red }} />
              </div>
              <div>
                <p className="text-[15px] font-black" style={{ color: C.dark }}>Block IP Address</p>
                <p className="text-[11px] font-mono" style={{ color: C.red }}>{blockIpModal}</p>
              </div>
              <button onClick={() => { setBlockIpModal(null); setBlockReason('') }}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
                <X size={15} style={{ color: C.muted }} />
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border"
                   style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.2)' }}>
                {[
                  'All traffic from this IP will be blocked immediately',
                  'Any active sessions from this IP will be terminated',
                  'The IP owner will receive a 403 Forbidden response',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: C.red }} />
                    <p className="text-[11px]" style={{ color: C.muted }}>{item}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  REASON FOR BLOCK <span style={{ color: C.red }}>*</span>
                </p>
                <input
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="e.g. Brute force login attempt, suspicious activity..."
                  autoFocus
                  className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                  style={{
                    borderColor:     blockReason.trim().length > 5 ? C.lime : C.border,
                    backgroundColor: C.bg,
                    color:           C.text,
                  }} />
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>
                  Minimum 5 characters — saved to blocked IPs registry
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setBlockIpModal(null); setBlockReason('') }}
                  disabled={blocking}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button
                  onClick={confirmBlockIp}
                  disabled={blockReason.trim().length < 5 || blocking}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
                  style={{ backgroundColor: C.red, color: '#fff' }}>
                  {blocking
                      ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                      : <><Ban size={14} /> Block IP</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear Logs confirmation modal */}
        {showClearLogs && (
          <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
               style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
               onClick={e => e.target === e.currentTarget && !clearing && setShowClearLogs(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                 style={{ border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3 px-6 py-4 border-b"
                   style={{ borderColor: C.border, backgroundColor: 'rgba(185,28,28,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
                  <Trash2 size={18} style={{ color: C.red }} />
                </div>
                <div>
                  <p className="text-[15px] font-black" style={{ color: C.dark }}>Clear Security Logs</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>This cannot be undone</p>
                </div>
                <button onClick={() => { setShowClearLogs(false); setClearConfirmText('') }}
                  className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
                  <X size={15} style={{ color: C.muted }} />
                </button>
              </div>
              <div className="px-6 py-5 flex flex-col gap-4">
                <p className="text-[13px]" style={{ color: C.muted }}>
                  This permanently deletes all admin action logs and security alert history. Login and impersonation records elsewhere are not affected.
                </p>
                <div>
                  <p className="text-[12px] font-bold mb-2" style={{ color: C.dark }}>
                    Type <code style={{ backgroundColor: C.bg, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>DELETE</code> to confirm:
                  </p>
                  <input value={clearConfirmText} onChange={e => setClearConfirmText(e.target.value.toUpperCase())}
                    placeholder="DELETE" autoFocus
                    className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none"
                    style={{ borderColor: C.border }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowClearLogs(false); setClearConfirmText('') }} disabled={clearing}
                    className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                    style={{ borderColor: C.border, color: C.muted }}>
                    Cancel
                  </button>
                  <button onClick={handleClearLogs}
                    disabled={clearConfirmText !== 'DELETE' || clearing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
                    style={{ backgroundColor: C.red, color: '#fff' }}>
                    {clearing
                      ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                      : <><Trash2 size={14} /> Clear Logs</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast notifications */}
      {toast && <SecurityToast msg={toast.msg} type={toast.type} />}

    </div>
  )
}
