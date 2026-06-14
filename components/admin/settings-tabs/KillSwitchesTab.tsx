'use client'
// components/admin/settings-tabs/KillSwitchesTab.tsx
// ══════════════════════════════════════════════════════════════
// RIAZIFY — Kill Switches Tab
// Emergency feature control — changes are instant + logged
// Disabling requires reason. Enabling is instant.
// Kill All — single button disables all switches at once
// Auto-refreshes every 30 seconds via Visibility API
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import MaintenanceScheduleModal from '@/components/admin/MaintenanceScheduleModal'
import {
  AlertTriangle, CheckCircle, X, RefreshCw,
  ShieldOff, Shield, Clock, User, Zap,
  Activity, ChevronDown, Calendar,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────
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

// ── Types ──────────────────────────────────────────────────────
interface KillSwitch {
  id:           string
  title:        string
  description:  string | null
  is_enabled:   boolean
  is_visible:   boolean
  changed_by:   string | null
  change_note:  string | null
  updated_at:   string
  changer_name?: string | null
}

interface AuditEntry {
  id:         string
  admin_id:   string | null
  action:     string
  details:    string | null
  metadata:   Record<string, any>
  ip_address: string | null
  created_at: string
  admin_name?: string | null
}

// ── Helpers ────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function offlineDuration(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins} min`
  if (hours < 24) return `${hours}h`
  return `${days} day${days !== 1 ? 's' : ''}`
}

// ── Live ticking timestamp ─────────────────────────────────────
function LiveTimeAgo({ iso }: { iso: string }) {
  const [display, setDisplay] = useState(timeAgo(iso))
  useEffect(() => {
    setDisplay(timeAgo(iso))
    const tick = setInterval(() => setDisplay(timeAgo(iso)), 60000)
    return () => clearInterval(tick)
  }, [iso])
  return <>{display}</>
}

// ── Live ticking sync counter ──────────────────────────────────
function SyncIndicator({ lastSync, isAutoRefresh }: { lastSync: number; isAutoRefresh: boolean }) {
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    setSecondsAgo(0)
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastSync) / 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [lastSync])

  const label = secondsAgo < 3 ? 'Just synced' : `Synced ${secondsAgo}s ago`

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
         style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="w-1.5 h-1.5 rounded-full animate-pulse"
           style={{ backgroundColor: isAutoRefresh ? C.green : C.muted }} />
      <p className="text-[11px] font-semibold" style={{ color: C.muted }}>
        {isAutoRefresh ? label : 'Paused'}
      </p>
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark,    border: C.lime,   color: C.lime },
    error:   { bg: '#FEF2F2', border: '#FECACA', color: C.red  },
    info:    { bg: C.bg,      border: C.border,  color: C.text },
  }
  const t = map[type]
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
         style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}>
      <CheckCircle size={15} style={{ color: t.color }} />
      <p className="text-[13px] font-bold" style={{ color: t.color }}>{msg}</p>
    </div>
  )
}

// ── HUD Cards ──────────────────────────────────────────────────
function HudCards({ switches, loading }: { switches: KillSwitch[]; loading: boolean }) {
  const online     = switches.filter(s => s.is_enabled).length
  const offline    = switches.filter(s => !s.is_enabled).length
  const hidden     = switches.filter(s => !s.is_visible).length
  const total      = switches.length
  const lastChange = switches.length > 0
    ? switches.reduce((a, b) => new Date(a.updated_at) > new Date(b.updated_at) ? a : b)
    : null

  // Platform health
  const healthPct  = total > 0 ? Math.round((online / total) * 100) : 100
  const healthLabel = offline === 0 ? 'ALL SYSTEMS GO'
    : offline <= 2  ? 'DEGRADED'
    : 'CRITICAL'
  const healthColor = offline === 0 ? C.limeDeep
    : offline <= 2  ? C.amber
    : C.red
  const healthBg    = offline === 0 ? C.limeTint
    : offline <= 2  ? 'rgba(217,119,6,0.08)'
    : 'rgba(185,28,28,0.08)'

  const cards = [
    {
      title: 'Online Features',
      value: String(online),
      sub:   'currently active',
      icon:  Shield,
      color: C.limeDeep,
      bg:    C.limeTint,
    },
    {
      title: 'Offline Features',
      value: String(offline),
      sub:   offline > 0 ? 'needs attention' : 'all clear',
      icon:  ShieldOff,
      color: offline > 0 ? C.red : C.muted,
      bg:    offline > 0 ? 'rgba(185,28,28,0.08)' : C.bg,
    },
    {
      title: 'Hidden Tools',
      value: String(hidden),
      sub:   hidden > 0 ? 'invisible to users' : 'all visible',
      icon:  hidden > 0 ? ShieldOff : Shield,
      color: hidden > 0 ? C.amber : C.muted,
      bg:    hidden > 0 ? 'rgba(217,119,6,0.08)' : C.bg,
    },
    {
      title: 'Platform Health',
      value: `${healthPct}%`,
      sub:   healthLabel,
      icon:  Activity,
      color: healthColor,
      bg:    healthBg,
    },
    {
      title: 'Last Change',
      value: lastChange ? timeAgo(lastChange.updated_at) : '—',
      sub:   lastChange?.changer_name ?? 'No changes yet',
      icon:  Clock,
      color: C.muted,
      bg:    C.bg,
    },
  ]

  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
                {card.title.toUpperCase()}
              </p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: card.bg }}>
                <Icon size={15} style={{ color: card.color }} />
              </div>
            </div>
            {loading
              ? <div className="h-8 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />
              : <p className="text-[28px] font-black tracking-tight leading-none" style={{ color: card.color === C.muted ? C.dark : card.color }}>
                  {card.value}
                </p>
            }
            <p className="text-[11px] font-semibold" style={{ color: C.muted }}>{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Kill Switch Row (table row) ───────────────────────────────
function KillSwitchRow({
  sw, onDisable, onEnable, onToggleVisibility, onSchedule, toggling, visibilityToggling, currentUserName,
}: {
  sw:                  KillSwitch
  onDisable:           (sw: KillSwitch) => void
  onEnable:            (sw: KillSwitch) => void
  onToggleVisibility:  (sw: KillSwitch) => void
  onSchedule:          (sw: KillSwitch) => void
  toggling:            string | null
  visibilityToggling:  string | null
  currentUserName:     string
}) {
  const isOffline            = !sw.is_enabled
  const isHidden             = !sw.is_visible
  const isToggling           = toggling === sw.id
  const isVisibilityToggling = visibilityToggling === sw.id

  const offlineDur  = isOffline ? offlineDuration(sw.updated_at) : null
  const offlineDays = isOffline
    ? Math.floor((Date.now() - new Date(sw.updated_at).getTime()) / 86400000)
    : 0

  // Inline toggle component
  function Toggle({ on, spinning, onClick }: { on: boolean; spinning: boolean; onClick: () => void }) {
    if (spinning) return (
      <div className="w-11 h-6 flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
             style={{ borderTopColor: C.limeDeep }} />
      </div>
    )
    return (
      <div onClick={onClick} className="relative w-11 h-6 rounded-full cursor-pointer"
           style={{ backgroundColor: on ? C.dark : 'rgba(185,28,28,0.35)', transition: 'background-color 0.25s ease' }}>
        <div style={{
          position: 'absolute', top: '2px', left: '2px',
          width: '20px', height: '20px', borderRadius: '50%',
          backgroundColor: on ? C.lime : '#ffffff',
          transform: on ? 'translateX(21px)' : 'translateX(0px)',
          transition: 'transform 0.25s ease, background-color 0.25s ease',
        }} />
      </div>
    )
  }

  function VisibleToggle({ on, spinning, onClick }: { on: boolean; spinning: boolean; onClick: () => void }) {
    if (spinning) return (
      <div className="w-11 h-6 flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
             style={{ borderTopColor: C.limeDeep }} />
      </div>
    )
    return (
      <div onClick={onClick} className="relative w-11 h-6 rounded-full cursor-pointer"
           style={{ backgroundColor: on ? C.dark : 'rgba(100,116,139,0.35)', transition: 'background-color 0.25s ease' }}>
        <div style={{
          position: 'absolute', top: '2px', left: '2px',
          width: '20px', height: '20px', borderRadius: '50%',
          backgroundColor: on ? C.lime : '#ffffff',
          transform: on ? 'translateX(21px)' : 'translateX(0px)',
          transition: 'transform 0.25s ease, background-color 0.25s ease',
        }} />
      </div>
    )
  }

  return (
    <div className="grid items-center px-4 py-3 border-b last:border-b-0 transition-all hover:bg-[#fafcf8]"
         style={{
           gridTemplateColumns: '1.4fr 0.6fr 0.7fr 1.6fr 0.8fr 0.8fr 0.8fr 1fr',
           gap: 12,
           borderColor: C.border,
           backgroundColor: isOffline ? 'rgba(185,28,28,0.02)' : 'transparent',
         }}>

      {/* TOOL NAME */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[12px] font-black truncate"
             style={{ color: isOffline ? C.red : C.dark }}>
            {sw.title}
          </p>
          {isHidden && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded shrink-0"
                  style={{ backgroundColor: 'rgba(100,116,139,0.1)', color: C.muted }}>
              HIDDEN
            </span>
          )}
        </div>
      </div>

      {/* STATUS */}
      <div>
        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isOffline ? 'rgba(185,28,28,0.08)' : 'rgba(74,143,0,0.08)',
                color:           isOffline ? C.red : C.green,
              }}>
          <div className="w-1.5 h-1.5 rounded-full shrink-0"
               style={{ backgroundColor: isOffline ? C.red : C.green }} />
          {isOffline ? 'OFFLINE' : 'ONLINE'}
        </span>
      </div>

      {/* OFFLINE FOR */}
      <div>
        {isOffline && offlineDur ? (
          <span className="flex items-center gap-1 text-[9px] font-bold"
                style={{ color: offlineDays >= 1 ? C.amber : C.red }}>
            <AlertTriangle size={9} />
            {offlineDur}
          </span>
        ) : (
          <span className="text-[10px]" style={{ color: C.muted }}>—</span>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="min-w-0">
        <p className="text-[10px] truncate" style={{ color: C.muted }}>
          {sw.description ?? '—'}
        </p>
      </div>

      {/* MAINTENANCE toggle */}
      <div className="flex flex-col items-start gap-0.5">
        <p className="text-[7px] font-black tracking-wider" style={{ color: C.muted }}>MAINTENANCE</p>
        <Toggle
          on={sw.is_enabled}
          spinning={isToggling}
          onClick={() => sw.is_enabled ? onDisable(sw) : onEnable(sw)}
        />
      </div>

      {/* VISIBLE toggle */}
      <div className="flex flex-col items-start gap-0.5">
        <p className="text-[7px] font-black tracking-wider" style={{ color: C.muted }}>VISIBLE</p>
        <VisibleToggle
          on={sw.is_visible}
          spinning={isVisibilityToggling}
          onClick={() => onToggleVisibility(sw)}
        />
      </div>

      {/* LAST BY */}
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <User size={9} style={{ color: C.muted, flexShrink: 0 }} />
          <p className="text-[10px] truncate font-semibold" style={{ color: C.text }}>
            {sw.changer_name ?? 'Unknown'}
          </p>
        </div>
        <p className="text-[9px] mt-0.5" style={{ color: C.muted }}>
          <LiveTimeAgo iso={sw.updated_at} />
        </p>
      </div>

      {/* REASON + SCHEDULE */}
      <div className="min-w-0 flex flex-col gap-1.5">
        {sw.change_note ? (
          <p className="text-[10px] italic truncate" style={{ color: C.muted }}>
            "{sw.change_note}"
          </p>
        ) : (
          <span className="text-[10px]" style={{ color: C.muted }}>—</span>
        )}
        <button
          onClick={() => onSchedule(sw)}
          className="flex items-center gap-1 self-start px-2 py-0.5 rounded-lg text-[9px] font-bold hover:opacity-80 transition-opacity"
          style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.limeDeep}33` }}>
          <Calendar size={9} />
          Schedule
        </button>
      </div>

    </div>
  )
}

// ── Disable Confirmation Modal ─────────────────────────────────
function DisableConfirmModal({
  sw, onClose, onConfirm,
}: {
  sw:        KillSwitch
  onClose:   () => void
  onConfirm: (reason: string) => void
}) {
  const [reason,     setReason]     = useState('')
  const [confirming, setConfirming] = useState(false)
  const isValid = reason.trim().length >= 5

  async function handleConfirm() {
    if (!isValid) return
    setConfirming(true)
    try {
      await onConfirm(reason.trim())
    } catch {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
         onClick={e => e.target === e.currentTarget && !confirming && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: '1px solid rgba(185,28,28,0.3)' }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b"
             style={{ borderColor: 'rgba(185,28,28,0.15)', backgroundColor: 'rgba(185,28,28,0.04)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
            <ShieldOff size={18} style={{ color: C.red }} />
          </div>
          <div>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Emergency Shutdown</p>
            <p className="text-[11px]" style={{ color: C.muted }}>Disables feature for ALL users instantly</p>
          </div>
          <button onClick={onClose} disabled={confirming}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50">
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="px-4 py-3 rounded-2xl border"
               style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.2)' }}>
            <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.red }}>DISABLING</p>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>{sw.title}</p>
            <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{sw.description}</p>
          </div>
          <div className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border"
               style={{ backgroundColor: 'rgba(185,28,28,0.03)', borderColor: 'rgba(185,28,28,0.15)' }}>
            {[
              'Feature will go offline for ALL users immediately',
              'Users mid-session will lose access instantly',
              'Change will be logged with your name and reason',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: C.red }} />
                <p className="text-[11px]" style={{ color: C.muted }}>{item}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>
              REASON FOR EMERGENCY SHUTDOWN <span style={{ color: C.red }}>*</span>
            </p>
            <input
              value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. eBay API returning 500 errors, rate limit hit..."
              autoFocus
              className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
              style={{
                borderColor:     isValid ? C.lime : C.border,
                backgroundColor: C.bg, color: C.text,
                boxShadow:       isValid ? '0 0 0 3px rgba(143,255,0,0.12)' : 'none',
                transition:      'border-color 0.2s, box-shadow 0.2s',
              }} />
            <p className="text-[10px] mt-1" style={{ color: C.muted }}>
              Minimum 5 characters — saved to admin logs
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={confirming}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold disabled:opacity-40"
              style={{ borderColor: C.border, color: C.muted }}>
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={!isValid || confirming}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: C.red, color: '#fff' }}>
              {confirming
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                : <><ShieldOff size={14} /> Disable Now</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Kill All Modal ─────────────────────────────────────────────
function KillAllModal({
  activeCount, onClose, onConfirm,
}: {
  activeCount: number
  onClose:     () => void
  onConfirm:   (reason: string) => void
}) {
  const [reason,     setReason]     = useState('')
  const [confirming, setConfirming] = useState(false)
  const isValid = reason.trim().length >= 5

  async function handleConfirm() {
    if (!isValid) return
    setConfirming(true)
    try {
      await onConfirm(reason.trim())
    } catch {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
         onClick={e => e.target === e.currentTarget && !confirming && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: '2px solid rgba(185,28,28,0.5)' }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b"
             style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: 'rgba(185,28,28,0.06)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: 'rgba(185,28,28,0.15)' }}>
            <Zap size={18} style={{ color: C.red }} />
          </div>
          <div>
            <p className="text-[15px] font-black" style={{ color: C.red }}>EMERGENCY KILL ALL</p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              Disables all {activeCount} active feature{activeCount !== 1 ? 's' : ''} simultaneously
            </p>
          </div>
          <button onClick={onClose} disabled={confirming}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50">
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Impact warning */}
          <div className="px-4 py-3 rounded-2xl border"
               style={{ backgroundColor: 'rgba(185,28,28,0.06)', borderColor: 'rgba(185,28,28,0.3)' }}>
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.red }}>
              PLATFORM IMPACT
            </p>
            {[
              `All ${activeCount} active features will go offline instantly`,
              'Every user on the platform loses tool access immediately',
              'A single high-priority audit event will be logged',
              'You must re-enable each switch individually to restore service',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: C.red }} />
                <p className="text-[11px]" style={{ color: C.muted }}>{item}</p>
              </div>
            ))}
          </div>
          {/* Reason */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>
              EMERGENCY REASON <span style={{ color: C.red }}>*</span>
            </p>
            <input
              value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. Major platform outage — all APIs down..."
              autoFocus
              className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
              style={{
                borderColor:     isValid ? C.lime : C.border,
                backgroundColor: C.bg, color: C.text,
                boxShadow:       isValid ? '0 0 0 3px rgba(143,255,0,0.12)' : 'none',
                transition:      'border-color 0.2s, box-shadow 0.2s',
              }} />
            <p className="text-[10px] mt-1" style={{ color: C.muted }}>
              Minimum 5 characters — logged as high-priority emergency event
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={confirming}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold disabled:opacity-40"
              style={{ borderColor: C.border, color: C.muted }}>
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={!isValid || confirming}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: C.red, color: '#fff' }}>
              {confirming
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                : <><Zap size={14} /> Kill All Systems</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Audit Trail Panel ──────────────────────────────────────────
function AuditTrailPanel({ entries, loading }: { entries: AuditEntry[]; loading: boolean }) {
  function actionLabel(action: string): { label: string; color: string; bg: string } {
    if (action === 'disable_kill_switch')  return { label: 'DISABLED',  color: C.red,      bg: 'rgba(185,28,28,0.08)'  }
    if (action === 'enable_kill_switch')   return { label: 'ENABLED',   color: C.green,    bg: 'rgba(22,163,74,0.08)'  }
    if (action === 'kill_all_switches')    return { label: 'KILL ALL',  color: '#fff',     bg: C.red                   }
    return { label: action.toUpperCase(), color: C.muted, bg: C.bg }
  }

  return (
    <div className="rounded-2xl border overflow-hidden"
         style={{ borderColor: C.border, backgroundColor: C.surface }}>

      {/* Panel header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b"
           style={{ borderColor: C.border, backgroundColor: C.bg }}>
        <Activity size={14} style={{ color: C.muted }} />
        <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
          EMERGENCY OPERATIONS AUDIT TRAIL
        </p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
              style={{ backgroundColor: C.surface, color: C.muted, border: `1px solid ${C.border}` }}>
          Last 10 events
        </span>
      </div>

      {loading && entries.length === 0 ? (
        // First load skeleton — match table column layout
        <div className="overflow-x-auto">
          <div className="grid px-4 py-2 border-b"
               style={{ gridTemplateColumns: '0.7fr 1.4fr 0.6fr 0.6fr 1fr 0.7fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
            {['ACTION', 'SWITCH NAME', 'BEFORE→AFTER', 'ADMIN', 'REASON', 'TIME'].map(h => (
              <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid px-4 py-3 border-b last:border-b-0 items-center animate-pulse"
                 style={{ gridTemplateColumns: '0.7fr 1.4fr 0.6fr 0.6fr 1fr 0.7fr', gap: 12, borderColor: C.border }}>
              <div className="h-5 w-16 rounded-lg" style={{ backgroundColor: C.bg }} />
              <div className="h-4 w-32 rounded-full" style={{ backgroundColor: C.bg }} />
              <div className="h-4 w-20 rounded-full" style={{ backgroundColor: C.bg }} />
              <div className="h-4 w-20 rounded-full" style={{ backgroundColor: C.bg }} />
              <div className="h-4 w-24 rounded-full" style={{ backgroundColor: C.bg }} />
              <div className="h-4 w-12 rounded-full" style={{ backgroundColor: C.bg }} />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-2">
          <Activity size={20} style={{ color: C.border }} />
          <p className="text-[12px]" style={{ color: C.muted }}>No kill switch events recorded yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
          {/* Table header */}
          <div className="grid px-4 py-2 border-b"
               style={{
                 gridTemplateColumns: '0.7fr 1.4fr 0.6fr 0.6fr 1fr 0.7fr',
                 gap: 12,
                 borderColor: C.border,
                 backgroundColor: C.bg,
               }}>
            {['ACTION', 'SWITCH NAME', 'BEFORE→AFTER', 'ADMIN', 'REASON', 'TIME'].map(h => (
              <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {entries.map((entry, idx) => {
            const mapped    = actionLabel(entry.action)
            const isKillAll = entry.action === 'kill_all_switches'
            const prevVal   = entry.metadata?.previous
            const newVal    = entry.metadata?.new_value
            const hasBefore = typeof prevVal === 'boolean' && typeof newVal === 'boolean'
            const ipRaw     = entry.ip_address
            const ip        = ipRaw ? ipRaw : '—'
            const reason    = entry.metadata?.change_note ?? null
            const switchTitle = entry.metadata?.switch_title ?? (entry.details ?? '—')

            return (
              <div key={entry.id}
                   className="grid px-4 py-3 border-b last:border-b-0 items-center hover:bg-[#fafcf8] transition-colors"
                   style={{
                     gridTemplateColumns: '0.7fr 1.4fr 0.6fr 0.6fr 1fr 0.7fr',
                     gap:         12,
                     borderColor: C.border,
                   }}>

                {/* ACTION */}
                <div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-lg"
                        style={{ backgroundColor: mapped.bg, color: mapped.color }}>
                    {mapped.label}
                  </span>
                </div>

                {/* SWITCH NAME */}
                <div className="min-w-0">
                  {isKillAll ? (
                    <div>
                      <p className="text-[11px] font-bold" style={{ color: C.red }}>ALL SYSTEMS</p>
                      <p className="text-[9px]" style={{ color: C.muted }}>
                        {entry.metadata?.count ?? '?'} switches killed
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] font-bold truncate" style={{ color: C.dark }}>
                      {switchTitle}
                    </p>
                  )}
                </div>

                {/* BEFORE → AFTER */}
                <div>
                  {hasBefore ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: prevVal ? C.limeTint : 'rgba(185,28,28,0.08)', color: prevVal ? C.limeDeep : C.red }}>
                        {prevVal ? 'ON' : 'OFF'}
                      </span>
                      <span className="text-[9px]" style={{ color: C.muted }}>→</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: newVal ? C.limeTint : 'rgba(185,28,28,0.08)', color: newVal ? C.limeDeep : C.red }}>
                        {newVal ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  ) : isKillAll ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>ON</span>
                      <span className="text-[9px]" style={{ color: C.muted }}>→</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>OFF</span>
                    </div>
                  ) : (
                    <span className="text-[10px]" style={{ color: C.muted }}>—</span>
                  )}
                </div>

                {/* ADMIN */}
                <div className="flex items-center gap-1 min-w-0">
                  <User size={9} style={{ color: C.muted, flexShrink: 0 }} />
                  <p className="text-[10px] font-semibold truncate" style={{ color: C.text }}>
                    {entry.admin_name ?? entry.metadata?.admin_name ?? 'Unknown'}
                  </p>
                </div>

                {/* REASON */}
                <div className="min-w-0">
                  {reason ? (
                    <p className="text-[10px] italic truncate" style={{ color: C.muted }}>
                      "{reason}"
                    </p>
                  ) : (
                    <span className="text-[10px]" style={{ color: C.muted }}>—</span>
                  )}
                </div>

                {/* TIME */}
                <div>
                  <p className="text-[10px] font-semibold" style={{ color: C.muted }}>
                    <LiveTimeAgo iso={entry.created_at} />
                  </p>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function KillSwitchesTab({ isInvestorMode = false }: { isInvestorMode?: boolean }) {
  const supabase = createClient()

  const [switches,       setSwitches]       = useState<KillSwitch[]>([])
  const [auditEntries,   setAuditEntries]   = useState<AuditEntry[]>([])
  const [loading,        setLoading]        = useState(true)
  const [auditLoading,   setAuditLoading]   = useState(true)
  const [toggling,       setToggling]       = useState<string | null>(null)
  const [visibilityToggling, setVisibilityToggling] = useState<string | null>(null)
  const [killingAll,     setKillingAll]     = useState(false)
  const [disableTarget,  setDisableTarget]  = useState<KillSwitch | null>(null)
  const [showKillAll,    setShowKillAll]    = useState(false)
  const [toast,          setToast]          = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [lastSync,       setLastSync]       = useState(Date.now())
  const [isAutoRefresh,  setIsAutoRefresh]  = useState(true)
  const [currentUserId,  setCurrentUserId]  = useState<string | null>(null)
  const [currentUserName,setCurrentUserName]= useState<string>('Admin')
  const intervalRef                         = useRef<NodeJS.Timeout | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch current user ─────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      setCurrentUserId(session.user.id)
      supabase.from('profiles').select('name').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCurrentUserName((data as any).name ?? 'Admin') })
    })
  }, [supabase])

  // ── Load switches ──────────────────────────────────────────
  const loadSwitches = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data: switchData } = await (supabase.from('kill_switches') as any)
        .select('*').order('title', { ascending: true })

      if (switchData && switchData.length > 0) {
        const changerIds = [...new Set((switchData as any[]).map(s => s.changed_by).filter(Boolean))]
        let nameMap: Record<string, string> = {}
        if (changerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles').select('id, name').in('id', changerIds)
          nameMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.name ?? 'Unknown']))
        }
        setSwitches((switchData as any[]).map(s => ({
          ...s,
          changer_name: s.changed_by ? (nameMap[s.changed_by] ?? 'Unknown') : null,
        })) as KillSwitch[])
      }
      setLastSync(Date.now())
    } catch (e) {
      console.error('[KillSwitchesTab] loadSwitches error:', e)
      if (!silent) showToast('Failed to load kill switches', 'error')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // ── Load audit trail ───────────────────────────────────────
  const loadAudit = useCallback(async () => {
    setAuditLoading(true)
    try {
      const { data: auditData } = await (supabase.from('admin_logs') as any)
        .select('*')
        .in('action', ['disable_kill_switch', 'enable_kill_switch', 'kill_all_switches'])
        .order('created_at', { ascending: false })
        .limit(10)

      if (auditData && auditData.length > 0) {
        const adminIds = [...new Set((auditData as any[]).map(e => e.admin_id).filter(Boolean))]
        let nameMap: Record<string, string> = {}
        if (adminIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles').select('id, name').in('id', adminIds)
          nameMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.name ?? 'Unknown']))
        }
        setAuditEntries((auditData as any[]).map(e => ({
          ...e,
          admin_name: e.admin_id ? (nameMap[e.admin_id] ?? 'Unknown') : null,
        })) as AuditEntry[])
      } else {
        setAuditEntries([])
      }
    } catch (e) {
      console.error('[KillSwitchesTab] loadAudit error:', e)
    } finally {
      setAuditLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadSwitches(false)
    loadAudit()
  }, [loadSwitches, loadAudit])

  // ── Auto-refresh every 30 seconds ─────────────────────────
  useEffect(() => {
    function startInterval() {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadSwitches(true)
          loadAudit()
        }
      }, 30000)
    }
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        setIsAutoRefresh(true)
        loadSwitches(true)
        loadAudit()
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
  }, [loadSwitches, loadAudit])

  // ── Disable single switch ──────────────────────────────────
  async function handleDisable(reason: string) {
    if (!disableTarget) return
    const sw = disableTarget
    setToggling(sw.id)
    setDisableTarget(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/kill-switches/toggle', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: sw.id, is_enabled: false, change_note: reason }),
      })
      if (res.ok) {
        const json = await res.json()
        setSwitches(prev => prev.map(s =>
          s.id === sw.id ? {
            ...s,
            is_enabled:   false,
            change_note:  reason,
            changer_name: currentUserName,
            updated_at:   json.switch?.updated_at ?? new Date().toISOString(),
          } : s
        ))
        showToast(`${sw.title} disabled`, 'error')
        loadAudit()
      } else {
        const json = await res.json()
        showToast(json.error ?? 'Failed to disable switch', 'error')
      }
    } catch {
      showToast('Network error — switch not updated', 'error')
    }
    setToggling(null)
  }

  // ── Enable single switch ───────────────────────────────────
  async function handleEnable(sw: KillSwitch) {
    setToggling(sw.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/kill-switches/toggle', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: sw.id, is_enabled: true, change_note: null }),
      })
      if (res.ok) {
        const json = await res.json()
        setSwitches(prev => prev.map(s =>
          s.id === sw.id ? {
            ...s,
            is_enabled:   true,
            change_note:  null,
            changer_name: currentUserName,
            updated_at:   json.switch?.updated_at ?? new Date().toISOString(),
          } : s
        ))
        showToast(`${sw.title} is back online`, 'success')
        loadAudit()
      } else {
        const json = await res.json()
        showToast(json.error ?? 'Failed to enable switch', 'error')
      }
    } catch {
      showToast('Network error — switch not updated', 'error')
    }
    setToggling(null)
  }

  // ── Toggle sidebar visibility ──────────────────────────────
  async function handleToggleVisibility(sw: KillSwitch) {
    setVisibilityToggling(sw.id)
    const newVisibility = !sw.is_visible
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/kill-switches/toggle', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: sw.id, is_visible: newVisibility }),
      })
      if (res.ok) {
        setSwitches(prev => prev.map(s =>
          s.id === sw.id ? { ...s, is_visible: newVisibility } : s
        ))
        showToast(
          `${sw.title} ${newVisibility ? 'visible in sidebar' : 'hidden from sidebar'}`,
          newVisibility ? 'success' : 'info'
        )
      } else {
        const json = await res.json()
        showToast(json.error ?? 'Failed to update visibility', 'error')
      }
    } catch {
      showToast('Network error — visibility not updated', 'error')
    }
    setVisibilityToggling(null)
  }

  // ── Kill All ───────────────────────────────────────────────
  async function handleKillAll(reason: string) {
    setKillingAll(true)
    setShowKillAll(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/kill-switches/kill-all', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ change_note: reason }),
      })
      if (res.ok) {
        setSwitches(prev => prev.map(s => ({
          ...s,
          is_enabled:   false,
          change_note:  reason,
          changer_name: currentUserName,
          updated_at:   new Date().toISOString(),
        })))
        showToast('All systems killed — platform in emergency mode', 'error')
        loadAudit()
      } else {
        const json = await res.json()
        showToast(json.error ?? 'Failed to kill all switches', 'error')
      }
    } catch {
      showToast('Network error — kill all failed', 'error')
    }
    setKillingAll(false)
  }

  const [showEmergency,  setShowEmergency]  = useState(false)
  const [scheduleTarget, setScheduleTarget] = useState<KillSwitch | null>(null)
  const activeCount = switches.filter(s => s.is_enabled).length

  return (
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} style={{ color: C.red }} />
          <div>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Global Kill Switches</p>
            <p className="text-[12px]" style={{ color: C.muted }}>
              Emergency feature control — changes are instant for all users
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SyncIndicator lastSync={lastSync} isAutoRefresh={isAutoRefresh} />

          {/* Manual refresh */}
          <button onClick={() => { loadSwitches(false); loadAudit() }}
            className="h-9 w-9 flex items-center justify-center rounded-xl border hover:opacity-80"
            style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <RefreshCw size={14} style={{ color: C.muted }} />
          </button>
        </div>
      </div>

      {/* HUD Cards */}
      <HudCards switches={switches} loading={loading} />

      {/* Kill Switch Matrix */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border"
           style={{
             borderColor:     switches.some(s => !s.is_enabled) ? 'rgba(185,28,28,0.3)' : C.border,
             backgroundColor: C.surface,
             boxShadow:       switches.some(s => !s.is_enabled) ? '0 0 24px rgba(185,28,28,0.06)' : 'none',
           }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
            KILL SWITCH MATRIX — {switches.length} switches
          </p>
          {switches.some(s => !s.is_enabled) && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.red }} />
              <p className="text-[11px] font-bold" style={{ color: C.red }}>
                {switches.filter(s => !s.is_enabled).length} offline
              </p>
            </div>
          )}
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />
          ))
        ) : switches.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Shield size={22} style={{ color: C.border }} />
            <p className="text-[13px]" style={{ color: C.muted }}>No kill switches configured</p>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
            {/* Table header */}
            <div className="grid px-4 py-2 border-b"
                 style={{
                   gridTemplateColumns: '1.4fr 0.6fr 0.7fr 1.6fr 0.8fr 0.8fr 0.8fr 1fr',
                   gap: 12,
                   borderColor: C.border,
                   backgroundColor: C.bg,
                 }}>
              {['TOOL NAME', 'STATUS', 'OFFLINE FOR', 'DESCRIPTION', 'MAINTENANCE', 'VISIBLE', 'LAST BY', 'REASON / SCHEDULE'].map(h => (
                <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>
                  {h}
                </span>
              ))}
            </div>
            {/* Table rows */}
            {switches.map(sw => (
              <KillSwitchRow
                key={sw.id}
                sw={sw}
                onDisable={s => setDisableTarget(s)}
                onEnable={handleEnable}
                onToggleVisibility={handleToggleVisibility}
                onSchedule={s => setScheduleTarget(s)}
                toggling={toggling}
                visibilityToggling={visibilityToggling}
                currentUserName={currentUserName}
              />
            ))}
          </div>
        )}
      </div>

      {/* Audit Trail */}
      <AuditTrailPanel entries={auditEntries} loading={auditLoading} />

      {/* Emergency Actions — collapsed by default to prevent accidental clicks */}
      <div className="rounded-2xl border overflow-hidden"
           style={{ borderColor: showEmergency ? 'rgba(185,28,28,0.4)' : C.border }}>

        {/* Collapsed header — always visible */}
        <button
          onClick={() => setShowEmergency(s => !s)}
          className="w-full flex items-center justify-between px-5 py-3 hover:opacity-80 transition-all"
          style={{ backgroundColor: showEmergency ? 'rgba(185,28,28,0.05)' : C.bg }}>
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: showEmergency ? C.red : C.muted }} />
            <p className="text-[11px] font-black tracking-wider"
               style={{ color: showEmergency ? C.red : C.muted }}>
              EMERGENCY ACTIONS
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: C.bg, color: C.muted }}>
              Click to expand
            </span>
          </div>
          <ChevronDown size={14} style={{
            color:      C.muted,
            transform:  showEmergency ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }} />
        </button>

        {/* Expanded content */}
        {showEmergency && (
          <div className="px-5 py-4 border-t"
               style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: C.surface }}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-[13px] font-black mb-1" style={{ color: C.red }}>
                  Kill All Systems
                </p>
                <p className="text-[11px]" style={{ color: C.muted }}>
                  Instantly disables all {activeCount} active feature{activeCount !== 1 ? 's' : ''} simultaneously for every user on the platform. Use only during a major outage.
                </p>
              </div>
              <button
                onClick={() => setShowKillAll(true)}
                disabled={killingAll || activeCount === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black hover:opacity-80 disabled:opacity-40 shrink-0"
                style={{ backgroundColor: C.red, color: '#fff' }}>
                {killingAll
                  ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                  : <Zap size={13} />}
                {activeCount === 0 ? 'All Offline' : 'Kill All Systems'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {scheduleTarget && (
        <MaintenanceScheduleModal
          switchId={scheduleTarget.id}
          switchTitle={scheduleTarget.title}
          onClose={() => setScheduleTarget(null)}
        />
      )}
      {disableTarget && (
        <DisableConfirmModal
          sw={disableTarget}
          onClose={() => setDisableTarget(null)}
          onConfirm={handleDisable}
        />
      )}
      {showKillAll && (
        <KillAllModal
          activeCount={activeCount}
          onClose={() => setShowKillAll(false)}
          onConfirm={handleKillAll}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

    </div>
  )
}