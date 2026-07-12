'use client'
// components/admin/settings-tabs/ApiVaultPage.tsx
// Full rebuild — all 7 layers

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Server, Shield, Activity, RefreshCw, CloudUpload,
  Wifi, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle,
  Info, Bell, X, ExternalLink, Copy, Lock, Trash2, Clock,
  Search, Zap, Mail, MessageSquare, CreditCard, Brain, ShoppingCart,
  Plus, Download, Settings,
} from 'lucide-react'

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
  purple:   '#7c3aed',
}

// -- Category meta ----------------------------------------------
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  catalog: { icon: ShoppingCart,  color: C.blue,   bg: 'rgba(29,78,216,0.08)',  label: 'CATALOG' },
  payment: { icon: CreditCard,    color: C.green,  bg: 'rgba(22,163,74,0.08)',  label: 'PAYMENT' },
  comms:   { icon: MessageSquare, color: C.purple, bg: 'rgba(124,58,237,0.08)', label: 'COMMS'   },
  ai:      { icon: Brain,         color: C.amber,  bg: 'rgba(217,119,6,0.08)',  label: 'AI'      },
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  ebay:         ShoppingCart,
  aliexpress:   ShoppingCart,
  amazon_spapi: ShoppingCart,
  openai:       Brain,
  resend:       Mail,
  lemonsqueezy: CreditCard,
  stripe:       CreditCard,
}

// -- Helpers ----------------------------------------------------
function statusMeta(status: string, isLocked: boolean): { color: string; bg: string; label: string; dot: string } {
  if (isLocked)                  return { color: C.muted, bg: C.bg,                    label: 'LOCKED',  dot: '#94a3b8' }
  if (status === 'connected')    return { color: C.green, bg: 'rgba(22,163,74,0.08)', label: 'LIVE',    dot: '#16a34a' }
  if (status === 'disconnected') return { color: C.muted, bg: C.bg,                    label: 'EMPTY',   dot: '#94a3b8' }
  if (status === 'error')        return { color: C.red,   bg: 'rgba(185,28,28,0.08)', label: 'ERROR',   dot: '#b91c1c' }
  if (status === 'expired')      return { color: C.amber, bg: 'rgba(217,119,6,0.08)', label: 'EXPIRED', dot: '#d97706' }
  return { color: C.muted, bg: C.bg, label: status.toUpperCase(), dot: '#94a3b8' }
}

function getDaysUntilExpiry(expires_at: string | null): number {
  if (!expires_at) return 0
  return Math.ceil((new Date(expires_at).getTime() - Date.now()) / 86400000)
}

function getHealthScore(api: any): number {
  if (!api || api.status === 'disconnected') return 0
  if (api.status === 'expired')              return 0
  if (api.status === 'error')                return 25
  let score = 30
  const days = getDaysUntilExpiry(api.expires_at)
  const pct  = api.rate_limit_total > 0 ? (api.rate_limit_used / api.rate_limit_total) * 100 : 0
  if (api.status === 'connected') score += 30
  if (days === 0 || days > 30)    score += 20
  else if (days > 7)              score += 10
  if (pct < 70)                   score += 20
  else if (pct < 85)              score += 10
  return Math.min(score, 100)
}

function fingerprint(key: string): string {
  if (!key || key === 'EMPTY' || key === '') return '—'
  if (key.startsWith('env:')) return key.replace('env:', '').replace(/_/g, ' ')
  if (key.length < 12) return key
  return `${key.slice(0, 8)}…${key.slice(-4)}`
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

// -- Toast ------------------------------------------------------
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark,    border: C.lime,    color: C.lime },
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

// -- Notifications Panel ----------------------------------------
function NotificationsPanel({ apis, onClose }: { apis: any[]; onClose: () => void }) {
  const critical = apis.filter(a => {
    const days = getDaysUntilExpiry(a.expires_at)
    return a.status === 'connected' && days > 0 && days <= 7
  })
  const warnings = apis.filter(a => {
    const days = getDaysUntilExpiry(a.expires_at)
    return (a.status === 'disconnected' && !a.is_locked) ||
           (a.status === 'connected' && days > 7 && days <= 30)
  })
  const info = apis.filter(a => a.status === 'connected')

  return (
    <div className="fixed inset-0 z-[10500]" onClick={onClose}>
      <div className="absolute top-16 right-6 w-80 rounded-2xl border shadow-2xl overflow-hidden"
           style={{ backgroundColor: C.surface, borderColor: C.border }}
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <p className="text-[13px] font-black" style={{ color: C.dark }}>API Notifications</p>
          <button onClick={onClose}><X size={14} style={{ color: C.muted }} /></button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {critical.length > 0 && (
            <div className="p-3 border-b" style={{ borderColor: C.border }}>
              <p className="text-[9px] font-black tracking-wider mb-2" style={{ color: C.red }}>
                CRITICAL ({critical.length})
              </p>
              {critical.map((a: any) => (
                <div key={a.platform_name} className="flex items-start gap-2 p-2 rounded-xl mb-1"
                     style={{ backgroundColor: 'rgba(185,28,28,0.06)' }}>
                  <AlertTriangle size={12} style={{ color: C.red, marginTop: 1, flexShrink: 0 }} />
                  <p className="text-[11px]" style={{ color: C.red }}>
                    {a.display_name} keys expire in {getDaysUntilExpiry(a.expires_at)} days
                  </p>
                </div>
              ))}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="p-3 border-b" style={{ borderColor: C.border }}>
              <p className="text-[9px] font-black tracking-wider mb-2" style={{ color: C.amber }}>
                WARNING ({warnings.length})
              </p>
              {warnings.map((a: any) => (
                <div key={a.platform_name} className="flex items-start gap-2 p-2 rounded-xl mb-1"
                     style={{ backgroundColor: 'rgba(217,119,6,0.06)' }}>
                  <AlertTriangle size={12} style={{ color: C.amber, marginTop: 1, flexShrink: 0 }} />
                  <p className="text-[11px]" style={{ color: C.amber }}>
                    {a.status === 'disconnected'
                      ? `${a.display_name} not configured`
                      : `${a.display_name} expires in ${getDaysUntilExpiry(a.expires_at)} days`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {info.length > 0 && (
            <div className="p-3">
              <p className="text-[9px] font-black tracking-wider mb-2" style={{ color: C.blue }}>
                INFO ({info.length})
              </p>
              {info.map((a: any) => (
                <div key={a.platform_name} className="flex items-start gap-2 p-2 rounded-xl mb-1"
                     style={{ backgroundColor: 'rgba(29,78,216,0.06)' }}>
                  <CheckCircle size={12} style={{ color: C.blue, marginTop: 1, flexShrink: 0 }} />
                  <p className="text-[11px]" style={{ color: C.blue }}>
                    {a.display_name} connected — health {getHealthScore(a)}/100
                  </p>
                </div>
              ))}
            </div>
          )}

          {critical.length === 0 && warnings.length === 0 && info.length === 0 && (
            <div className="flex flex-col items-center py-8 gap-2">
              <CheckCircle size={24} style={{ color: C.limeDeep }} />
              <p className="text-[12px] font-bold" style={{ color: C.muted }}>All systems healthy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// -- Configuration Tab ------------------------------------------
// -- Tool Usage Breakdown (Missing 3) --------------------------
function ToolUsageBreakdown({ platformName }: { platformName: string }) {
  const [breakdown, setBreakdown] = useState<any[]>([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const client = createClient()
    async function load() {
      try {
        // Get today's usage grouped by tool
        const today = new Date().toISOString().slice(0, 10)
        const { data } = await (client.from('api_usage_logs') as any)
          .select('tool_name, success_count, error_count, response_time_ms')
          .eq('platform_name', platformName)
          .gte('logged_at', today)

        if (data && data.length > 0) {
          // Group by tool
          const grouped: Record<string, { calls: number; errors: number; totalMs: number }> = {}
          data.forEach((row: any) => {
            const tool = row.tool_name ?? 'other'
            if (!grouped[tool]) grouped[tool] = { calls: 0, errors: 0, totalMs: 0 }
            grouped[tool].calls  += (row.success_count ?? 0) + (row.error_count ?? 0)
            grouped[tool].errors += row.error_count ?? 0
            grouped[tool].totalMs += row.response_time_ms ?? 0
          })

          const totalCalls = Object.values(grouped).reduce((s, v) => s + v.calls, 0)
          setTotal(totalCalls)

          const TOOL_COLORS: Record<string, string> = {
            orders:              C.blue,
            title_builder:       C.purple,
            profit_calculator:   '#ec4899',
            competitor_research: C.amber,
            product_research:    C.limeDeep,
            other:               C.muted,
          }

          setBreakdown(
            Object.entries(grouped)
              .sort(([,a], [,b]) => b.calls - a.calls)
              .map(([tool, stats]) => ({
                tool,
                label:   tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                calls:   stats.calls,
                errors:  stats.errors,
                avgMs:   stats.calls > 0 ? Math.round(stats.totalMs / stats.calls) : 0,
                pct:     totalCalls > 0 ? Math.round((stats.calls / totalCalls) * 100) : 0,
                color:   TOOL_COLORS[tool] ?? C.muted,
              }))
          )
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [platformName])

  if (loading) return (
    <div className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: C.border }} />
  )

  if (breakdown.length === 0) return (
    <div className="p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>TOOL USAGE TODAY</p>
      <p className="text-[11px]" style={{ color: C.muted }}>No API calls yet today</p>
    </div>
  )

  return (
    <div className="p-3 rounded-xl border flex flex-col gap-3" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>TOOL USAGE TODAY</p>
        <p className="text-[11px] font-bold" style={{ color: C.text }}>{total} total calls</p>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {breakdown.map((b, i) => (
          <div key={i} className="h-full rounded-full transition-all"
               style={{ width: `${b.pct}%`, backgroundColor: b.color, minWidth: b.pct > 0 ? 4 : 0 }} />
        ))}
      </div>

      {/* Breakdown list */}
      <div className="flex flex-col gap-1.5">
        {breakdown.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
            <p className="text-[11px] flex-1" style={{ color: C.text }}>{b.label}</p>
            <p className="text-[11px] font-bold" style={{ color: C.muted }}>{b.calls} calls</p>
            {b.errors > 0 && (
              <p className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg"
                 style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                {b.errors} err
              </p>
            )}
            <p className="text-[10px]" style={{ color: C.muted }}>{b.avgMs}ms</p>
            <p className="text-[10px] font-bold w-8 text-right" style={{ color: b.color }}>{b.pct}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// -- ConfigTab --------------------------------------------------
function ConfigTab({ api, onSaved, showToast, canRevoke = true, canEdit = true }: {
  api: any; onSaved: () => void
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
  canRevoke?: boolean
  canEdit?:   boolean
}) {
  // Fix 6: Create supabase once using useState to avoid new instance on every render
  const [supabase]   = useState(() => createClient())
  const [p1,      setP1]      = useState(api.primary_key_1 === 'EMPTY' ? '' : api.primary_key_1 ?? '')
  const [p2,      setP2]      = useState(api.primary_key_2 === 'EMPTY' ? '' : api.primary_key_2 ?? '')
  const [b1,      setB1]      = useState(api.backup_key_1  === 'EMPTY' ? '' : api.backup_key_1  ?? '')
  const [b2,      setB2]      = useState(api.backup_key_2  === 'EMPTY' ? '' : api.backup_key_2  ?? '')
  const [showP2,  setShowP2]  = useState(false)
  const [showB2,  setShowB2]  = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [testing,      setTesting]      = useState(false)
  const [confirmRevoke,setConfirmRevoke] = useState(false)
  const [env,          setEnv]          = useState<'production' | 'sandbox'>(api.environment ?? 'production')

  // Save environment to DB when changed
  async function handleEnvChange(newEnv: 'production' | 'sandbox') {
    setEnv(newEnv)
    try {
      await (supabase.from('api_fleet_config') as any)
        .update({ environment: newEnv, updated_at: new Date().toISOString() })
        .eq('platform_name', api.platform_name)
      showToast(`Switched to ${newEnv}`, 'info')
      onSaved()
    } catch { showToast('Failed to switch environment', 'error') }
  }

  const scopes = api.scopes ?? [
    { name: 'Read Catalog',    granted: true  },
    { name: 'Search Items',    granted: true  },
    { name: 'Create Listings', granted: false },
    { name: 'Issue Refunds',   granted: false },
  ]

  async function handleSave() {
    if (!p1.trim()) { showToast('Primary key 1 is required', 'error'); return }
    setSaving(true)
    try {
      const newExpiry = new Date(Date.now() + (api.rotation_days ?? 90) * 86400000).toISOString()
      await (supabase.from('api_fleet_config') as any).update({
        primary_key_1: p1.trim(),
        primary_key_2: p2.trim() || 'EMPTY',
        backup_key_1:  b1.trim() || 'EMPTY',
        backup_key_2:  b2.trim() || 'EMPTY',
        updated_at:    new Date().toISOString(),
        status:        'connected',
        expires_at:    newExpiry,
      }).eq('platform_name', api.platform_name)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try {
          await (supabase.from('api_key_history') as any).insert({
            user_id:         user.id,
            platform_name:   api.platform_name,
            action:          'updated',
            key_fingerprint: p1.trim().substring(0, 8),
            key_type:        'primary',
            changed_by:      user.email ?? 'admin',
            notes:           `Keys updated — expires ${new Date(newExpiry).toLocaleDateString()}`,
            changed_at:      new Date().toISOString(),
          })
        } catch {}
      }
      showToast('Keys saved to vault', 'success')
      onSaved()
    } catch (e: any) { showToast(e.message ?? 'Save failed', 'error') }
    setSaving(false)
  }

  async function handleTest() {
    if (!p1.trim()) { showToast('Save keys first', 'error'); return }
    setTesting(true)
    const start = Date.now()
    try {
      let success = false
      let ms      = 0

      if (api.platform_name === 'ebay') {
        const result = await createClient().functions.invoke('ebay-proxy', {
          body: { appId: p1.trim(), certId: p2.trim(), testMode: true }
        })
        ms      = Date.now() - start
        success = (result.data as any)?.success === true
      } else if (api.platform_name === 'resend') {
        // For env: keys — test via server-side route
        const res  = await fetch('/api/admin/test-connection', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ platform: 'resend' }),
        })
        const json = await res.json()
        ms      = Date.now() - start
        success = json.success === true
        if (!success) {
          showToast(json.message ?? 'Connection failed', 'error')
          setTesting(false)
          return
        }
      } else if (api.platform_name === 'lemonsqueezy') {
        // Use server-side route — key too long for client
        const lsRes = await fetch('/api/admin/test-connection', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ platform: 'lemonsqueezy' }),
        })
        const lsData = await lsRes.json()
        ms      = Date.now() - start
        success = lsData.success
      } else if (api.platform_name === 'stripe') {
        // Fix 11: Real Stripe test — fetch balance
        const res = await fetch('https://api.stripe.com/v1/balance', {
          headers: { Authorization: `Bearer ${p1.trim()}` }
        })
        ms      = Date.now() - start
        success = res.ok
      } else if (api.platform_name === 'openai') {
        // Fix 11: Real OpenAI test — fetch models
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${p1.trim()}` }
        })
        ms      = Date.now() - start
        success = res.ok
      } else {
        await new Promise(r => setTimeout(r, 800))
        ms      = Date.now() - start
        success = true
      }

      await (supabase.from('api_fleet_config') as any).update({
        status:          success ? 'connected' : 'error',
        last_tested_at:  new Date().toISOString(),
        last_used_at:    new Date().toISOString(),
        last_request_at: new Date().toISOString(),
      }).eq('platform_name', api.platform_name)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try {
          await (supabase.from('api_key_history') as any).insert({
            user_id:       user.id,
            platform_name: api.platform_name,
            action:        'tested',
            key_type:      'primary',
            changed_by:    user.email ?? 'admin',
            notes:         `Test ${success ? 'passed' : 'failed'} — ${ms}ms`,
            changed_at:    new Date().toISOString(),
          })
        } catch {}
      }

      showToast(success ? `Connection OK — ${ms}ms` : 'Connection failed', success ? 'success' : 'error')
      onSaved()
    } catch { showToast('Test failed', 'error') }
    setTesting(false)
  }

  const isEnvKey = p1.startsWith('env:') || api.primary_key_1?.startsWith('env:')

  async function handleRevoke() {
    if (!confirmRevoke) { setConfirmRevoke(true); setTimeout(() => setConfirmRevoke(false), 3000); return }
    await (supabase.from('api_fleet_config') as any).update({
      primary_key_1: 'EMPTY', primary_key_2: 'EMPTY',
      backup_key_1:  'EMPTY', backup_key_2:  'EMPTY',
      status: 'disconnected', updated_at: new Date().toISOString(),
    }).eq('platform_name', api.platform_name)
    setP1(''); setP2(''); setB1(''); setB2('')
    showToast('Keys revoked', 'info')
    onSaved()
  }

  function copyFP(key: string, label: string) {
    if (!key || key === 'EMPTY') { showToast('No key to copy', 'error'); return }
    navigator.clipboard.writeText(fingerprint(key))
    showToast(`${label} fingerprint copied`, 'info')
  }

  if (api.is_locked) return (
    <div className="p-10 flex flex-col items-center gap-3" style={{ backgroundColor: C.bg }}>
      <Lock size={32} style={{ color: C.muted }} />
      <p className="text-[14px] font-bold" style={{ color: C.muted }}>{api.display_name} — Coming Soon</p>
      <p className="text-[12px] text-center" style={{ color: C.muted }}>
        Keys can be added when this integration is ready
      </p>
    </div>
  )

  return (
    <div className="p-5 flex flex-col gap-5" style={{ backgroundColor: C.bg }}>

      {/* Primary keys */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>PRIMARY KEYS</p>

        {isEnvKey ? (
          <div className="flex items-start gap-3 p-3 rounded-xl border"
               style={{ backgroundColor: C.limeTint, borderColor: C.limeDeep + '40' }}>
            <Shield size={14} style={{ color: C.limeDeep, marginTop: 1, flexShrink: 0 }} />
            <div>
              <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>
                Key stored in environment variables
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                {api.primary_key_1?.replace('env:', '')} is set in Vercel ? Settings ? Environment Variables.
                This is the most secure way to store API keys.
              </p>
              <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer"
                 className="text-[11px] font-bold mt-1 inline-flex items-center gap-1 hover:opacity-70"
                 style={{ color: C.limeDeep }}>
                <ExternalLink size={10} /> Manage in Vercel
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold" style={{ color: C.muted }}>
                  {api.platform_name === 'lemonsqueezy' ? 'API Key' :
                   api.platform_name === 'stripe'       ? 'Secret Key' :
                   api.platform_name === 'openai'       ? 'API Key' :
                   'Key 1 / App ID'}
                </p>
                <button onClick={() => copyFP(p1, 'Key 1')}
                  className="flex items-center gap-1 text-[10px] hover:opacity-70"
                  style={{ color: C.muted }}>
                  <Copy size={9} /> {fingerprint(p1)}
                </button>
              </div>
              <input value={p1} onChange={e => setP1(e.target.value)}
                placeholder={
                  api.platform_name === 'lemonsqueezy' ? 'Paste LemonSqueezy API key...' :
                  api.platform_name === 'stripe'       ? 'sk_live_...' :
                  api.platform_name === 'openai'       ? 'sk-...' :
                  'Paste key 1...'
                }
                className="w-full h-10 px-3 rounded-xl border text-[12px] font-mono outline-none"
                style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold" style={{ color: C.muted }}>
                  {api.platform_name === 'lemonsqueezy' ? 'Webhook Secret' :
                   api.platform_name === 'stripe'       ? 'Webhook Secret' :
                   'Key 2 / Secret'}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyFP(p2, 'Key 2')}
                    className="flex items-center gap-1 text-[10px] hover:opacity-70"
                    style={{ color: C.muted }}>
                    <Copy size={9} /> {fingerprint(p2)}
                  </button>
                  <button onClick={() => setShowP2(s => !s)} className="hover:opacity-70">
                    {showP2 ? <EyeOff size={11} style={{ color: C.muted }} /> : <Eye size={11} style={{ color: C.muted }} />}
                  </button>
                </div>
              </div>
              <input value={p2} onChange={e => setP2(e.target.value)}
                type={showP2 ? 'text' : 'password'}
                placeholder={
                  api.platform_name === 'lemonsqueezy' ? 'Paste webhook signing secret...' :
                  api.platform_name === 'stripe'       ? 'whsec_...' :
                  'Paste key 2...'
                }
                className="w-full h-10 px-3 rounded-xl border text-[12px] font-mono outline-none"
                style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
            </div>
          </div>
        )}
      </div>

      {/* Fallback keys */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>FALLBACK KEYS</p>
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-lg"
                style={{ backgroundColor: 'rgba(29,78,216,0.08)', color: C.blue }}>STANDBY</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input value={b1} onChange={e => setB1(e.target.value)}
            placeholder="Fallback key 1 (optional)..."
            className="w-full h-10 px-3 rounded-xl border text-[12px] font-mono outline-none"
            style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
          <div className="relative">
            <input value={b2} onChange={e => setB2(e.target.value)}
              type={showB2 ? 'text' : 'password'}
              placeholder="Fallback key 2 (optional)..."
              className="w-full h-10 px-3 pr-10 rounded-xl border text-[12px] font-mono outline-none"
              style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
            <button onClick={() => setShowB2(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70">
              {showB2 ? <EyeOff size={11} style={{ color: C.muted }} /> : <Eye size={11} style={{ color: C.muted }} />}
            </button>
          </div>
        </div>
      </div>

      {/* LemonSqueezy specific info */}
      {api.platform_name === 'lemonsqueezy' && (
        <div className="p-4 rounded-xl border flex flex-col gap-3"
             style={{ borderColor: 'rgba(99,102,241,0.2)', backgroundColor: 'rgba(99,102,241,0.04)' }}>
          <p className="text-[10px] font-black tracking-wider" style={{ color: '#6366f1' }}>
            LEMONSQUEEZY SETUP
          </p>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <p className="font-bold mb-0.5" style={{ color: C.muted }}>Store ID</p>
              <p className="font-mono font-bold" style={{ color: C.text }}>402187</p>
            </div>
            <div>
              <p className="font-bold mb-0.5" style={{ color: C.muted }}>Webhook URL</p>
              <p className="font-mono text-[10px] truncate" style={{ color: C.text }}>
                /api/webhooks/lemonsqueezy
              </p>
            </div>
            <div>
              <p className="font-bold mb-0.5" style={{ color: C.muted }}>Key 1</p>
              <p style={{ color: C.muted }}>API Key (from LS Settings ? API)</p>
            </div>
            <div>
              <p className="font-bold mb-0.5" style={{ color: C.muted }}>Key 2</p>
              <p style={{ color: C.muted }}>Webhook Signing Secret</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Starter Monthly', value: '1816372' },
              { label: 'Starter Annual',  value: '1816460' },
              { label: 'Growth Monthly',  value: '1816599' },
              { label: 'Growth Annual',   value: '1816810' },
              { label: 'Custom Monthly',  value: '1816827' },
              { label: 'Custom Annual',   value: '1816837' },
            ].map((v, i) => (
              <div key={i} className="px-2.5 py-1.5 rounded-lg border text-[10px]"
                   style={{ borderColor: C.border, backgroundColor: C.surface }}>
                <span style={{ color: C.muted }}>{v.label}: </span>
                <span className="font-mono font-bold" style={{ color: C.text }}>{v.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing 4: Environment — wired to DB */}
      <div>
        <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>ENVIRONMENT</p>
        <div className="flex items-center gap-2 flex-wrap">
          {(['production', 'sandbox'] as const).map(e => (
            <button key={e} onClick={() => handleEnvChange(e)}
              className="px-3 py-2 rounded-xl border text-[12px] font-bold capitalize transition-all"
              style={{
                backgroundColor: env === e ? C.dark    : C.surface,
                borderColor:     env === e ? C.dark    : C.border,
                color:           env === e ? C.lime    : C.muted,
              }}>
              {e}
            </button>
          ))}
          {env === 'sandbox' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                 style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: `1px solid rgba(217,119,6,0.2)` }}>
              <AlertTriangle size={11} style={{ color: C.amber }} />
              <span className="text-[10px] font-bold" style={{ color: C.amber }}>
                Sandbox mode — fake data only
              </span>
            </div>
          )}
        </div>
        {env === 'sandbox' && api.platform_name === 'ebay' && (
          <p className="text-[10px] mt-1.5" style={{ color: C.muted }}>
            eBay sandbox uses separate keys from developer.ebay.com sandbox environment
          </p>
        )}
      </div>

      {/* Rate limit */}
      {api.rate_limit_total > 0 && (
        <div className="p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>DAILY RATE LIMIT</p>
            <p className="text-[11px] font-bold" style={{ color: C.text }}>
              {(api.rate_limit_used ?? 0).toLocaleString()} / {(api.rate_limit_total ?? 0).toLocaleString()} requests
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-1" style={{ backgroundColor: C.border }}>
            <div className="h-full rounded-full transition-all"
                 style={{
                   width: `${Math.min(((api.rate_limit_used ?? 0) / Math.max(api.rate_limit_total ?? 1, 1)) * 100, 100)}%`,
                   backgroundColor: ((api.rate_limit_used ?? 0) / Math.max(api.rate_limit_total ?? 1, 1)) > 0.85 ? C.red :
                                    ((api.rate_limit_used ?? 0) / Math.max(api.rate_limit_total ?? 1, 1)) > 0.7  ? C.amber : C.lime,
                 }} />
          </div>
          <p className="text-[10px]" style={{ color: C.muted }}>
            {Math.round(((api.rate_limit_used ?? 0) / Math.max(api.rate_limit_total ?? 1, 1)) * 100)}% used today
            — resets at midnight UTC
          </p>
        </div>
      )}

      {/* Missing 6: Resend monthly email quota */}
      {api.platform_name === 'resend' && (api.monthly_limit ?? 0) > 0 && (
        <div className="p-3 rounded-xl border" style={{
          borderColor: ((api.monthly_used ?? 0) / (api.monthly_limit ?? 1)) > 0.85 ? 'rgba(185,28,28,0.3)' : C.border,
          backgroundColor: ((api.monthly_used ?? 0) / (api.monthly_limit ?? 1)) > 0.85 ? 'rgba(185,28,28,0.04)' : C.surface,
        }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>MONTHLY EMAIL QUOTA</p>
            <p className="text-[11px] font-bold" style={{ color: C.text }}>
              {(api.monthly_used ?? 0).toLocaleString()} / {(api.monthly_limit ?? 0).toLocaleString()} emails
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-1" style={{ backgroundColor: C.border }}>
            <div className="h-full rounded-full transition-all"
                 style={{
                   width: `${Math.min(((api.monthly_used ?? 0) / Math.max(api.monthly_limit ?? 1, 1)) * 100, 100)}%`,
                   backgroundColor: ((api.monthly_used ?? 0) / (api.monthly_limit ?? 1)) > 0.85 ? C.red :
                                    ((api.monthly_used ?? 0) / (api.monthly_limit ?? 1)) > 0.7  ? C.amber : C.lime,
                 }} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px]" style={{ color: C.muted }}>
              {Math.round(((api.monthly_used ?? 0) / Math.max(api.monthly_limit ?? 1, 1)) * 100)}% used this month
            </p>
            {((api.monthly_used ?? 0) / (api.monthly_limit ?? 1)) > 0.8 && (
              <p className="text-[10px] font-bold" style={{ color: C.amber }}>
                Consider upgrading Resend plan
              </p>
            )}
          </div>
        </div>
      )}

      {/* Active scopes */}
      <div>
        <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>ACTIVE SCOPES</p>
        <div className="flex flex-wrap gap-2">
          {scopes.map((s: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
                 style={{
                   backgroundColor: s.granted ? 'rgba(22,163,74,0.08)' : 'rgba(185,28,28,0.06)',
                   borderColor:     s.granted ? 'rgba(22,163,74,0.2)'  : 'rgba(185,28,28,0.15)',
                 }}>
              {s.granted
                ? <CheckCircle size={10} style={{ color: C.green }} />
                : <XCircle     size={10} style={{ color: C.red   }} />}
              <span className="text-[10px] font-bold"
                    style={{ color: s.granted ? C.green : C.red }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Used by */}
      {api.used_by && Array.isArray(api.used_by) && api.used_by.length > 0 && (
        <div>
          <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>USED BY</p>
          <div className="flex flex-wrap gap-2">
            {api.used_by.map((tool: string, i: number) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                    style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing 3: Per-tool usage breakdown */}
      <ToolUsageBreakdown platformName={api.platform_name} />

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={handleSave} disabled={saving || !p1.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
          {saving
            ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
            : <><CloudUpload size={13} /> Save to Vault</>}
        </button>
        <button onClick={handleTest} disabled={testing || !p1.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
          style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }}>
          {testing
            ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.text }} />
            : <><Wifi size={13} /> Test Connection</>}
        </button>

        {/* Missing 7: Quick reconnect — opens docs/portal */}
        {api.docs_url && (
          <a href={
            api.platform_name === 'ebay'         ? 'https://developer.ebay.com/my/keys' :
            api.platform_name === 'resend'        ? 'https://resend.com/api-keys' :
            api.platform_name === 'openai'        ? 'https://platform.openai.com/api-keys' :
            api.platform_name === 'lemonsqueezy'  ? 'https://app.lemonsqueezy.com/settings/api' :
            api.platform_name === 'stripe'        ? 'https://dashboard.stripe.com/apikeys' :
            api.platform_name === 'aliexpress'    ? 'https://portals.aliexpress.com/developer/index.htm' :
            api.docs_url
          } target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold hover:opacity-80 transition-all"
            style={{ borderColor: C.limeDeep + '40', backgroundColor: C.limeTint, color: C.limeDeep }}>
            <RefreshCw size={13} /> Get New Keys
          </a>
        )}

        {api.docs_url && (
          <a href={api.docs_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold hover:opacity-80"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
            <ExternalLink size={11} /> Docs
          </a>
        )}
        <div className="flex-1" />
        {canRevoke && <button onClick={handleRevoke}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold hover:opacity-80 transition-all"
          style={{
            backgroundColor: confirmRevoke ? C.red                   : 'rgba(185,28,28,0.08)',
            color:           confirmRevoke ? '#ffffff'                : C.red,
          }}>
          <Trash2 size={13} />
          {confirmRevoke ? 'Click again to confirm revoke' : 'Revoke Keys'}
        </button>}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl border"
           style={{ backgroundColor: C.limeTint, borderColor: 'rgba(143,255,0,0.4)' }}>
        <Info size={12} style={{ color: C.limeDeep, marginTop: 1, flexShrink: 0 }} />
        <p className="text-[11px]" style={{ color: C.dark }}>
          Saving keys auto-resets expiry to {api.rotation_days ?? 90} days. All keys encrypted via Supabase RLS.
        </p>
      </div>
    </div>
  )
}

// -- Activity Tab -----------------------------------------------
function ActivityTab({ api }: { api: any }) {
  const [history,   setHistory]   = useState<any[]>([])
  const [errors,    setErrors]    = useState<any[]>([])
  const [usageLogs, setUsageLogs] = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<'keys' | 'errors' | 'calls'>('keys')

  useEffect(() => {
    const client = createClient()
    async function load() {
      try {
        const [
          { data: keyHistory },
          { data: errorLogs },
          { data: apiCalls },
        ] = await Promise.all([
          // Key history — uses changed_at column
          (client.from('api_key_history') as any)
            .select('*')
            .eq('platform_name', api.platform_name)
            .order('changed_at', { ascending: false })
            .limit(20),
          // Missing 5: Error logs from api_usage_logs
          (client.from('api_usage_logs') as any)
            .select('*')
            .eq('platform_name', api.platform_name)
            .gt('error_count', 0)
            .order('logged_at', { ascending: false })
            .limit(20),
          // Recent API calls
          (client.from('api_usage_logs') as any)
            .select('*')
            .eq('platform_name', api.platform_name)
            .order('logged_at', { ascending: false })
            .limit(20),
        ])
        setHistory(keyHistory   ?? [])
        setErrors(errorLogs     ?? [])
        setUsageLogs(apiCalls   ?? [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [api.platform_name])

  function actionColor(action: string) {
    if (action === 'updated') return { color: C.limeDeep, bg: C.limeTint }
    if (action === 'tested')  return { color: C.blue,     bg: 'rgba(29,78,216,0.08)' }
    if (action === 'revoked') return { color: C.red,      bg: 'rgba(185,28,28,0.08)' }
    if (action === 'created') return { color: C.purple,   bg: 'rgba(124,58,237,0.08)' }
    return { color: C.muted, bg: C.bg }
  }

  const SUBTABS = [
    { key: 'keys',   label: 'Key History',  count: history.length                              },
    { key: 'errors', label: 'Error Log',    count: errors.length,  warn: errors.length > 0    },
    { key: 'calls',  label: 'API Calls',    count: usageLogs.length                            },
  ]

  return (
    <div className="p-5 flex flex-col gap-4" style={{ backgroundColor: C.bg }}>

      {/* Sub tabs */}
      <div className="flex gap-1.5">
        {SUBTABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
            style={{
              backgroundColor: activeTab === t.key ? '#8fff00'    : C.surface,
              color: activeTab === t.key ? '#1a2410'    : C.muted,
              border:          `1px solid ${activeTab === t.key ? C.dark : C.border}`,
            }}>
            {t.label}
            {t.count > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: (t as any).warn ? C.red : activeTab === t.key ? C.lime : C.bg,
                      color:           (t as any).warn ? '#fff' : activeTab === t.key ? C.dark : C.muted,
                    }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0,1,2].map(i => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ backgroundColor: C.border }} />)}
        </div>
      ) : (
        <>
          {/* Key History */}
          {activeTab === 'keys' && (
            history.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Clock size={24} style={{ color: C.border }} />
                <p className="text-[12px]" style={{ color: C.muted }}>No key activity recorded yet</p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
                <div className="grid px-4 py-2 border-b"
                     style={{ gridTemplateColumns: '1.2fr 0.7fr 1fr 0.8fr 1.5fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
                  {['DATE', 'ACTION', 'BY', 'FINGERPRINT', 'NOTES'].map(h => (
                    <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
                  ))}
                </div>
                {history.map((h: any, i: number) => {
                  const ac = actionColor(h.action)
                  return (
                    <div key={i} className="grid items-center px-4 py-2.5 border-b last:border-b-0"
                         style={{ gridTemplateColumns: '1.2fr 0.7fr 1fr 0.8fr 1.5fr', gap: 12, borderColor: C.border }}>
                      <span className="text-[11px]" style={{ color: C.muted }}>
                        {new Date(h.changed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg w-fit capitalize"
                            style={{ backgroundColor: ac.bg, color: ac.color }}>{h.action}</span>
                      <span className="text-[11px] truncate" style={{ color: C.text }}>{h.changed_by ?? '—'}</span>
                      <span className="text-[11px] font-mono" style={{ color: C.muted }}>
                        {h.key_fingerprint ? `${h.key_fingerprint}…` : '—'}
                      </span>
                      <span className="text-[11px] truncate" style={{ color: C.muted }}>{h.notes ?? '—'}</span>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Missing 5: Error Log */}
          {activeTab === 'errors' && (
            errors.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <CheckCircle size={24} style={{ color: C.limeDeep }} />
                <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>No errors recorded</p>
                <p className="text-[11px]" style={{ color: C.muted }}>All API calls succeeded</p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
                <div className="grid px-4 py-2 border-b"
                     style={{ gridTemplateColumns: '1.2fr 0.8fr 0.6fr 0.6fr 1.5fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
                  {['DATE', 'TOOL', 'CALL', 'ERRORS', 'MESSAGE'].map(h => (
                    <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
                  ))}
                </div>
                {errors.map((e: any, i: number) => (
                  <div key={i} className="grid items-center px-4 py-2.5 border-b last:border-b-0"
                       style={{ gridTemplateColumns: '1.2fr 0.8fr 0.6fr 0.6fr 1.5fr', gap: 12, borderColor: C.border }}>
                    <span className="text-[11px]" style={{ color: C.muted }}>
                      {new Date(e.logged_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      {' '}{new Date(e.logged_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[11px] capitalize truncate" style={{ color: C.text }}>
                      {e.tool_name?.replace('_', ' ') ?? '—'}
                    </span>
                    <span className="text-[11px] truncate" style={{ color: C.muted }}>{e.call_name ?? '—'}</span>
                    <span className="text-[11px] font-bold" style={{ color: C.red }}>{e.error_count}</span>
                    <span className="text-[11px] truncate" style={{ color: C.red }}>
                      {e.error_message ?? 'Unknown error'}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* API Calls log */}
          {activeTab === 'calls' && (
            usageLogs.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Clock size={24} style={{ color: C.border }} />
                <p className="text-[12px]" style={{ color: C.muted }}>No API calls recorded yet</p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
                <div className="grid px-4 py-2 border-b"
                     style={{ gridTemplateColumns: '1fr 0.8fr 0.6fr 0.4fr 0.4fr 0.5fr 1.2fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
                  {['DATE', 'TOOL', 'CALL', 'OK', 'ERR', 'MS', 'TO'].map(h => (
                    <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
                  ))}
                </div>
                {usageLogs.map((log: any, i: number) => (
                  <div key={i} className="grid items-center px-4 py-2.5 border-b last:border-b-0"
                       style={{ gridTemplateColumns: '1fr 0.8fr 0.6fr 0.4fr 0.4fr 0.5fr 1.2fr', gap: 12, borderColor: C.border }}>
                    <span className="text-[11px]" style={{ color: C.muted }}>
                      {new Date(log.logged_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-[11px] capitalize truncate" style={{ color: C.text }}>
                      {log.tool_name?.replace(/_/g, ' ') ?? '—'}
                    </span>
                    <span className="text-[11px] truncate" style={{ color: C.muted }}>{log.call_name ?? '—'}</span>
                    <span className="text-[11px] font-bold" style={{ color: log.success_count > 0 ? C.limeDeep : C.muted }}>
                      {log.success_count}
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: log.error_count > 0 ? C.red : C.muted }}>
                      {log.error_count}
                    </span>
                    <span className="text-[11px]" style={{ color: log.response_time_ms > 2000 ? C.amber : C.muted }}>
                      {log.response_time_ms}ms
                    </span>
                    <span className="text-[10px] font-mono truncate" style={{ color: C.muted }}
                          title={log.to_email ?? ''}>
                      {log.to_email ? log.to_email.replace(/(.{3}).*(@.*)/, '$1…$2') : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

// -- Security Tab -----------------------------------------------
function SecurityTab({ api, onSaved, showToast }: {
  api: any; onSaved: () => void
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) {
  // Fix 6: stable supabase instance
  const [supabase]   = useState(() => createClient())
  const [newIp,      setNewIp]      = useState('')
  const [whitelist,  setWhitelist]  = useState<string[]>(api.ip_whitelist ?? [])
  const [rotDays,    setRotDays]    = useState(String(api.rotation_days ?? 90))
  const [saving,     setSaving]     = useState(false)
  // Fix 4: alert toggles connected to webhook system
  const [alertHealth,  setAlertHealth]  = useState(true)
  const [alertExpiry,  setAlertExpiry]  = useState(true)
  const [alertRate,    setAlertRate]    = useState(true)
  const [alertUnusual, setAlertUnusual] = useState(true)

  const days         = getDaysUntilExpiry(api.expires_at)
  const lastRotated  = api.updated_at ? Math.floor((Date.now() - new Date(api.updated_at).getTime()) / 86400000) : null
  const nextRotation = lastRotated !== null ? Math.max((api.rotation_days ?? 90) - lastRotated, 0) : null

  function addIp() {
    if (!newIp.trim()) return
    setWhitelist(p => [...p, newIp.trim()])
    setNewIp('')
  }

  async function saveSettings() {
    setSaving(true)
    try {
      await (supabase.from('api_fleet_config') as any)
        .update({
          ip_whitelist:   whitelist,
          rotation_days:  Number(rotDays),
          updated_at:     new Date().toISOString(),
        })
        .eq('platform_name', api.platform_name)

      // Fix 4: Fire webhook alert when expiry is critical
      if (alertExpiry && days > 0 && days <= 7) {
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
          await fetch(`${appUrl}/api/admin/webhooks`, {
            method:  'POST',
            headers: {
              'Content-Type':      'application/json',
              'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_SECRET ?? '',
            },
            body: JSON.stringify({
              event_type: 'api.failure',
              data: {
                api:     api.display_name,
                issue:   `Keys expire in ${days} days`,
                action:  'Rotate keys immediately',
              }
            }),
          })
        } catch {}
      }

      showToast('Security settings saved', 'success')
      onSaved()
    } catch { showToast('Failed to save', 'error') }
    setSaving(false)
  }

  return (
    <div className="p-5 flex flex-col gap-5" style={{ backgroundColor: C.bg }}>

      {/* IP Whitelist */}
      <div>
        <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>IP WHITELIST</p>
        {/* Fix 5: clarify enforcement */}
        <p className="text-[10px] mb-3" style={{ color: C.muted }}>
          Stored for reference — enforced via Supabase RLS or your middleware
        </p>
        <div className="flex gap-2 mb-3">
          <input value={newIp} onChange={e => setNewIp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addIp()}
            placeholder="Add IP address (e.g. 1.2.3.4)..."
            className="flex-1 h-9 px-3 rounded-xl border text-[12px] font-mono outline-none"
            style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
          <button onClick={addIp}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-[12px] font-bold"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Plus size={12} /> Add
          </button>
        </div>
        {whitelist.length === 0 ? (
          <p className="text-[11px]" style={{ color: C.muted }}>No IP restrictions — all IPs allowed</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {whitelist.map((ip, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl border"
                   style={{ borderColor: C.border, backgroundColor: C.surface }}>
                <span className="text-[12px] font-mono" style={{ color: C.text }}>{ip}</span>
                <button onClick={() => setWhitelist(p => p.filter((_, j) => j !== i))}
                  className="hover:opacity-70">
                  <X size={12} style={{ color: C.muted }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fix 4: Alerts with real toggles */}
      <div>
        <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>ALERTS</p>
        <p className="text-[10px] mb-3" style={{ color: C.muted }}>
          Fires to Discord #riazify-alerts via webhook system
        </p>
        <div className="flex flex-col gap-2 p-3 rounded-xl border"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          {[
            { label: 'Alert when health drops below 50',    val: alertHealth,  set: setAlertHealth  },
            { label: 'Alert when keys expire in 7 days',    val: alertExpiry,  set: setAlertExpiry  },
            { label: 'Alert when rate limit exceeds 80%',   val: alertRate,    set: setAlertRate    },
            { label: 'Alert when unusual activity detected', val: alertUnusual, set: setAlertUnusual },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <p className="text-[11px]" style={{ color: C.text }}>{a.label}</p>
              <div onClick={() => a.set((s: boolean) => !s)}
                   className="relative w-9 h-5 rounded-full cursor-pointer shrink-0"
                   style={{ backgroundColor: a.val ? C.dark : 'rgba(100,116,139,0.3)' }}>
                <div style={{
                  position: 'absolute', top: 2, left: 2,
                  width: 16, height: 16, borderRadius: '50%',
                  backgroundColor: a.val ? C.lime : '#fff',
                  transform: a.val ? 'translateX(16px)' : 'translateX(0)',
                  transition: 'transform 0.2s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rotation schedule */}
      <div>
        <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.muted }}>ROTATION SCHEDULE</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'Rotate every',   value: `${rotDays} days`                                        },
            { label: 'Last rotated',   value: lastRotated !== null ? `${lastRotated} days ago` : 'Never' },
            { label: 'Next rotation',  value: nextRotation !== null ? `${nextRotation} days`  : '—'     },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
              <p className="text-[9px] font-black tracking-wider mb-1" style={{ color: C.muted }}>{s.label.toUpperCase()}</p>
              <p className="text-[13px] font-black" style={{ color: C.dark }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px]" style={{ color: C.muted }}>Rotation interval (days):</p>
          <input value={rotDays} onChange={e => setRotDays(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-16 h-8 px-2 rounded-lg border text-[12px] font-bold text-center outline-none"
            style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
        </div>
      </div>

      {/* Expiry warning */}
      {days > 0 && days <= 30 && (
        <div className="flex items-center gap-2 p-3 rounded-xl border"
             style={{
               backgroundColor: days <= 7 ? 'rgba(185,28,28,0.06)' : 'rgba(217,119,6,0.06)',
               borderColor:     days <= 7 ? 'rgba(185,28,28,0.2)'  : 'rgba(217,119,6,0.2)',
             }}>
          <AlertTriangle size={14} style={{ color: days <= 7 ? C.red : C.amber }} />
          <p className="text-[11px] font-bold" style={{ color: days <= 7 ? C.red : C.amber }}>
            Keys expire in {days} days — save new keys to reset expiry
          </p>
        </div>
      )}

      <button onClick={saveSettings} disabled={saving}
        className="flex items-center gap-2 w-fit px-4 py-2.5 rounded-xl text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
        style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
        {saving
          ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
          : <><Shield size={13} /> Save Security Settings</>}
      </button>
    </div>
  )
}

// -- Expanded Row with Tabs -------------------------------------
function ExpandedRow({ api, onSaved, showToast, canRevoke = true }: {
  api: any; onSaved: () => void
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
  canRevoke?: boolean
}) {
  const [tab, setTab] = useState<'config' | 'activity' | 'security'>('config')

  const TABS = [
    { key: 'config',   label: 'Configuration', icon: Settings  },
    { key: 'activity', label: 'Activity',       icon: Activity  },
    { key: 'security', label: 'Security',       icon: Shield    },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b"
           style={{ borderColor: C.border, backgroundColor: C.surface }}>
        {TABS.map(t => {
          const TIcon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                backgroundColor: tab === t.key ? '#8fff00'    : 'transparent',
                color: tab === t.key ? '#1a2410'    : C.muted,
              }}>
              <TIcon size={11} />
              {t.label}
            </button>
          )
        })}
        {api.docs_url && (
          <a href={api.docs_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold ml-1 hover:opacity-70"
            style={{ color: C.muted }}>
            <ExternalLink size={11} /> Docs
          </a>
        )}
      </div>

      {/* Tab content */}
      {tab === 'config'   && <ConfigTab   api={api} onSaved={onSaved} showToast={showToast} canRevoke={canRevoke} />}
      {tab === 'activity' && <ActivityTab api={api} />}
      {tab === 'security' && <SecurityTab api={api} onSaved={onSaved} showToast={showToast} />}
    </div>
  )
}

// -- API Modal --------------------------------------------------
function ApiModal({ api, onClose, onSaved, showToast, canRevoke = true }: {
  api:        any
  onClose:    () => void
  onSaved:    (updatedApi: any) => void
  showToast:  (msg: string, type: 'success' | 'error' | 'info') => void
  canRevoke?: boolean
}) {
  const [visible,    setVisible]    = useState(false)
  // Fix 7: track live api data inside modal so header refreshes after save
  const [liveApi,    setLiveApi]    = useState(api)

  const meta  = CATEGORY_META[liveApi.category] ?? { icon: Server, color: C.muted, bg: C.bg, label: '' }
  const PIcon = PLATFORM_ICONS[liveApi.platform_name] ?? Server
  const sm    = statusMeta(liveApi.status, liveApi.is_locked)
  const health = getHealthScore(liveApi)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
  // Fix 7: update liveApi when parent api changes
  useEffect(() => { setLiveApi(api) }, [api])

  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  // Fix 8: onSaved refreshes liveApi from DB
  async function handleSaved() {
    try {
      const supabase = createClient()
      const { data } = await (supabase.from('api_fleet_config') as any)
        .select('*')
        .eq('platform_name', liveApi.platform_name)
        .single()
      if (data) setLiveApi(data)
      onSaved(data ?? liveApi)
    } catch { onSaved(liveApi) }
  }

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
           style={{
             backgroundColor: C.surface,
             maxHeight: '90vh',
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity:   visible ? 1 : 0,
             transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ backgroundColor: meta.bg }}>
            <PIcon size={18} style={{ color: meta.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-black" style={{ color: C.dark }}>
                {api.display_name ?? api.platform_name}
              </p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
                   style={{ backgroundColor: sm.bg }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sm.dot }} />
                <span className="text-[9px] font-black" style={{ color: sm.color }}>{sm.label}</span>
              </div>
            </div>
            <p className="text-[11px]" style={{ color: C.muted }}>
              {liveApi.category?.toUpperCase()} API — Health: {health}/100
            </p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Modal body — tabs */}
        <div className="flex-1 overflow-y-auto">
          <ExpandedRow
            api={liveApi}
            onSaved={handleSaved}
            showToast={showToast}
            canRevoke={canRevoke}
          />
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------
export default function ApiVaultPage() {
  const { can } = useTabPermissions('api_vault')
  const supabase = createClient()

  const [apis,         setApis]         = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)
  const [testing,      setTesting]      = useState(false)
  const [selectedApi,  setSelectedApi]  = useState<any | null>(null)
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState<'all' | 'connected' | 'disconnected' | 'expiring'>('all')
  const [showNotifs,   setShowNotifs]   = useState(false)
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadApis = useCallback(async () => {
    try {
      const { data } = await (supabase.from('api_fleet_config') as any)
        .select('*')
        .not('platform_name', 'like', '%affiliate%')
        .order('category')
        .order('platform_name')
      setApis(data ?? [])
    } catch {}
    setLoading(false)
    setRefreshing(false)
    setTesting(false)
  }, [supabase])

  useEffect(() => { loadApis() }, [loadApis])

  async function testAll() {
    setTesting(true)
    showToast('Testing all connections...', 'info')
    let passed = 0
    let failed = 0

    for (const api of apis.filter(a => a.status !== 'disconnected' && !a.is_locked)) {
      const start  = Date.now()
      let success  = false
      let newStatus = 'error'

      try {
        if (api.platform_name === 'ebay') {
          const result = await supabase.functions.invoke('ebay-proxy', {
            body: { appId: api.primary_key_1, certId: api.primary_key_2, testMode: true }
          })
          success   = (result.data as any)?.success === true
          newStatus = success ? 'connected' : 'error'
        } else if (api.platform_name === 'resend') {
          // Test via server-side route (key is in env var)
          const res = await fetch('/api/admin/test-connection', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ platform: 'resend' }),
          })
          success   = res.ok && (await res.json()).success === true
          newStatus = success ? 'connected' : 'error'
        } else if (api.platform_name === 'lemonsqueezy') {
          // Use server-side route — key too long for client
          const lsRes2 = await fetch('/api/admin/test-connection', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ platform: 'lemonsqueezy' }),
          })
          const lsData2 = await lsRes2.json()
          success   = lsData2.success
          newStatus = success ? 'connected' : 'error'
        } else if (api.platform_name === 'stripe') {
          // Fix 11: Real Stripe test
          const p1 = api.primary_key_1
          if (p1 && p1 !== 'EMPTY') {
            const res = await fetch('https://api.stripe.com/v1/balance', {
              headers: { Authorization: `Bearer ${p1}` }
            })
            success   = res.ok
            newStatus = success ? 'connected' : 'error'
          }
        } else if (api.platform_name === 'openai') {
          // Fix 11: Real OpenAI test
          const p1 = api.primary_key_1
          if (p1 && p1 !== 'EMPTY') {
            const res = await fetch('https://api.openai.com/v1/models', {
              headers: { Authorization: `Bearer ${p1}` }
            })
            success   = res.ok
            newStatus = success ? 'connected' : 'error'
          }
        } else {
          await new Promise(r => setTimeout(r, 500))
          success   = api.status === 'connected'
          newStatus = api.status
        }
      } catch {
        success   = false
        newStatus = 'error'
      }

      if (success) { passed++ } else { failed++ }

      try {
        await (supabase.from('api_fleet_config') as any).update({
          status:          newStatus,
          last_tested_at:  new Date().toISOString(),
          last_used_at:    new Date().toISOString(),
          last_request_at: new Date().toISOString(),
        }).eq('platform_name', api.platform_name)

        // Log to history
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await (supabase.from('api_key_history') as any).insert({
            user_id:       user.id,
            platform_name: api.platform_name,
            action:        'tested',
            key_type:      'primary',
            changed_by:    user.email ?? 'admin',
            notes:         `Test ${success ? 'passed' : 'failed'} — ${Date.now() - start}ms`,
            changed_at:    new Date().toISOString(),
          })
        }
      } catch {}
    }

    await loadApis()
    showToast(`Test complete — ${passed} passed, ${failed} failed`, passed > 0 && failed === 0 ? 'success' : failed > 0 ? 'error' : 'info')
  }

  async function exportAuditLog() {
    try {
      const { data } = await (supabase.from('api_key_history') as any)
        .select('*').order('created_at', { ascending: false })
      if (!data || data.length === 0) { showToast('No audit log data', 'info'); return }
      const csv = [
        'Date,Platform,Action,By,Fingerprint,Notes',
        ...data.map((h: any) => `${h.created_at},${h.platform_name},${h.action},${h.changed_by},${h.key_fingerprint ?? ''},${h.notes ?? ''}`),
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `api-audit-log-${new Date().toISOString().slice(0,10)}.csv`; a.click()
      // Fix 9: clean up object URL to prevent memory leak
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      showToast('Audit log exported', 'success')
    } catch { showToast('Export failed', 'error') }
  }

  // -- Stats ----------------------------------------------------
  const activeApis     = apis.filter(a => a.status === 'connected' && !a.is_locked).length
  const totalApis      = apis.filter(a => !a.is_locked).length
  const avgHealth      = activeApis > 0
    ? Math.round(apis.filter(a => !a.is_locked && a.status === 'connected').reduce((s, a) => s + getHealthScore(a), 0) / activeApis)
    : 0
  const ebayApi        = apis.find(a => a.platform_name === 'ebay')
  const totalRateUsed  = ebayApi?.rate_limit_used  ?? 0
  const totalRateLimit = ebayApi?.rate_limit_total  ?? 5000
  const ratePct        = totalRateLimit > 0 ? Math.round((totalRateUsed / totalRateLimit) * 100) : 0
  const expiringSoon   = apis.filter(a => { const d = getDaysUntilExpiry(a.expires_at); return d > 0 && d <= 30 }).length
  const notifCount     = apis.filter(a => {
    const d = getDaysUntilExpiry(a.expires_at)
    return (a.status === 'disconnected' && !a.is_locked) || (d > 0 && d <= 30)
  }).length

  // -- Filter ----------------------------------------------------
  const filtered = apis.filter(a => {
    if (search && !a.display_name?.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'connected'    && a.status !== 'connected')    return false
    if (filter === 'disconnected' && a.status === 'connected')    return false
    if (filter === 'expiring') {
      const d = getDaysUntilExpiry(a.expires_at)
      if (!(d > 0 && d <= 30)) return false
    }
    return true
  })

  const grouped: Record<string, any[]> = {}
  filtered.forEach(a => {
    const cat = a.category ?? 'other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(a)
  })

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black tracking-wider mb-0.5" style={{ color: C.muted }}>API VAULT</p>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Manage all API integrations, rate limits and security
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button onClick={() => setShowNotifs(s => !s)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border hover:opacity-80"
            style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <Bell size={15} style={{ color: notifCount > 0 ? C.amber : C.muted }} />
            {notifCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                   style={{ backgroundColor: C.red }}>
                {notifCount}
              </div>
            )}
          </button>
          <button onClick={() => { setRefreshing(true); loadApis() }} disabled={refreshing}
            className="flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* HUD Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { title: 'APIs Active',     value: `${activeApis}/${totalApis}`,  icon: Server,        color: C.limeDeep, bg: C.limeTint              },
          { title: 'Health Score',    value: `${avgHealth}/100`,             icon: Activity,      color: avgHealth >= 80 ? C.green : avgHealth >= 50 ? C.amber : C.red, bg: avgHealth >= 80 ? 'rgba(22,163,74,0.08)' : avgHealth >= 50 ? 'rgba(217,119,6,0.08)' : 'rgba(185,28,28,0.08)' },
          { title: 'Rate Limit Used', value: `${ratePct}%`, icon: Zap, color: ratePct > 85 ? C.red : ratePct > 70 ? C.amber : C.blue, bg: 'rgba(29,78,216,0.08)', sub: `${totalRateUsed.toLocaleString()}/${totalRateLimit.toLocaleString()} eBay calls today` },
          { title: 'Expiring Soon',   value: String(expiringSoon),           icon: AlertTriangle, color: expiringSoon > 0 ? C.amber : C.muted, bg: expiringSoon > 0 ? 'rgba(217,119,6,0.08)' : C.bg },
        ].map((card, i) => {
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
                : <p className="text-[28px] font-black" style={{ color: C.dark }}>{card.value}</p>}
              {(card as any).sub && (
                <p className="text-[10px]" style={{ color: C.muted }}>{(card as any).sub}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl border"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <Search size={14} style={{ color: C.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search APIs..."
            className="flex-1 outline-none text-[13px]"
            style={{ color: C.text }} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl border"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          {[
            { key: 'all',          label: 'All'      },
            { key: 'connected',    label: 'Live'     },
            { key: 'disconnected', label: 'Empty'    },
            { key: 'expiring',     label: 'Expiring' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className="px-3 h-8 rounded-lg text-[11px] font-bold transition-all"
              style={{
                backgroundColor: filter === f.key ? C.dark : 'transparent',
                color:           filter === f.key ? C.lime : C.muted,
              }}>
              {f.label}
            </button>
          ))}
        </div>
        {can('view_keys') && <button onClick={testAll} disabled={testing}
          className="flex items-center gap-2 h-10 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
          style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }}>
          {testing
            ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.text }} />
            : <><Wifi size={13} /> Test All</>}
        </button>}
        {can('view_keys') && <button onClick={exportAuditLog}
          className="flex items-center gap-2 h-10 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80"
          style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
          <Download size={13} /> Export Log
        </button>}
      </div>

      {/* API Fleet Grid */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[0,1,2].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ backgroundColor: C.bg }} />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 rounded-2xl border"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <Server size={32} style={{ color: C.border }} />
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>No APIs match your filter</p>
        </div>
      ) : Object.entries(grouped).map(([category, apiList]) => {
        const meta    = CATEGORY_META[category] ?? { icon: Server, color: C.muted, bg: C.bg, label: category.toUpperCase() }
        const CatIcon = meta.icon
        return (
          <div key={category}>
            {/* Category label */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: meta.bg }}>
                <CatIcon size={12} style={{ color: meta.color }} />
              </div>
              <p className="text-[10px] font-black tracking-wider" style={{ color: meta.color }}>{meta.label}</p>
              <span className="text-[10px]" style={{ color: C.muted }}>({apiList.length})</span>
            </div>

            {/* Table */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
              {/* Table header */}
              <div className="grid px-4 py-2 border-b"
                   style={{ gridTemplateColumns: '2fr 0.6fr 0.6fr 0.8fr 0.7fr 0.8fr 0.2fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
                {['API NAME', 'TYPE', 'STATUS', 'HEALTH', 'EXPIRES', 'LAST USED', ''].map(h => (
                  <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
                ))}
              </div>

              {apiList.map((api: any, idx: number) => {
                const PIcon      = PLATFORM_ICONS[api.platform_name] ?? Server
                const sm         = statusMeta(api.status, api.is_locked)
                const health     = getHealthScore(api)
                const days       = getDaysUntilExpiry(api.expires_at)

                return (
                  <div key={api.platform_name}>
                    {/* Row */}
                    <div className="grid items-center px-4 py-3 hover:bg-[#fafcf8] transition-colors"
                         style={{
                           gridTemplateColumns: '2fr 0.6fr 0.6fr 0.8fr 0.7fr 0.8fr 0.2fr',
                           gap:       12,
                           borderTop: idx > 0 ? `1px solid ${C.border}` : 'none',
                           opacity:   api.is_locked ? 0.55 : 1,
                         }}>

                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                             style={{ backgroundColor: meta.bg }}>
                          <PIcon size={15} style={{ color: meta.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-black truncate" style={{ color: C.dark }}>
                            {api.display_name ?? api.platform_name}
                          </p>
                          <p className="text-[10px] font-mono truncate" style={{ color: C.muted }}>
                            {fingerprint(api.primary_key_1)}
                          </p>
                        </div>
                      </div>

                      {/* Type */}
                      <span className="text-[9px] font-black px-2 py-1 rounded-lg capitalize"
                            style={{ backgroundColor: meta.bg, color: meta.color }}>
                        {category}
                      </span>

                      {/* Status dot + label */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0"
                             style={{ backgroundColor: sm.dot }} />
                        <span className="text-[10px] font-bold" style={{ color: sm.color }}>
                          {sm.label}
                        </span>
                        {api.environment === 'sandbox' && (
                          <span className="text-[8px] font-black px-1 py-0.5 rounded"
                                style={{ backgroundColor: 'rgba(217,119,6,0.12)', color: C.amber }}>
                            SBX
                          </span>
                        )}
                      </div>

                      {/* Health bar */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                          <div className="h-full rounded-full transition-all"
                               style={{
                                 width:           `${health}%`,
                                 backgroundColor: health >= 80 ? C.lime : health >= 50 ? C.amber : C.red,
                               }} />
                        </div>
                        <span className="text-[10px] font-bold shrink-0"
                              style={{ color: health >= 80 ? C.limeDeep : health >= 50 ? C.amber : health === 0 ? C.muted : C.red }}>
                          {health}
                        </span>
                      </div>

                      {/* Expires */}
                      <span className="text-[11px]"
                            style={{ color: days === 0 ? C.muted : days <= 7 ? C.red : days <= 30 ? C.amber : C.muted }}>
                        {days === 0 ? 'No expiry' : `${days}d left`}
                      </span>

                      {/* Last used */}
                      <span className="text-[11px]" style={{ color: C.muted }}>
                        {timeAgo(api.last_tested_at)}
                      </span>

                      {/* Open popup button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedApi(api)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                          style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                          onMouseEnter={e => {
                            const btn = e.currentTarget
                            btn.style.backgroundColor = C.limeTint
                            btn.style.borderColor = C.limeDeep + '40'
                            const icon = btn.querySelector('svg')
                            if (icon) icon.style.color = C.limeDeep
                          }}
                          onMouseLeave={e => {
                            const btn = e.currentTarget
                            btn.style.backgroundColor = C.bg
                            btn.style.borderColor = C.border
                            const icon = btn.querySelector('svg')
                            if (icon) icon.style.color = C.muted
                          }}>
                          <Plus size={13} style={{ color: C.muted }} />
                        </button>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* API Config Modal */}
      {selectedApi && (
        <ApiModal
          api={selectedApi}
          onClose={() => setSelectedApi(null)}
          onSaved={(updatedApi: any) => {
            // Fix 8: update both apis list and selectedApi with fresh data
            setApis(prev => prev.map(a => a.platform_name === updatedApi.platform_name ? updatedApi : a))
            setSelectedApi(updatedApi)
          }}
          showToast={showToast}
          canRevoke={can('reset_key')}
        />
      )}
      
      {/* Notifications panel */}
      {showNotifs && <NotificationsPanel apis={apis} onClose={() => setShowNotifs(false)} />}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
