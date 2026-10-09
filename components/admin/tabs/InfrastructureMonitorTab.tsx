'use client'
// components/admin/tabs/InfrastructureMonitorTab.tsx

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  CheckCircle, AlertTriangle, XCircle, Plus, Building2,
  RefreshCw, Copy, Trash2, ExternalLink, Activity,
  Database, Wifi, Globe, Eye, EyeOff, Check, X, Shield, Pencil, ChevronDown,
} from 'lucide-react'

// ── Brand colours ──────────────────────────────────────────────
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
  green:    '#16a34a',
}

interface Props {
  isMobile?:            boolean
  startChartAnimation?: boolean
  isInvestorMode?:      boolean
}

interface SystemStatus {
  id:         string
  status:     'operational' | 'degraded' | 'major_outage'
  message:    string
  updated_at: string
}

interface SystemComponent {
  id:     string
  name:   string
  status: string
  order_index: number
}

interface ApiKey {
  id:              string
  partner_name:    string
  api_key:         string
  usage_count:     number
  monthly_revenue: number
  rate_limit:      number
  is_active:       boolean
  created_at:      string
  last_used_at:    string | null
}

interface Metrics {
  db_size_pretty:          string
  db_percent:              number
  active_connections:      number
  connection_limit:        number
  connection_percent:      number
  vercel_bw_gb:            number
  vercel_bw_limit_gb:      number
  vercel_bw_percent:       number
  vercel_available:        boolean
  vercel_project_name:     string
  vercel_framework:        string
  vercel_deployments:      number
  vercel_last_deployed_at: number | null
  vercel_last_deploy_state:string | null
  query_total_calls:       number
  query_count:             number
  query_avg_ms:            number
  fetched_at:              string
}

// ── Circular Gauge ─────────────────────────────────────────────
function Gauge({ label, subtitle, percent, isWarning, icon: Icon, color }: {
  label: string; subtitle: string; percent: number
  isWarning: boolean; icon: React.ElementType; color: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    cancelAnimationFrame(frameRef.current)
    function tick(now: number) {
      const t    = Math.min((now - start) / 1200, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplay(percent * ease)
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [percent])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const s = canvas.width
    const cx = s / 2, cy = s / 2, r = s / 2 - 10, sw = 14
    ctx.clearRect(0, 0, s, s)
    // Track
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.strokeStyle = C.bg; ctx.lineWidth = sw; ctx.stroke()
    // Arc
    const arcColor = isWarning && display > 0.8 ? '#EF4444' : color
    if (display > 0) {
      ctx.beginPath()
      const minArc = 0.03 // minimum 3% arc for visibility
      const arcVal = display > 0 ? Math.max(display, minArc) : 0
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * Math.min(arcVal, 1))
      ctx.strokeStyle = arcColor; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.stroke()
    }
  }, [display, color, isWarning])

  const pct        = Math.round(display * 100)
  const isHighUsage = display > 0.8 && isWarning

  return (
    <div className="flex-1 flex flex-col items-center p-5 rounded-2xl border"
         style={{ backgroundColor: isHighUsage ? '#FFF1F2' : C.surface, borderColor: isHighUsage ? '#FECDD3' : C.border }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
             style={{ backgroundColor: isHighUsage ? '#FEE2E2' : C.limeTint }}>
          <Icon size={14} style={{ color: isHighUsage ? '#EF4444' : C.limeDeep }} />
        </div>
        <p className="text-[13px] font-bold" style={{ color: C.text }}>{label}</p>
      </div>
      <div className="relative" style={{ width: 110, height: 110 }}>
        <canvas ref={canvasRef} width={110} height={110} />
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-[22px] font-bold leading-none"
                style={{ color: isHighUsage ? '#EF4444' : C.text }}>{pct}%</span>
        </div>
      </div>
      <p className="text-[12px] font-semibold mt-4 text-center" style={{ color: isHighUsage ? '#EF4444' : C.muted }}>
        {subtitle}
      </p>
      {isHighUsage && (
        <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
          High Usage
        </span>
      )}
    </div>
  )
}

// ── FocusInput ─────────────────────────────────────────────────
function FocusInput({ value, onChange, placeholder, multiline }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; multiline?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const style = {
    border: `1.5px solid ${focused ? C.lime : C.border}`,
    boxShadow: focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
    backgroundColor: C.bg, color: C.text, outline: 'none',
    transition: 'all 0.2s', borderRadius: 12,
    padding: '8px 12px', width: '100%',
    fontSize: 13, fontFamily: 'inherit',
  }
  if (multiline) return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={2} style={{ ...style, resize: 'none' }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  )
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} style={{ ...style, height: 40 }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  )
}

// ── Status config (outside component — not recreated on render) ─
const STATUS_CONFIG = {
  operational:  { label: 'Operational',  icon: CheckCircle,   color: '#16a34a', bg: '#F0FDF4', border: '#BBF7D0' },
  degraded:     { label: 'Degraded',     icon: AlertTriangle, color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  major_outage: { label: 'Major Outage', icon: XCircle,       color: '#b91c1c', bg: '#FEF2F2', border: '#FECACA' },
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function InfrastructureMonitorTab(_props: Props) {
  const { can } = useTabPermissions('infra_monitor')
  const supabase = createClient()

  // ── State ──────────────────────────────────────────────────
  const [sysStatus,     setSysStatus]     = useState<SystemStatus | null>(null)
  const [components,    setComponents]    = useState<SystemComponent[]>([])
  const [apiKeys,       setApiKeys]       = useState<ApiKey[]>([])
  const [metrics,       setMetrics]       = useState<Metrics | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [metricsLoading,setMetricsLoading]= useState(true)
  const [refreshing,    setRefreshing]    = useState(false)
  const [savingStatus,  setSavingStatus]  = useState(false)
  const [toast,         setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Status edit state
  const [editMessage,   setEditMessage]   = useState('')
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

  // New key dialog
  const [showNewKey,    setShowNewKey]    = useState(false)
  const [newPartner,    setNewPartner]    = useState('')
  const [newRateLimit,  setNewRateLimit]  = useState('10000')
  const [issuingKey,    setIssuingKey]    = useState(false)
  const [newKeyResult,  setNewKeyResult]  = useState<string | null>(null)

  // Copy state
  const [copiedId,      setCopiedId]      = useState<string | null>(null)

  const [showComponents, setShowComponents] = useState(false)

  // Key management state
  const [deleteKeyConfirm, setDeleteKeyConfirm] = useState<ApiKey | null>(null)
  const [editKey,          setEditKey]          = useState<ApiKey | null>(null)
  const [editRevenue,      setEditRevenue]       = useState('')
  const [editRateLimit,    setEditRateLimit]     = useState('')
  const [editSavingKey,    setEditSavingKey]     = useState(false)

  // ── Load data ──────────────────────────────────────────────
  const loadStatus = useCallback(async () => {
    try {
      const { data } = await (supabase as any)
        .from('system_status').select('*').order('updated_at', { ascending: false }).limit(1)
      if (data?.[0]) {
        setSysStatus(data[0])
        setEditMessage(data[0].message ?? '')
        setPendingStatus(data[0].status)
      }
    } catch (e) { console.error(e) }
  }, [])

  const loadApiKeys = useCallback(async () => {
    try {
      const { data } = await (supabase as any)
        .from('api_keys').select('*').order('created_at', { ascending: false })
      setApiKeys(data ?? [])
    } catch (e) { console.error(e) }
  }, [])

  const loadComponents = useCallback(async () => {
    try {
      const { data } = await (supabase as any)
        .from('system_components').select('*').order('order_index', { ascending: true })
      setComponents(data ?? [])
    } catch (e) { console.error(e) }
  }, [])

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true)
    try {
      const res = await fetch('/api/admin/metrics')
      if (res.ok) setMetrics(await res.json())
    } catch (e) { console.error(e) }
    finally { setMetricsLoading(false) }
  }, [])

  useEffect(() => {
    Promise.all([loadStatus(), loadApiKeys(), loadComponents(), loadMetrics()])
      .finally(() => setLoading(false))
  }, [loadStatus, loadApiKeys, loadComponents, loadMetrics])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await Promise.all([loadStatus(), loadApiKeys(), loadComponents(), loadMetrics()])
    setRefreshing(false)
    showToast('Metrics refreshed')
  }

  // ── Save system status ─────────────────────────────────────
  async function handleSaveStatus() {
    if (!pendingStatus) return
    setSavingStatus(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (sysStatus?.id) {
        await (supabase as any).from('system_status').update({
          status:     pendingStatus,
          message:    editMessage.trim() || statusDefaultMessage(pendingStatus),
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        }).eq('id', sysStatus.id)
      } else {
        await (supabase as any).from('system_status').insert([{
          status:     pendingStatus,
          message:    editMessage.trim() || statusDefaultMessage(pendingStatus),
          updated_by: user?.id,
        }])
      }
      await loadStatus()
      showToast('System status updated and live')
    } catch (e) {
      console.error(e)
      showToast('Failed to save status', 'error')
    }
    setSavingStatus(false)
  }

  function statusDefaultMessage(s: string) {
    if (s === 'operational')  return 'All systems are fully operational.'
    if (s === 'degraded')     return 'Some systems are experiencing degraded performance.'
    return 'We are experiencing a major outage. Our team is working to resolve this.'
  }

  // ── Update individual component status ────────────────────
  async function handleComponentStatus(comp: SystemComponent, newStatus: string) {
    try {
      await (supabase as any).from('system_components')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', comp.id)
      setComponents(c => c.map(x => x.id === comp.id ? { ...x, status: newStatus } : x))
      showToast(`${comp.name} → ${newStatus.replace('_', ' ')}`)
    } catch (e) {
      console.error(e)
      showToast('Failed to update component', 'error')
    }
  }

  // ── Issue new API key ──────────────────────────────────────
  async function handleIssueKey() {
    if (!newPartner.trim()) return
    setIssuingKey(true)
    try {
      // Generate secure key
      const raw  = crypto.randomUUID().replace(/-/g, '')
      const key  = `sk_live_${raw.slice(0, 24)}`
      await (supabase as any).from('api_keys').insert([{
        partner_name:    newPartner.trim(),
        api_key:         key,
        rate_limit:      parseInt(newRateLimit) || 10000,
        usage_count:     0,
        monthly_revenue: 0,
        is_active:       true,
      }])
      await loadApiKeys()
      setNewKeyResult(key)
      showToast(`API key issued for ${newPartner.trim()}`)
    } catch (e) {
      console.error(e)
      showToast('Failed to issue key', 'error')
    }
    setIssuingKey(false)
  }

  // ── Toggle key active ──────────────────────────────────────
  async function handleToggleKey(key: ApiKey) {
    try {
      await (supabase as any).from('api_keys')
        .update({ is_active: !key.is_active }).eq('id', key.id)
      setApiKeys(k => k.map(x => x.id === key.id ? { ...x, is_active: !key.is_active } : x))
      showToast(key.is_active ? 'Key revoked' : 'Key re-enabled')
    } catch (e) {
      console.error(e)
      showToast('Failed to update key', 'error')
    }
  }

  // ── Delete key ─────────────────────────────────────────────
  // ── Open edit key dialog ──────────────────────────────────
  function openEditKey(key: ApiKey) {
    setEditKey(key)
    setEditRevenue(key.monthly_revenue.toString())
    setEditRateLimit(key.rate_limit.toString())
  }

  // ── Save key edits ────────────────────────────────────────
  async function handleSaveKeyEdit() {
    if (!editKey) return
    setEditSavingKey(true)
    try {
      await (supabase as any).from('api_keys').update({
        monthly_revenue: parseFloat(editRevenue) || 0,
        rate_limit:      parseInt(editRateLimit)  || 10000,
      }).eq('id', editKey.id)
      setApiKeys(k => k.map(x => x.id === editKey.id
        ? { ...x, monthly_revenue: parseFloat(editRevenue) || 0, rate_limit: parseInt(editRateLimit) || 10000 }
        : x
      ))
      setEditKey(null)
      showToast('Partner updated')
    } catch (e) {
      console.error(e)
      showToast('Failed to update partner', 'error')
    }
    setEditSavingKey(false)
  }

  async function handleDeleteKey(key: ApiKey) {
    try {
      await (supabase as any).from('api_keys').delete().eq('id', key.id)
      setApiKeys(k => k.filter(x => x.id !== key.id))
      setDeleteKeyConfirm(null)
      showToast('API key deleted')
    } catch (e) {
      console.error(e)
      showToast('Failed to delete key', 'error')
    }
  }

  // ── Copy key ───────────────────────────────────────────────
  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const currentCfg = STATUS_CONFIG[sysStatus?.status ?? 'operational']

  // ── Derived stats ──────────────────────────────────────────
  const totalRevenue = apiKeys.reduce((s, k) => s + (k.monthly_revenue ?? 0), 0)
  const totalCalls   = apiKeys.reduce((s, k) => s + (k.usage_count ?? 0), 0)
  const activeKeys   = apiKeys.filter(k => k.is_active).length

  // ── Time ago ───────────────────────────────────────────────
  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6" style={{ color: C.text }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: C.text }}>Infrastructure Monitor</h2>
          <p className="text-[13px] mt-0.5" style={{ color: C.muted }}>
            Real-time system health, status management and B2B API monetization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {metrics?.fetched_at && (
            <span className="text-[11px]" style={{ color: C.muted }}>
              Updated {timeAgo(metrics.fetched_at)}
            </span>
          )}
          <button onClick={handleRefresh}
            className="w-8 h-8 flex items-center justify-center rounded-xl border transition-all hover:opacity-70"
            style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <RefreshCw size={14} style={{ color: C.muted, animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="p-4 rounded-2xl border flex items-center gap-3 animate-pulse"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="w-9 h-9 rounded-xl shrink-0" style={{ backgroundColor: C.bg }} />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 rounded-lg" style={{ backgroundColor: C.bg, width: '60%' }} />
                <div className="h-3 rounded-lg" style={{ backgroundColor: C.bg, width: '40%' }} />
              </div>
            </div>
          ))
        ) : (
          [{
            label: 'System Status',   value: currentCfg.label,
            icon: Activity,           color: currentCfg.color,
          }, {
            label: 'Active API Keys', value: `${activeKeys} / ${apiKeys.length}`,
            icon: Shield,             color: C.limeDeep,
          }, {
            label: 'Total API Calls', value: totalCalls.toLocaleString(),
            icon: Globe,              color: '#1D70F5',
          }, {
            label: 'B2B Revenue MRR', value: `$${totalRevenue.toFixed(2)}`,
            icon: Building2,          color: C.green,
          }].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-2xl border flex items-center gap-3"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor: color + '18' }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-bold leading-tight truncate" style={{ color: C.text }}>{value}</p>
                <p className="text-[11px]" style={{ color: C.muted }}>{label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Status Manager ───────────────────────────────────── */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="text-[15px] font-bold" style={{ color: C.text }}>
              Public System Status
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>
              Manually override status when eBay or Amazon APIs go down to prevent support floods.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sysStatus && (
              <span className="text-[11px]" style={{ color: C.muted }}>
                Last updated {timeAgo(sysStatus.updated_at)}
              </span>
            )}
            <a href="/status" target="_blank" rel="noreferrer noopener"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-all hover:opacity-80"
              style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
              <ExternalLink size={12} /> View Public Page
            </a>
          </div>
        </div>

        {/* Current status banner */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
             style={{ backgroundColor: currentCfg.bg, border: `1px solid ${currentCfg.border}` }}>
          <currentCfg.icon size={18} style={{ color: currentCfg.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold" style={{ color: currentCfg.color }}>
              {currentCfg.label}
            </p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              {sysStatus?.message ?? statusDefaultMessage(sysStatus?.status ?? 'operational')}
            </p>
          </div>
        </div>

        {/* Status toggles */}
        <div className="flex gap-3 flex-wrap mb-4">
          {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG.operational][]).map(([key, cfg]) => {
            const isActive = pendingStatus === key
            const Icon     = cfg.icon
            return (
              <button key={key} onClick={() => setPendingStatus(key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-1 justify-center"
                style={{
                  backgroundColor: isActive ? cfg.bg      : C.bg,
                  borderColor:     isActive ? cfg.color   : C.border,
                  borderWidth:     isActive ? 2 : 1,
                }}>
                <Icon size={16} style={{ color: isActive ? cfg.color : C.muted }} />
                <span className="text-[13px] font-bold" style={{ color: isActive ? cfg.color : C.muted }}>
                  {cfg.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Status message input */}
        <div className="mb-4">
          <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
            Status Message (optional — shown on public page)
          </p>
          <FocusInput value={editMessage} onChange={setEditMessage}
            placeholder={statusDefaultMessage(pendingStatus ?? 'operational')} multiline />
        </div>

        {/* Save button */}
        {can('view_logs') && <button onClick={handleSaveStatus} disabled={savingStatus || (pendingStatus === sysStatus?.status && editMessage.trim() === (sysStatus?.message ?? '').trim())}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50 transition-all hover:opacity-80"
          style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
          {savingStatus
            ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
            : <><CheckCircle size={14} /> Save & Publish Status</>}
        </button>}
      </div>

      {/* ── Individual Component Status (collapsible) ─────────── */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>

        {/* Header row — always visible, click to expand */}
        <button onClick={() => setShowComponents(s => !s)}
          className="w-full flex items-center justify-between p-5 transition-all hover:opacity-80"
          style={{ backgroundColor: C.surface }}>
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-[15px] font-bold text-left" style={{ color: C.text }}>Component Status</h3>
              <p className="text-[12px] mt-0.5 text-left" style={{ color: C.muted }}>
                {components.filter(c => c.status === 'operational').length} / {components.length} operational
                · Click to {showComponents ? 'collapse' : 'manage individually'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status summary pills */}
            {components.filter(c => c.status === 'degraded').length > 0 && (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: '#FFF7ED', color: '#F97316' }}>
                {components.filter(c => c.status === 'degraded').length} Degraded
              </span>
            )}
            {components.filter(c => c.status === 'major_outage').length > 0 && (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: '#FEF2F2', color: C.red }}>
                {components.filter(c => c.status === 'major_outage').length} Outage
              </span>
            )}
            {components.every(c => c.status === 'operational') && (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: '#F0FDF4', color: C.green }}>
                All Operational
              </span>
            )}
            <ChevronDown size={18} style={{
              color: C.muted,
              transform: showComponents ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }} />
          </div>
        </button>

        {/* Expandable rows — smooth animation using CSS grid trick */}
        <div style={{
          display:            'grid',
          gridTemplateRows:   showComponents ? '1fr' : '0fr',
          transition:         'grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          borderTop:          showComponents ? `1px solid ${C.border}` : 'none',
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
              {components.map((comp, i) => {
                const s = STATUS_CONFIG[comp.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.operational
                return (
                  <div key={comp.id}
                       className="flex items-center justify-between px-5 py-3"
                       style={{ backgroundColor: i % 2 === 0 ? 'transparent' : C.bg }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full"
                           style={{ backgroundColor: s.color }} />
                      <p className="text-[13px] font-semibold" style={{ color: C.text }}>{comp.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const isActive = comp.status === key
                        const Icon = cfg.icon
                        return (
                          <button key={key}
                            onClick={() => handleComponentStatus(comp, key)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all"
                            style={{
                              backgroundColor: isActive ? cfg.bg    : 'transparent',
                              borderColor:     isActive ? cfg.color : C.border,
                              color:           isActive ? cfg.color : C.muted,
                            }}>
                            <Icon size={11} />
                            {key === 'operational' ? 'OK' : key === 'degraded' ? 'Degraded' : 'Outage'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Server Gauges ────────────────────────────────────── */}
      <div className="flex gap-4">
        {metricsLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="flex-1 p-5 rounded-2xl border animate-pulse"
                 style={{ backgroundColor: C.surface, borderColor: C.border, height: 220 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: C.bg }} />
                <div className="h-3 rounded w-24" style={{ backgroundColor: C.bg }} />
              </div>
              <div className="w-28 h-28 rounded-full mx-auto" style={{ backgroundColor: C.bg }} />
            </div>
          ))
        ) : (<>
          <Gauge
            label="Supabase Database"
            subtitle={`${metrics?.db_size_pretty ?? '—'} / 500 MB used`}
            percent={metrics?.db_percent ?? 0}
            isWarning={true}
            icon={Database}
            color={C.lime}
          />
          <Gauge
            label="Active Connections"
            subtitle={`${metrics?.active_connections ?? 0} / ${metrics?.connection_limit ?? 60} connections`}
            percent={metrics?.connection_percent ?? 0}
            isWarning={true}
            icon={Wifi}
            color="#1D70F5"
          />
          <Gauge
            label="Vercel Deployments"
            subtitle={metrics?.vercel_available
              ? metrics.vercel_last_deploy_state === 'READY'
                ? `${metrics.vercel_deployments} deploys — Live ✓ · ${metrics.vercel_last_deployed_at ? timeAgo(new Date(metrics.vercel_last_deployed_at).toISOString()) : ''}`
                : `${metrics.vercel_deployments} recent deployments`
              : 'Add VERCEL_TOKEN to .env'}
            percent={metrics?.vercel_available
              ? Math.min((metrics.vercel_deployments ?? 0) / 50, 1)
              : 0}
            isWarning={false}
            icon={Globe}
            color="#8B5CF6"
          />
          <Gauge
            label="Supabase Queries"
            subtitle={metrics?.query_total_calls
              ? `${(metrics.query_total_calls ?? 0).toLocaleString()} total · ${metrics.query_count ?? 0} unique · avg ${metrics.query_avg_ms ?? 0}ms`
              : 'No query data yet'}
            percent={Math.min((metrics?.query_total_calls ?? 0) / 100000, 1)}
            isWarning={(metrics?.query_total_calls ?? 0) > 80000}
            icon={Database}
            color="#10b981"
          />
        </>)}
      </div>

      {/* ── B2B API Hub ──────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="text-[15px] font-bold" style={{ color: C.text }}>
              B2B White-Label API Hub
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>
              Manage third-party startups paying to access your VeRO & Profit Engine APIs.
            </p>
          </div>
          {can('view_logs') && <button onClick={() => { setShowNewKey(true); setNewKeyResult(null); setNewPartner(''); setNewRateLimit('10000') }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Plus size={14} /> Issue New Key
          </button>}
        </div>

        {/* API Keys table */}
        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <Building2 size={32} style={{ color: C.muted }} />
            <p className="text-[14px] font-bold mt-3" style={{ color: C.muted }}>No API partners yet</p>
            <p className="text-[12px] mt-1" style={{ color: C.muted }}>Issue a key to your first B2B partner</p>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
            {/* Header */}
            <div className="px-4 py-2 grid text-[10px] font-bold uppercase tracking-wide"
                 style={{ gridTemplateColumns: '1.4fr 1.4fr 0.7fr 0.7fr 0.7fr 0.8fr 0.8fr 0.6fr', columnGap: 10, backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`, color: C.muted }}>
              <span>Partner</span>
              <span>API Key</span>
              <span>Usage</span>
              <span>Limit</span>
              <span>Revenue</span>
              <span>Last Used</span>
              <span>Created</span>
              <span>Actions</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y max-h-64 overflow-y-auto" style={{ borderColor: C.border }}>
              {apiKeys.map((key, i) => (
                <div key={key.id}
                     className="px-4 py-2 grid items-center"
                     style={{ gridTemplateColumns: '1.4fr 1.4fr 0.7fr 0.7fr 0.7fr 0.8fr 0.8fr 0.6fr', columnGap: 10,
                              backgroundColor: i % 2 === 0 ? 'transparent' : C.bg,
                              opacity: key.is_active ? 1 : 0.5 }}>

                  {/* Partner — name + active indicator */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0"
                         style={{ backgroundColor: key.is_active ? C.green : C.muted }} />
                    <p className="text-[12px] font-bold truncate" style={{ color: C.text }}>{key.partner_name}</p>
                  </div>

                  {/* API Key with copy */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-[11px] font-mono truncate" style={{ color: C.muted }}>
                      {key.api_key.slice(0, 16)}…
                    </p>
                    <button onClick={() => handleCopy(key.id, key.api_key)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg border shrink-0 transition-all hover:opacity-70"
                      style={{ borderColor: C.border, backgroundColor: copiedId === key.id ? C.limeTint : C.bg }}>
                      {copiedId === key.id
                        ? <Check size={11} style={{ color: C.limeDeep }} />
                        : <Copy size={11} style={{ color: C.muted }} />}
                    </button>
                  </div>

                  {/* Usage */}
                  <p className="text-[12px] font-bold" style={{ color: C.text }}>
                    {key.usage_count.toLocaleString()}
                    <span className="text-[10px] font-normal ml-0.5" style={{ color: C.muted }}>calls</span>
                  </p>

                  {/* Rate Limit */}
                  <p className="text-[12px] font-bold" style={{ color: key.usage_count / key.rate_limit > 0.8 ? '#EF4444' : C.text }}>
                    {key.rate_limit.toLocaleString()}
                    <span className="text-[10px] font-normal ml-0.5" style={{ color: key.usage_count / key.rate_limit > 0.8 ? '#EF4444' : C.muted }}>/mo</span>
                  </p>

                  {/* Revenue */}
                  <p className="text-[13px] font-bold" style={{ color: C.green }}>
                    ${key.monthly_revenue.toFixed(2)}
                  </p>

                  {/* Last Used */}
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {key.last_used_at ? timeAgo(key.last_used_at) : 'Never'}
                  </p>

                  {/* Created date — own column */}
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {new Date(key.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  {/* Actions — own column */}
                  <div className="flex items-center gap-1">
                    {can('view_logs') && <button onClick={() => openEditKey(key)}
                      className="w-5 h-5 flex items-center justify-center rounded-md border transition-all hover:opacity-70"
                      title="Edit"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <Pencil size={10} style={{ color: C.muted }} />
                    </button>}
                    {can('view_logs') && <button onClick={() => handleToggleKey(key)}
                      className="w-5 h-5 flex items-center justify-center rounded-md border transition-all hover:opacity-70"
                      title={key.is_active ? 'Revoke' : 'Enable'}
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      {key.is_active
                        ? <EyeOff size={10} style={{ color: C.muted }} />
                        : <Eye size={10} style={{ color: C.green }} />}
                    </button>}
                    {can('view_logs') && <button onClick={() => setDeleteKeyConfirm(key)}
                      className="w-5 h-5 flex items-center justify-center rounded-md border transition-all hover:opacity-70"
                      style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
                      <Trash2 size={10} style={{ color: C.red }} />
                    </button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Issue New Key Dialog ─────────────────────────────── */}
      {showNewKey && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && !newKeyResult && setShowNewKey(false)}>
          <div className="bg-white rounded-2xl border w-full max-w-md"
               style={{ borderColor: C.border, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color: C.text }}>
                {newKeyResult ? 'Key Issued — Save It Now!' : 'Issue New API Key'}
              </p>
              {!newKeyResult && (
                <button onClick={() => setShowNewKey(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70"
                  style={{ backgroundColor: C.bg }}>
                  <X size={16} style={{ color: C.muted }} />
                </button>
              )}
            </div>

            <div className="p-5 flex flex-col gap-4">
              {newKeyResult ? (
                <>
                  {/* Show generated key */}
                  <div className="p-3 rounded-xl" style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}` }}>
                    <p className="text-[11px] font-bold mb-2" style={{ color: C.limeDeep }}>
                      ⚠️ Copy this key now — it will never be shown again!
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[12px] font-mono break-all"
                            style={{ color: C.dark }}>{newKeyResult}</code>
                      <button onClick={() => handleCopy('new', newKeyResult)}
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold"
                        style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                        {copiedId === 'new' ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                  </div>
                  <button onClick={() => setShowNewKey(false)}
                    className="w-full py-2.5 rounded-xl text-[13px] font-bold"
                    style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                    Done — I've saved the key
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                      Partner Name <span style={{ color: C.red }}>*</span>
                    </p>
                    <FocusInput value={newPartner} onChange={setNewPartner}
                      placeholder="e.g. AutoLister Pro" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                      Rate Limit (calls/month)
                    </p>
                    <FocusInput value={newRateLimit} onChange={setNewRateLimit}
                      placeholder="10000" />
                  </div>
                  <div className="p-3 rounded-xl text-[12px]"
                       style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.muted }}>
                    Key will be generated as: <code className="font-mono">sk_live_xxxxxxxxxxxxxxxxxxxxxxxx</code>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowNewKey(false)}
                      className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                      style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
                    <button onClick={handleIssueKey} disabled={!newPartner.trim() || issuingKey}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                      {issuingKey
                        ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                        : <><Shield size={14} /> Issue Key</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Key Dialog ─────────────────────────────────── */}
      {editKey && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setEditKey(null)}>
          <div className="bg-white rounded-2xl border w-full max-w-sm"
               style={{ borderColor: C.border, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color: C.text }}>
                Edit — {editKey.partner_name}
              </p>
              <button onClick={() => setEditKey(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70"
                style={{ backgroundColor: C.bg }}>
                <X size={16} style={{ color: C.muted }} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Monthly Revenue ($)
                </p>
                <FocusInput value={editRevenue} onChange={setEditRevenue}
                  placeholder="0.00" />
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>
                  Update when partner pays their monthly invoice
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Rate Limit (calls/month)
                </p>
                <FocusInput value={editRateLimit} onChange={setEditRateLimit}
                  placeholder="10000" />
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>
                  Increase when partner upgrades their plan
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditKey(null)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                  style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
                <button onClick={handleSaveKeyEdit} disabled={editSavingKey}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  {editSavingKey
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                    : <><Check size={14} /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Key Confirm ───────────────────────────────── */}
      {deleteKeyConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setDeleteKeyConfirm(null)}>
          <div className="bg-white rounded-2xl border p-6 w-full max-w-sm"
               style={{ borderColor: C.border }}>
            <p className="text-[15px] font-bold mb-1" style={{ color: C.text }}>Delete API Key?</p>
            <p className="text-[13px] mb-5" style={{ color: C.muted }}>
              "{deleteKeyConfirm.partner_name}" will lose access immediately.
              This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteKeyConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
              <button onClick={() => handleDeleteKey(deleteKeyConfirm)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: C.red, color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
             style={{
               backgroundColor: toast.type === 'error' ? '#FEF2F2' : C.dark,
               border:          `1px solid ${toast.type === 'error' ? '#FECACA' : C.lime}`,
               color:           toast.type === 'error' ? C.red : C.lime,
             }}>
          {toast.type === 'error' ? <X size={15} /> : <CheckCircle size={15} />}
          <p className="text-[13px] font-bold">{toast.msg}</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
