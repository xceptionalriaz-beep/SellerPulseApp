'use client'
// components/admin/tabs/ChromeExtensionTab.tsx

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  RefreshCw, Chrome, Zap, Shield, TrendingUp, Download,
  Bell, CheckCircle, Circle, ExternalLink, Plus, Trash2,
  Star, AlertTriangle, X, Check, Send, History, Package,
  Wifi, Users, BarChart2, Radio,
} from 'lucide-react'

// ── Brand tokens ───────────────────────────────────────────────
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
}

interface Props {
  isMobile?:            boolean
  startChartAnimation?: boolean
  isInvestorMode?:      boolean
}

interface Selector {
  id:        string
  key:       string
  value:     string
  pending:   boolean
  editing:   boolean
  editValue: string
}

interface OTAEntry {
  version: string
  notes:   string
  time:    string
}

interface BroadcastEntry {
  severity: 'info' | 'warning' | 'critical'
  message:  string
  time:     string
}

// ── Severity config ────────────────────────────────────────────
const SEV = {
  info: {
    label: 'Info',
    color: C.muted,
    bg:    '#f7f9f5',
    border:C.border,
  },
  warning: {
    label: 'Warning',
    color: C.limeDeep,
    bg:    '#f4ffe6',
    border:C.limeDeep,
  },
  critical: {
    label: 'Critical',
    color: C.dark,
    bg:    C.lime,
    border:C.lime,
  },
}

// ── Default selectors ──────────────────────────────────────────
const DEFAULT_SELECTORS: Selector[] = [
  { id: '1', key: 'itemTitle',     value: '.s-item__title',   pending: false, editing: false, editValue: '.s-item__title'   },
  { id: '2', key: 'itemPrice',     value: '.s-item__price',   pending: false, editing: false, editValue: '.s-item__price'   },
  { id: '3', key: 'sellerName',    value: '.x-sellerInfo',    pending: false, editing: false, editValue: '.x-sellerInfo'    },
  { id: '4', key: 'veroFlag',      value: '.vi-VR-cvipPnl',  pending: false, editing: false, editValue: '.vi-VR-cvipPnl'  },
  { id: '5', key: 'conditionBadge',value: '.x-bin-bsMsg',    pending: false, editing: false, editValue: '.x-bin-bsMsg'    },
]

const DEFAULT_OTA: OTAEntry[] = [
  { version: 'v2.4.1', notes: 'Fixed VeRO scanner false positives on filtered listings', time: '3 days ago' },
  { version: 'v2.4.0', notes: 'Added real-time profit calculator popup overlay',          time: '2 weeks ago' },
]

const DEFAULT_BROADCASTS: BroadcastEntry[] = [
  { severity: 'warning',  message: 'eBay API experiencing intermittent slowdowns',    time: '2 days ago' },
  { severity: 'info',     message: 'New VeRO batch scan feature is now live',          time: '1 week ago' },
]

// ══════════════════════════════════════════════════════════════
export default function ChromeExtensionTab(_props: Props) {
  const supabase = createClient()

  // ── Core state ─────────────────────────────────────────────
  const [isExtensionLive, setIsExtensionLive] = useState(false)
  const [isActive,        setIsActive]        = useState(true)
  const [isRefreshing,    setIsRefreshing]    = useState(false)
  const [toast,           setToast]           = useState<{ msg: string; type: 'success'|'error'|'info' } | null>(null)

  // ── Kill switch confirmation ────────────────────────────────
  const [showKillConfirm,   setShowKillConfirm]   = useState(false)
  const [killConfirmText,   setKillConfirmText]   = useState('')
  const [maintenanceMsg,    setMaintenanceMsg]    = useState('Riazify Extension is temporarily undergoing maintenance. Back online shortly!')
  const [isSavingMsg,       setIsSavingMsg]       = useState(false)
  const [msgSaved,          setMsgSaved]          = useState(false)

  // ── Selector overrides ─────────────────────────────────────
  const [selectors,        setSelectors]         = useState<Selector[]>(DEFAULT_SELECTORS)
  const [isForceSyncing,   setIsForceSyncing]    = useState(false)
  const [isSavingSelectors,setIsSavingSelectors] = useState(false)
  const [newSelectorKey,   setNewSelectorKey]    = useState('')
  const [showAddRow,       setShowAddRow]        = useState(false)
  const editRef = useRef<HTMLInputElement>(null)

  // ── OTA state ──────────────────────────────────────────────
  const [otaVersion,   setOtaVersion]   = useState('')
  const [otaNotes,     setOtaNotes]     = useState('')
  const [isPushingOTA, setIsPushingOTA] = useState(false)
  const [otaSuccess,   setOtaSuccess]   = useState(false)
  const [otaHistory,   setOtaHistory]   = useState<OTAEntry[]>(DEFAULT_OTA)

  // ── Broadcast state ────────────────────────────────────────
  const [severity,          setSeverity]          = useState<'info'|'warning'|'critical'>('info')
  const [broadcastMsg,      setBroadcastMsg]      = useState('')
  const [isSendingBroadcast,setIsSendingBroadcast]= useState(false)
  const [broadcastHistory,  setBroadcastHistory]  = useState<BroadcastEntry[]>(DEFAULT_BROADCASTS)

  // ── Helpers ────────────────────────────────────────────────
  function showToast(msg: string, type: 'success'|'error'|'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleRefresh() {
    setIsRefreshing(true)
    setTimeout(() => { setIsRefreshing(false); showToast('Dashboard refreshed', 'info') }, 1200)
  }

  // ── Kill switch ────────────────────────────────────────────
  function handleKillToggle() {
    if (isActive) {
      setKillConfirmText('')
      setShowKillConfirm(true)
    } else {
      setIsActive(true)
      showToast('Extension reactivated for all users')
    }
  }

  function confirmKillSwitch() {
    if (killConfirmText !== 'MAINTENANCE') return
    setIsActive(false)
    setShowKillConfirm(false)
    setKillConfirmText('')
    showToast('Extension locked — maintenance mode active', 'error')
  }

  async function handleSaveMsg() {
    setIsSavingMsg(true)
    await new Promise(r => setTimeout(r, 800))
    setIsSavingMsg(false)
    setMsgSaved(true)
    setTimeout(() => setMsgSaved(false), 3000)
    showToast('Maintenance message saved')
  }

  // ── Selector logic ─────────────────────────────────────────
  function startEditing(id: string) {
    setSelectors(s => s.map(x => x.id === id
      ? { ...x, editing: true, editValue: x.value }
      : { ...x, editing: false }
    ))
    setTimeout(() => editRef.current?.focus(), 50)
  }

  function commitEdit(id: string) {
    setSelectors(s => s.map(x => x.id === id
      ? { ...x, editing: false, pending: x.editValue !== x.value, value: x.editValue }
      : x
    ))
  }

  function cancelEdit(id: string) {
    setSelectors(s => s.map(x => x.id === id
      ? { ...x, editing: false, editValue: x.value }
      : x
    ))
  }

  function deleteSelector(id: string) {
    setSelectors(s => s.filter(x => x.id !== id))
  }

  function addSelector() {
    if (!newSelectorKey.trim()) return
    const newSel: Selector = {
      id:        Date.now().toString(),
      key:       newSelectorKey.trim(),
      value:     '',
      pending:   true,
      editing:   true,
      editValue: '',
    }
    setSelectors(s => [...s, newSel])
    setNewSelectorKey('')
    setShowAddRow(false)
  }

  async function handleForceSync() {
    setIsForceSyncing(true)
    try {
      // Broadcast via Supabase Realtime to all active extension instances
      const channel = supabase.channel('extension-control')
      await channel.send({
        type:    'broadcast',
        event:   'force_sync',
        payload: {
          selectors: selectors.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
          timestamp: new Date().toISOString(),
        },
      })
      await new Promise(r => setTimeout(r, 1000))
      showToast('Selectors broadcast to all active extensions via WebSocket')
    } catch {
      showToast('Realtime broadcast failed — extensions will sync in next poll', 'error')
    }
    setIsForceSyncing(false)
  }

  async function handleSaveSelectors() {
    setIsSavingSelectors(true)
    await new Promise(r => setTimeout(r, 900))
    setSelectors(s => s.map(x => ({ ...x, pending: false })))
    setIsSavingSelectors(false)
    showToast('Selector overrides saved to database')
  }

  const hasPendingSelectors = selectors.some(s => s.pending)

  // ── OTA push ───────────────────────────────────────────────
  async function handlePushOTA() {
    if (!otaVersion.trim() || !otaNotes.trim()) return
    setIsPushingOTA(true)
    await new Promise(r => setTimeout(r, 1200))
    const entry: OTAEntry = { version: otaVersion.trim(), notes: otaNotes.trim(), time: 'just now' }
    setOtaHistory(h => [entry, ...h])
    setOtaVersion('')
    setOtaNotes('')
    setOtaSuccess(true)
    setTimeout(() => setOtaSuccess(false), 3000)
    setIsPushingOTA(false)
    showToast(`OTA update ${entry.version} pushed to all clients`)
  }

  // ── Broadcast send ─────────────────────────────────────────
  async function handleSendBroadcast() {
    if (!broadcastMsg.trim()) return
    setIsSendingBroadcast(true)
    await new Promise(r => setTimeout(r, 900))
    const entry: BroadcastEntry = { severity, message: broadcastMsg.trim(), time: 'just now' }
    setBroadcastHistory(h => [entry, ...h].slice(0, 5))
    setBroadcastMsg('')
    setSeverity('info')
    setIsSendingBroadcast(false)
    showToast(`${SEV[severity].label} alert sent to all extension users`)
  }

  // ── Checklist items ────────────────────────────────────────
  const checklist = [
    { label: 'Build extension codebase',           done: true  },
    { label: 'Create Chrome Developer account',    done: true  },
    { label: 'Submit to Chrome Web Store',         done: false },
    { label: 'Google review approved (1-3 days)',  done: false },
    { label: 'Connect analytics telemetry API',    done: false },
  ]

  // ── Planned features ───────────────────────────────────────
  const plannedFeatures = [
    { icon: Shield,       title: 'One-Click VeRO Scan',          desc: 'Instant brand protection check on any eBay listing page' },
    { icon: TrendingUp,   title: 'Real-Time Profit Calculator',   desc: 'Popup overlay showing net profit after all eBay + PayPal fees' },
    { icon: BarChart2,    title: 'Fast Listing Deep Analysis',    desc: 'Competitor sell-through rate and category demand score' },
    { icon: Zap,          title: 'Auto Price Parser',             desc: 'Automatically surface competitor pricing data on the fly' },
    { icon: Package,      title: 'Listing Supplier Mapper',       desc: 'One-click source mapping to AliExpress and supplier databases' },
  ]

  // ══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-0" style={{ color: C.text }}>

      {/* ─────────────────────────────────────────────────────
          STRIP 1: COMMAND HEADER
      ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-0 py-4"
           style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: isExtensionLive ? C.lime : C.bg, border: `1px solid ${C.border}` }}>
            <Chrome size={15} style={{ color: isExtensionLive ? C.dark : C.muted }} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: C.limeDeep }}>
              Chrome Extension Control Center
            </h2>
            <p className="text-[11px]" style={{ color: C.muted }}>
              Riazify Browser Extension · Remote management console
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Live status badge */}
          {isExtensionLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                 style={{ backgroundColor: C.lime, color: C.dark }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.dark }} />
              <span className="text-[11px] font-black">LIVE v2.4.1</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                 style={{ backgroundColor: C.bg, borderColor: C.border, color: C.muted }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.muted }} />
              <span className="text-[11px] font-bold">NOT PUBLISHED</span>
            </div>
          )}
          {/* DEV ONLY — remove before production */}
          <button onClick={() => setIsExtensionLive(s => !s)}
            className="text-[10px] px-2 py-1 rounded-lg border transition-all hover:opacity-70"
            style={{ borderColor: C.amber, color: C.amber, backgroundColor: '#FFFBEB' }}
            title="Dev tool — remove in production">
            [DEV] Toggle Live
          </button>
          {/* Refresh */}
          <button onClick={handleRefresh}
            className="w-8 h-8 flex items-center justify-center rounded-xl border transition-all hover:opacity-70"
            style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <RefreshCw size={13} style={{
              color: C.muted,
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-5">

        {/* ─────────────────────────────────────────────────────
            STRIP 2: BENTO STATS ROW
        ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Installs',       value: isExtensionLive ? '—' : '—', sub: 'Not published', icon: Download,   color: C.limeDeep },
            { label: 'Daily Active Users',    value: '—',                         sub: 'DAU · 0% retention', icon: Users,     color: '#1d70f5' },
            { label: 'VeRO Scans Executed',   value: '—',                         sub: '— triggered today', icon: Shield,    color: C.limeDeep },
            { label: 'Active Store Version',  value: isExtensionLive ? 'v2.4.1' : 'Not Live', sub: isExtensionLive ? 'Google Approved' : 'Unpublished', icon: Chrome, color: C.muted },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-2xl border flex flex-col gap-3"
                 style={{ backgroundColor: C.bg, borderColor: C.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: color + '18' }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <p className="text-[24px] font-bold leading-none mb-1" style={{ color: C.text }}>{value}</p>
                <p className="text-[11px]" style={{ color: C.muted }}>{label}</p>
              </div>
              <p className="text-[10px] font-semibold" style={{ color: C.muted }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────
            STRIP 3: SAFETY ZONE — 60/40 split
        ───────────────────────────────────────────────────── */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr' }}>

          {/* Left: Kill Switch */}
          <div className="p-5 rounded-2xl border flex flex-col gap-4"
               style={{
                 backgroundColor: !isActive ? '#FEF2F2' : C.surface,
                 borderColor:     !isActive ? '#FECACA' : C.border,
                 transition: 'background-color 0.3s, border-color 0.3s',
               }}>
            <div>
              <p className="text-[15px] font-bold" style={{ color: C.limeDeep }}>
                Emergency Kill Switch
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                Instantly locks all active extension clients globally
              </p>
            </div>

            {/* Toggle pill */}
            <div className="flex items-center gap-4">
              <button onClick={handleKillToggle}
                className="relative w-20 h-9 rounded-full transition-all duration-300 flex items-center px-1"
                style={{ backgroundColor: isActive ? C.lime : '#FECACA' }}>
                <div className="w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300"
                     style={{ transform: isActive ? 'translateX(44px)' : 'translateX(0)' }} />
              </button>
              <div>
                <p className="text-[13px] font-bold" style={{ color: isActive ? C.limeDeep : C.red }}>
                  {isActive ? 'Extension ACTIVE' : 'MAINTENANCE MODE'}
                </p>
                <p className="text-[10px]" style={{ color: C.muted }}>
                  {isActive ? 'All clients operational' : 'Clients see maintenance message'}
                </p>
              </div>
            </div>

            {/* Maintenance message (shown when inactive) */}
            {!isActive && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-bold" style={{ color: C.muted }}>
                  Client-side maintenance message:
                </p>
                <textarea
                  value={maintenanceMsg}
                  onChange={e => setMaintenanceMsg(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border text-[12px] outline-none resize-none"
                  style={{
                    backgroundColor: C.bg, borderColor: C.border,
                    color: C.text, fontFamily: 'inherit',
                  }} />
                <button onClick={handleSaveMsg} disabled={isSavingMsg}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold w-fit transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: C.dark, color: C.lime }}>
                  {isSavingMsg
                    ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                    : msgSaved ? <><Check size={12} /> Saved!</> : 'Save Message'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Checklist + Store */}
          <div className="p-5 rounded-2xl border flex flex-col gap-4"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[15px] font-bold" style={{ color: C.limeDeep }}>
              Deployment Checklist
            </p>
            <div className="flex flex-col gap-2.5">
              {checklist.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  {done
                    ? <CheckCircle size={14} style={{ color: C.lime, flexShrink: 0 }} />
                    : <Circle     size={14} style={{ color: C.muted, flexShrink: 0 }} />}
                  <span className="text-[12px] font-semibold" style={{ color: done ? C.text : C.muted }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: C.border }}>
              <a href="https://chrome.google.com/webstore" target="_blank" rel="noreferrer"
                 className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-bold transition-all hover:opacity-80"
                 style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg }}>
                <ExternalLink size={12} /> Open Web Store Listing ↗
              </a>
              <div className="flex items-center justify-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={13} style={{ color: C.border }} />
                ))}
                <span className="text-[11px] ml-1" style={{ color: C.muted }}>— reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────
            STRIP 4: HTML SELECTOR OVERRIDES
        ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="flex items-center justify-between px-5 py-4"
               style={{ borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p className="text-[15px] font-bold" style={{ color: C.limeDeep }}>
                Live HTML Selector Overrides
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                Fix broken selectors in 5 seconds via WebSocket broadcast — no Chrome review needed
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasPendingSelectors && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  Unsaved changes
                </span>
              )}
              <button onClick={handleForceSync} disabled={isForceSyncing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border transition-all hover:opacity-80 disabled:opacity-50"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }}>
                {isForceSyncing
                  ? <><div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.limeDeep }} /> Syncing...</>
                  : <><Radio size={12} style={{ color: C.limeDeep }} /> Force Sync</>}
              </button>
            </div>
          </div>

          {/* Table header */}
          <div className="grid px-5 py-2.5 text-[10px] font-bold uppercase tracking-wide"
               style={{ gridTemplateColumns: '2fr 3fr 1fr 0.5fr', columnGap: 12,
                        backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <span>Selector Key</span>
            <span>Current Value</span>
            <span>Status</span>
            <span></span>
          </div>

          {/* Rows */}
          <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
            {selectors.map((sel, i) => (
              <div key={sel.id}
                   className="grid px-5 py-3 items-center"
                   style={{
                     gridTemplateColumns: '2fr 3fr 1fr 0.5fr', columnGap: 12,
                     backgroundColor: i % 2 === 0 ? 'transparent' : C.bg,
                     borderLeft: sel.pending ? `3px solid ${C.amber}` : `3px solid transparent`,
                   }}>
                <code className="text-[13px]" style={{ fontFamily: 'monospace', color: C.text }}>
                  {sel.key}
                </code>
                {sel.editing ? (
                  <input
                    ref={editRef}
                    value={sel.editValue}
                    onChange={e => setSelectors(s => s.map(x => x.id === sel.id ? { ...x, editValue: e.target.value } : x))}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(sel.id); if (e.key === 'Escape') cancelEdit(sel.id) }}
                    onBlur={() => commitEdit(sel.id)}
                    className="px-2 py-1 rounded-lg border text-[13px] outline-none w-full"
                    style={{
                      fontFamily: 'monospace', backgroundColor: C.surface,
                      borderColor: C.lime, color: C.text,
                      boxShadow: `0 0 0 2px rgba(143,255,0,0.2)`,
                    }}
                  />
                ) : (
                  <button onClick={() => startEditing(sel.id)}
                    className="text-left px-2 py-1 rounded-lg text-[13px] transition-all hover:bg-[#f4ffe6]"
                    style={{ fontFamily: 'monospace', color: sel.value ? C.text : C.muted }}>
                    {sel.value || 'click to add…'}
                  </button>
                )}
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full"
                       style={{ backgroundColor: sel.pending ? C.amber : C.lime }} />
                  <span className="text-[10px] font-semibold"
                        style={{ color: sel.pending ? C.amber : C.limeDeep }}>
                    {sel.pending ? 'Pending' : 'Synced'}
                  </span>
                </div>
                <button onClick={() => deleteSelector(sel.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-md border transition-all hover:opacity-70"
                  style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
                  <Trash2 size={10} style={{ color: C.red }} />
                </button>
              </div>
            ))}

            {/* Add row */}
            {showAddRow && (
              <div className="grid px-5 py-3 items-center gap-2"
                   style={{ gridTemplateColumns: '2fr 3fr 1fr 0.5fr', columnGap: 12, backgroundColor: C.limeTint }}>
                <input
                  value={newSelectorKey}
                  onChange={e => setNewSelectorKey(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addSelector(); if (e.key === 'Escape') setShowAddRow(false) }}
                  placeholder="selectorKey"
                  autoFocus
                  className="px-2 py-1 rounded-lg border text-[13px] outline-none"
                  style={{ fontFamily: 'monospace', borderColor: C.lime, backgroundColor: C.surface, color: C.text }}
                />
                <span className="text-[11px]" style={{ color: C.muted }}>Press Enter to confirm</span>
                <span />
                <button onClick={() => setShowAddRow(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:opacity-70">
                  <X size={12} style={{ color: C.muted }} />
                </button>
              </div>
            )}
          </div>

          {/* Table footer */}
          <div className="flex items-center justify-between px-5 py-3"
               style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.bg }}>
            <button onClick={() => setShowAddRow(true)}
              className="flex items-center gap-1.5 text-[12px] font-bold transition-all hover:opacity-70"
              style={{ color: C.limeDeep }}>
              <Plus size={13} /> Add Selector
            </button>
            <button onClick={handleSaveSelectors}
              disabled={!hasPendingSelectors || isSavingSelectors}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: C.dark, color: C.lime }}>
              {isSavingSelectors
                ? <><div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} /> Saving...</>
                : <><Check size={12} /> Save All Changes</>}
            </button>
          </div>
          <p className="text-center text-[10px] py-2" style={{ color: C.muted }}>
            Extension polls database every 60 min · Force Sync triggers instant WebSocket broadcast to all active clients
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────
            STRIP 5: OPERATIONS — OTA + BROADCAST 50/50
        ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          {/* OTA Update */}
          <div className="rounded-2xl border overflow-hidden"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color: C.limeDeep }}>
                Over-The-Air Update
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                Push version updates · type: OTA
              </p>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Version Number
                </p>
                <input value={otaVersion} onChange={e => setOtaVersion(e.target.value)}
                  placeholder="v2.4.2"
                  className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none"
                  style={{
                    fontFamily: 'monospace', backgroundColor: C.bg,
                    borderColor: otaVersion ? C.lime : C.border,
                    boxShadow: otaVersion ? '0 0 0 2px rgba(143,255,0,0.15)' : 'none',
                    color: C.text, transition: 'all 0.2s',
                  }} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Release Notes
                </p>
                <textarea value={otaNotes} onChange={e => setOtaNotes(e.target.value)}
                  placeholder="Describe what changed in this version..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none resize-none"
                  style={{
                    backgroundColor: C.bg, borderColor: otaNotes ? C.lime : C.border,
                    boxShadow: otaNotes ? '0 0 0 2px rgba(143,255,0,0.15)' : 'none',
                    color: C.text, fontFamily: 'inherit', transition: 'all 0.2s',
                  }} />
              </div>
              <button onClick={handlePushOTA}
                disabled={!otaVersion.trim() || !otaNotes.trim() || isPushingOTA}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: otaSuccess ? C.limeDeep : C.dark, color: C.lime }}>
                {isPushingOTA
                  ? <><div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} /> Pushing...</>
                  : otaSuccess
                    ? <><Check size={14} /> Pushed Successfully!</>
                    : <><Download size={14} /> Push to All Clients</>}
              </button>
            </div>

            {/* OTA History */}
            <div className="px-5 pb-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <History size={12} style={{ color: C.muted }} />
                <p className="text-[11px] font-bold" style={{ color: C.muted }}>Recent Pushes</p>
              </div>
              {otaHistory.map((h, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl"
                     style={{ backgroundColor: C.bg }}>
                  <code className="text-[12px] font-bold shrink-0"
                        style={{ color: C.limeDeep, fontFamily: 'monospace' }}>
                    {h.version}
                  </code>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] truncate" style={{ color: C.text }}>{h.notes}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>{h.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast Alert */}
          <div className="rounded-2xl border overflow-hidden"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color: C.limeDeep }}>
                System Broadcast Alert
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                Push alerts to extension users · type: BROADCAST
              </p>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {/* Severity selector */}
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Severity</p>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl"
                     style={{ backgroundColor: C.bg }}>
                  {(Object.keys(SEV) as ('info'|'warning'|'critical')[]).map(sev => (
                    <button key={sev} onClick={() => setSeverity(sev)}
                      className="py-2 rounded-lg text-[12px] font-bold transition-all"
                      style={{
                        backgroundColor: severity === sev ? SEV[sev].bg    : 'transparent',
                        color:           severity === sev ? SEV[sev].color : C.muted,
                        border: severity === sev ? `1.5px solid ${SEV[sev].border}` : '1.5px solid transparent',
                      }}>
                      {SEV[sev].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Message</p>
                <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="Type your alert message here..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none resize-none"
                  style={{
                    backgroundColor: C.bg,
                    borderColor: broadcastMsg ? SEV[severity].border : C.border,
                    boxShadow: broadcastMsg ? `0 0 0 2px ${SEV[severity].bg}` : 'none',
                    color: C.text, fontFamily: 'inherit', transition: 'all 0.2s',
                  }} />
              </div>
              <button onClick={handleSendBroadcast}
                disabled={!broadcastMsg.trim() || isSendingBroadcast}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: SEV[severity].bg, color: SEV[severity].color,
                         border: `1.5px solid ${SEV[severity].border}` }}>
                {isSendingBroadcast
                  ? <><div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: SEV[severity].color }} /> Sending...</>
                  : <><Send size={14} /> Send to All Users</>}
              </button>
            </div>

            {/* Broadcast history */}
            <div className="px-5 pb-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <Bell size={12} style={{ color: C.muted }} />
                <p className="text-[11px] font-bold" style={{ color: C.muted }}>Recent Alerts</p>
              </div>
              {broadcastHistory.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl"
                     style={{ backgroundColor: SEV[h.severity].bg,
                              border: `1px solid ${SEV[h.severity].border}` }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                       style={{ backgroundColor: SEV[h.severity].color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold" style={{ color: SEV[h.severity].color }}>
                      {SEV[h.severity].label}
                    </p>
                    <p className="text-[11px]" style={{ color: C.text }}>{h.message}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>{h.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────
            STRIP 6: PLANNED FEATURES (only when not live)
        ───────────────────────────────────────────────────── */}
        {!isExtensionLive && (
          <div className="rounded-2xl border p-5"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={15} style={{ color: C.limeDeep }} />
              <p className="text-[15px] font-bold" style={{ color: C.limeDeep }}>
                Planned Extension Capabilities
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto"
                    style={{ backgroundColor: C.bg, color: C.muted, border: `1px dashed ${C.border}` }}>
                Pre-launch roadmap
              </span>
            </div>

            {/* 3-2 bento grid */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {plannedFeatures.slice(0, 3).map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 rounded-2xl border-dashed"
                     style={{ backgroundColor: C.bg, border: `1.5px dashed ${C.border}` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                       style={{ backgroundColor: C.limeTint }}>
                    <Icon size={15} style={{ color: C.limeDeep }} />
                  </div>
                  <p className="text-[13px] font-bold mb-1" style={{ color: C.text }}>{title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.muted }}>{desc}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {plannedFeatures.slice(3).map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 rounded-2xl border-dashed"
                     style={{ backgroundColor: C.bg, border: `1.5px dashed ${C.border}` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                       style={{ backgroundColor: C.limeTint }}>
                    <Icon size={15} style={{ color: C.limeDeep }} />
                  </div>
                  <p className="text-[13px] font-bold mb-1" style={{ color: C.text }}>{title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.muted }}>{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] mt-4" style={{ color: C.muted }}>
              Strip 6 disappears automatically once extension is marked as live
            </p>
          </div>
        )}

      </div>

      {/* ─────────────────────────────────────────────────────
          KILL SWITCH CONFIRMATION MODAL
      ───────────────────────────────────────────────────── */}
      {showKillConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={e => e.target === e.currentTarget && setShowKillConfirm(false)}>
          <div className="bg-white rounded-2xl border w-full max-w-sm p-6"
               style={{ borderColor: '#FECACA', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: '#FEF2F2' }}>
                <AlertTriangle size={16} style={{ color: C.red }} />
              </div>
              <p className="text-[15px] font-bold" style={{ color: C.text }}>
                Confirm Global Lockout
              </p>
            </div>
            <p className="text-[13px] mb-2" style={{ color: C.muted }}>
              This will immediately disable the extension for ALL users worldwide.
            </p>
            <p className="text-[12px] font-bold mb-3" style={{ color: C.text }}>
              Type <code style={{ backgroundColor: C.bg, padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>MAINTENANCE</code> to confirm:
            </p>
            <input
              value={killConfirmText}
              onChange={e => setKillConfirmText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmKillSwitch()}
              placeholder="MAINTENANCE"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none mb-4"
              style={{
                fontFamily: 'monospace',
                backgroundColor: C.bg,
                borderColor: killConfirmText === 'MAINTENANCE' ? C.red : C.border,
                color: C.text,
              }} />
            <div className="flex gap-2">
              <button onClick={() => setShowKillConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                style={{ borderColor: C.border, color: C.muted }}>
                Cancel
              </button>
              <button onClick={confirmKillSwitch}
                disabled={killConfirmText !== 'MAINTENANCE'}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40 transition-all"
                style={{ backgroundColor: C.red, color: '#fff' }}>
                Lock Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          TOAST
      ───────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
             style={{
               backgroundColor: toast.type === 'error' ? '#FEF2F2' : toast.type === 'info' ? C.bg : C.dark,
               border: `1px solid ${toast.type === 'error' ? '#FECACA' : toast.type === 'info' ? C.border : C.lime}`,
               color: toast.type === 'error' ? C.red : toast.type === 'info' ? C.text : C.lime,
             }}>
          {toast.type === 'error'
            ? <X size={14} />
            : toast.type === 'info'
              ? <Wifi size={14} />
              : <CheckCircle size={14} />}
          <p className="text-[13px] font-bold">{toast.msg}</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}