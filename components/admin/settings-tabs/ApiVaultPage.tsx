'use client'
// components/admin/settings-tabs/ApiVaultPage.tsx
// Fixed: saveToVault now auto-sets expires_at to 90 days from save date

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ShoppingCart, ShoppingBag, Brain, Lock,
  RefreshCw, CloudUpload, Wifi, Eye, EyeOff,
  CheckCircle, XCircle, AlertTriangle, Info,
  Bell, X, ExternalLink,
} from 'lucide-react'

const C = {
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  border:    '#E2E8F0',
  navy:      '#0F172A',
  txt1:      '#0F172A',
  txt2:      '#64748B',
  txt3:      '#94A3B8',
  green:     '#00C48C',
  orange:    '#FFB800',
  red:       '#FF4D6A',
  blue:      '#1D70F5',
  accent:    '#8FFF00',
  accentDim: '#E8FFB0',
}

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function ScopeBadge({ name, granted }: { name: string; granted: boolean }) {
  const color  = granted ? C.green   : C.red
  const bg     = granted ? '#F0FDF4' : '#FEF2F2'
  const border = granted ? '#BBF7D0' : '#FECACA'
  const Icon   = granted ? CheckCircle : XCircle
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded border"
         style={{ backgroundColor: bg, borderColor: border }}>
      <Icon size={10} style={{ color }} />
      <span className="text-[10px] font-bold" style={{ color }}>{name}</span>
    </div>
  )
}

function KeyRow({ label1, hint1, label2, hint2, val1, val2, obscure, onToggle, isPrimary, onChange1, onChange2 }: {
  label1: string; hint1: string; label2: string; hint2: string
  val1: string; val2: string; obscure: boolean; onToggle: () => void
  isPrimary: boolean; onChange1: (v: string) => void; onChange2: (v: string) => void
}) {
  return (
    <div className="flex gap-5">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[12px] font-semibold" style={{ color: '#475569' }}>{label1}</p>
          {!isPrimary && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border"
                  style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: C.blue }}>
              STANDBY
            </span>
          )}
        </div>
        <input value={val1} onChange={e => onChange1(e.target.value)} placeholder={hint1}
          className="w-full h-10 px-3 rounded-md border text-[13px] outline-none"
          style={{ backgroundColor: '#fff', borderColor: C.border, color: C.txt1 }} />
      </div>
      <div className="flex-1">
        <p className="text-[12px] font-semibold mb-2" style={{ color: '#475569' }}>{label2}</p>
        <div className="relative">
          <input value={val2} onChange={e => onChange2(e.target.value)} placeholder={hint2}
            type={obscure ? 'password' : 'text'}
            className="w-full h-10 px-3 pr-10 rounded-md border text-[13px] outline-none"
            style={{ backgroundColor: '#fff', borderColor: C.border, color: C.txt1 }} />
          <button onClick={onToggle} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {obscure ? <EyeOff size={15} style={{ color: C.txt3 }} /> : <Eye size={15} style={{ color: C.txt3 }} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function LockedPanel({ platform }: { platform: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border"
         style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <Lock size={56} style={{ color: C.txt3 }} />
      <p className="text-[18px] font-bold mt-4 mb-2" style={{ color: C.txt2 }}>
        {platform.toUpperCase()} Integration
      </p>
      <p className="text-[13px]" style={{ color: C.txt3 }}>
        Coming soon — keys can be added when integration is ready.
      </p>
    </div>
  )
}

function NotificationsModal({ notifications, onClose, onMarkRead }: {
  notifications: any[]; onClose: () => void; onMarkRead: () => void
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border p-6 w-full max-w-[500px]" style={{ borderColor: C.border }}>
        <h3 className="text-[18px] font-bold mb-4" style={{ color: C.txt1 }}>API Notifications</h3>
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto mb-4">
          {notifications.map((n, i) => {
            const p     = n.priority ?? 1
            const color = p >= 4 ? C.red : p >= 3 ? C.orange : C.blue
            return (
              <div key={i} className="p-3.5 rounded-xl border"
                   style={{ backgroundColor: color+'14', borderColor: color+'4D' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={13} style={{ color }} />
                  <p className="text-[13px] font-bold" style={{ color }}>{n.title}</p>
                </div>
                <p className="text-[12px]" style={{ color: C.txt2 }}>{n.message}</p>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onMarkRead}
            className="px-4 py-2 text-[13px] font-semibold" style={{ color: C.txt2 }}>
            Mark All Read
          </button>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-bold text-white"
            style={{ backgroundColor: C.navy }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function EbayConfigPanel({ onRefresh }: { onRefresh: () => void }) {
  const supabase = createClient()

  const [appId,      setAppId]      = useState('')
  const [certId,     setCertId]     = useState('')
  const [backupApp,  setBackupApp]  = useState('')
  const [backupCert, setBackupCert] = useState('')

  const [obscureCert,       setObscureCert]       = useState(true)
  const [obscureBackupCert, setObscureBackupCert] = useState(true)
  const [isSaving,          setIsSaving]          = useState(false)
  const [isTesting,         setIsTesting]         = useState(false)
  const [isLoading,         setIsLoading]         = useState(true)
  const [saveSuccess,       setSaveSuccess]        = useState(false)

  const [status,          setStatus]          = useState('disconnected')
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(0)
  const [rateLimitUsed,   setRateLimitUsed]   = useState(0)
  const [rateLimitTotal,  setRateLimitTotal]  = useState(5000)
  const [requestsToday,   setRequestsToday]   = useState(0)
  const [healthScore,     setHealthScore]     = useState(0)
  const [lastTested,      setLastTested]      = useState<Date | null>(null)
  const [scopes,          setScopes]          = useState<any[]>([])

  const [lastTestSuccess, setLastTestSuccess] = useState<boolean | null>(null)
  const [lastTestMs,      setLastTestMs]      = useState<number | null>(null)
  const [lastTestError,   setLastTestError]   = useState<string | null>(null)

  useEffect(() => { loadFromDatabase() }, [])

  async function loadFromDatabase() {
    setIsLoading(true)
    try {
      const { data: rawData } = await supabase.from('api_fleet_config')
        .select('*').eq('platform_name', 'ebay').single()
      const data = rawData as any
      if (!data) { setIsLoading(false); return }

      const safe = (v: any) => { const s = (v ?? '').toString().trim(); return s === 'EMPTY' ? '' : s }

      setAppId(safe(data.primary_key_1))
      setCertId(safe(data.primary_key_2))
      setBackupApp(safe(data.backup_key_1))
      setBackupCert(safe(data.backup_key_2))

      const st   = (data.status ?? 'disconnected').toString()
      const used = (data.rate_limit_used  ?? 0) as number
      const tot  = (data.rate_limit_total ?? 5000) as number
      setStatus(st); setRateLimitUsed(used); setRateLimitTotal(tot)
      setRequestsToday(data.requests_today ?? 0)

      let days = 0
      if (data.expires_at) {
        const exp = new Date(data.expires_at)
        days = Math.ceil((exp.getTime() - Date.now()) / 86400000)
      }
      setDaysUntilExpiry(days)

      if (data.last_tested_at) setLastTested(new Date(data.last_tested_at))
      if (Array.isArray(data.scopes)) setScopes(data.scopes)

      const pct = tot > 0 ? Math.round(used / tot * 100) : 0
      let hs = 30
      if      (st === 'expired')          hs = 0
      else if (st === 'error')            hs = 25
      else if (pct > 95)                  hs = 40
      else if (pct > 85)                  hs = 60
      else if (days > 0 && days <= 7)     hs = 50
      else if (days > 7 && days <= 30)    hs = 75
      else if (st === 'connected')        hs = 100
      setHealthScore(hs)
    } catch (e) { console.error('Load error:', e) }
    setIsLoading(false)
  }

  async function saveToVault() {
    if (!appId.trim())  { alert('⚠️ Primary App ID is required');  return }
    if (!certId.trim()) { alert('⚠️ Primary Cert ID is required'); return }
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // ✅ FIX: auto-set expires_at to 90 days from now on every save
      const newExpiresAt = new Date(Date.now() + 90 * 86400000).toISOString()

      await (supabase.from('api_fleet_config') as any).update({
        primary_key_1: appId.trim(),
        primary_key_2: certId.trim(),
        backup_key_1:  backupApp.trim()  || 'EMPTY',
        backup_key_2:  backupCert.trim() || 'EMPTY',
        updated_at:    new Date().toISOString(),
        status:        'connected',
        expires_at:    newExpiresAt,   // ✅ FIXED: was missing before
      }).eq('platform_name', 'ebay')

      if (user && appId.trim().length >= 8) {
        try {
          await (supabase.from('api_key_history') as any).insert({
            user_id:         user.id,
            platform_name:   'ebay',
            action:          'updated',
            key_fingerprint: appId.trim().substring(0, 8),
            key_type:        'primary',
            changed_by:      user.email ?? 'admin',
            notes:           `Keys updated via API Vault — expires ${new Date(newExpiresAt).toLocaleDateString()}`,
          })
        } catch {}
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
      await loadFromDatabase()
      onRefresh()
    } catch (e) { console.error('Save error:', e) }
    setIsSaving(false)
  }

  async function testConnection() {
    if (!appId.trim() || !certId.trim()) {
      alert('⚠️ Enter your keys and Save to Vault first'); return
    }
    setIsTesting(true)
    setLastTestSuccess(null); setLastTestError(null); setLastTestMs(null)
    const start = Date.now()
    const { data: { user } } = await supabase.auth.getUser()
    try {
      const result = await supabase.functions.invoke('ebay-proxy', {
        body: { appId: appId.trim(), devId: backupApp.trim(), certId: certId.trim(), testMode: true }
      })
      const ms      = Date.now() - start
      const d       = result.data as any ?? {}
      const success = d.success === true
      const resTime = d.responseTime ?? ms

      setLastTestSuccess(success)
      setLastTestMs(resTime)
      setLastTestError(d.errorMessage ?? null)

      if (user) {
        try {
          await (supabase.from('api_test_results') as any).insert({
            user_id: user.id, platform_name: 'ebay', test_type: 'manual',
            success, response_time_ms: resTime, key_used: 'primary',
            ...(!success && d.errorMessage ? { error_message: d.errorMessage } : {}),
          })
        } catch {}
      }

      await (supabase.from('api_fleet_config') as any).update({
        status: success ? 'connected' : 'error',
        last_tested_at: new Date().toISOString(),
      }).eq('platform_name', 'ebay')

      await loadFromDatabase(); onRefresh()
    } catch (e: any) {
      const ms  = Date.now() - start
      const msg = e.toString()
      setLastTestSuccess(false); setLastTestMs(ms); setLastTestError(msg)
      if (user) {
        try {
          await (supabase.from('api_test_results') as any).insert({
            user_id: user.id, platform_name: 'ebay', test_type: 'manual',
            success: false, error_message: msg, key_used: 'primary',
          })
        } catch {}
      }
    }
    setIsTesting(false)
  }

  const lastTestedText = (() => {
    if (!lastTested) return 'Never tested'
    const d = Date.now() - lastTested.getTime()
    if (d < 60000)    return 'Just now'
    if (d < 3600000)  return `${Math.floor(d/60000)} mins ago`
    if (d < 86400000) return `${Math.floor(d/3600000)} hours ago`
    return `${Math.floor(d/86400000)} days ago`
  })()

  const hColor   = healthScore >= 80 ? C.green : healthScore >= 50 ? C.orange : C.red
  const usagePct = rateLimitTotal > 0 ? Math.min(rateLimitUsed/rateLimitTotal, 1) : 0
  const barColor = usagePct > 0.85 ? C.red : usagePct > 0.70 ? C.orange : C.green

  const defaultScopes = [
    { name: 'Read Catalog',    granted: true  },
    { name: 'Search Items',    granted: true  },
    { name: 'Create Listings', granted: false },
    { name: 'Issue Refunds',   granted: false },
  ]

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 rounded-2xl border"
         style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.navy }} />
    </div>
  )

  return (
    <div className="rounded-2xl border overflow-hidden"
         style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>

      <div className="p-6">
        {/* Title + health score */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
              <ShoppingCart size={19} style={{ color: C.txt1 }} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[16px] font-bold" style={{ color: C.txt1 }}>eBay Developer Config</p>
                <a href="https://developer.ebay.com/docs" target="_blank" rel="noreferrer"
                   className="flex items-center gap-1 text-[11px]"
                   style={{ color: C.blue, textDecoration: 'underline' }}>
                  <ExternalLink size={11} /> developer.ebay.com/docs
                </a>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[12px]" style={{ color: C.txt2 }}>
                  Live market data, catalog searches, and VeRO validation.
                </p>
                <RefreshCw size={11} style={{ color: C.txt3 }} />
                <p className="text-[11px] italic" style={{ color: C.txt3 }}>Last ping: {lastTestedText}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border shrink-0"
               style={{ backgroundColor: hColor+'1A', borderColor: hColor+'4D' }}>
            {healthScore >= 80
              ? <CheckCircle size={17} style={{ color: hColor }} />
              : <AlertTriangle size={17} style={{ color: hColor }} />}
            <div>
              <p className="text-[10px] font-bold" style={{ color: C.txt2 }}>Health Score</p>
              <p className="text-[16px] font-bold" style={{ color: hColor }}>{healthScore}/100</p>
            </div>
          </div>
        </div>

        {/* ✅ Expiry info — shows 90 days remaining after save */}
        {daysUntilExpiry > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-5"
               style={{
                 backgroundColor: daysUntilExpiry < 7  ? '#FEF2F2'
                                : daysUntilExpiry < 30 ? '#FFFBEB'
                                : '#F0FDF4',
                 borderColor:     daysUntilExpiry < 7  ? 'rgba(255,77,106,0.4)'
                                : daysUntilExpiry < 30 ? 'rgba(255,184,0,0.4)'
                                : 'rgba(0,196,140,0.3)',
               }}>
            {daysUntilExpiry >= 30
              ? <CheckCircle size={17} style={{ color: C.green }} />
              : <AlertTriangle size={17} style={{ color: daysUntilExpiry < 7 ? C.red : C.orange }} />}
            <p className="text-[12px] font-bold flex-1"
               style={{ color: daysUntilExpiry < 7 ? '#991B1B' : daysUntilExpiry < 30 ? '#92400E' : '#166534' }}>
              {daysUntilExpiry >= 30
                ? `✅ Keys valid for ${daysUntilExpiry} more days (auto-set on save)`
                : daysUntilExpiry < 7
                ? `🚨 URGENT: Keys expire in ${daysUntilExpiry} days! Save keys again to renew.`
                : `Action Required: Keys expire in ${daysUntilExpiry} days. Save to renew.`}
            </p>
          </div>
        )}

        {/* Save success banner */}
        {saveSuccess && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border mb-5"
               style={{ backgroundColor: C.green+'14', borderColor: C.green+'4D' }}>
            <CheckCircle size={15} style={{ color: C.green }} />
            <p className="flex-1 text-[12px] font-semibold" style={{ color: C.green }}>
              ✅ Keys saved! Expiry reset to 90 days from today.
            </p>
          </div>
        )}

        {/* Last test result */}
        {lastTestSuccess !== null && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border mb-5"
               style={{
                 backgroundColor: (lastTestSuccess ? C.green : C.red)+'14',
                 borderColor:     (lastTestSuccess ? C.green : C.red)+'4D',
               }}>
            {lastTestSuccess
              ? <CheckCircle size={15} style={{ color: C.green }} />
              : <XCircle     size={15} style={{ color: C.red   }} />}
            <p className="flex-1 text-[12px] font-semibold"
               style={{ color: lastTestSuccess ? C.green : C.red }}>
              {lastTestSuccess
                ? `✅ Connection successful — response in ${lastTestMs}ms`
                : `❌ ${lastTestError ?? 'Connection failed'}`}
            </p>
            <button onClick={() => setLastTestSuccess(null)}>
              <X size={13} style={{ color: C.txt3 }} />
            </button>
          </div>
        )}

        {/* Rate limit + scopes */}
        <div className="flex gap-10">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-bold" style={{ color: C.txt1 }}>Daily Rate Limit</p>
              <p className="text-[12px] font-bold" style={{ color: C.txt2 }}>{rateLimitUsed} / {rateLimitTotal} reqs</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: '#F1F5F9' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${usagePct*100}%`, backgroundColor: barColor }} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px]" style={{ color: C.txt3 }}>{Math.round(usagePct*100)}% used</p>
              <p className="text-[10px]" style={{ color: C.txt3 }}>{requestsToday} requests today</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold mb-2" style={{ color: C.txt1 }}>Active Scopes</p>
            <div className="flex flex-wrap gap-2">
              {(scopes.length > 0 ? scopes : defaultScopes).map((s: any, i: number) => (
                <ScopeBadge key={i} name={s.name} granted={s.granted} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px" style={{ backgroundColor: C.border }} />

      <div className="p-6" style={{ backgroundColor: C.bg }}>
        <div className="flex flex-col gap-5">
          <KeyRow
            label1="Primary App ID"  hint1="e.g. ReazifyL-SellerPu-PRD-..."
            label2="Primary Cert ID" hint2="e.g. PRD-f605e695..."
            val1={appId}   onChange1={setAppId}
            val2={certId}  onChange2={setCertId}
            obscure={obscureCert} onToggle={() => setObscureCert(s => !s)}
            isPrimary={true}
          />
          <KeyRow
            label1="Fallback App ID"  hint1="Paste Fallback App ID..."
            label2="Fallback Cert ID" hint2="Paste Fallback Cert ID..."
            val1={backupApp}   onChange1={setBackupApp}
            val2={backupCert}  onChange2={setBackupCert}
            obscure={obscureBackupCert} onToggle={() => setObscureBackupCert(s => !s)}
            isPrimary={false}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button onClick={saveToVault} disabled={isSaving}
              className="flex items-center gap-2 h-11 px-5 rounded-lg text-[13px] font-bold text-white"
              style={{ backgroundColor: C.navy }}>
              {isSaving
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                : <CloudUpload size={17} />}
              {isSaving ? 'Saving...' : 'Save to Vault'}
            </button>
            <button onClick={testConnection} disabled={isTesting}
              className="flex items-center gap-2 h-11 px-5 rounded-lg border text-[13px] font-bold"
              style={{ borderColor: C.border, color: C.txt1, backgroundColor: '#fff' }}>
              {isTesting
                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.txt1 }} />
                : <Wifi size={15} style={{ color: C.txt1 }} />}
              {isTesting ? 'Testing...' : 'Test eBay Connection'}
            </button>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg border"
               style={{ backgroundColor: C.accentDim, borderColor: 'rgba(143,255,0,0.4)' }}>
            <Info size={13} style={{ color: C.navy, marginTop: 1 }} />
            <p className="text-[11px]" style={{ color: C.navy }}>
              Saving keys auto-resets expiry to 90 days. Test uses Supabase Edge Function "ebay-proxy" to bypass CORS.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ApiVaultPage(_props: Props) {
  const supabase = createClient()

  const [selectedPlatform,    setSelectedPlatform]    = useState('ebay')
  const [isProductionMode,    setIsProductionMode]    = useState(true)
  const [notifications,       setNotifications]       = useState<any[]>([])
  const [activeNotifications, setActiveNotifications] = useState(0)
  const [showNotifications,   setShowNotifications]   = useState(false)

  useEffect(() => { loadNotifications() }, [])

  async function loadNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('api_notifications').select('*')
        .eq('user_id', user.id).eq('is_read', false).eq('is_dismissed', false)
        .order('priority', { ascending: false }).limit(10)
      const n = (data ?? []) as any[]
      setNotifications(n); setActiveNotifications(n.length)
    } catch {}
  }

  async function markAllRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await (supabase.from('api_notifications') as any)
        .update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
      await loadNotifications()
    } catch {}
    setShowNotifications(false)
  }

  const TABS = [
    { id: 'ebay',       name: 'eBay Network',  icon: ShoppingCart, locked: false },
    { id: 'aliexpress', name: 'AliExpress',    icon: ShoppingBag,  locked: true  },
    { id: 'openai',     name: 'OpenAI Engine', icon: Brain,        locked: true  },
    { id: 'amazon',     name: 'Amazon SP-API', icon: Lock,         locked: true  },
  ]

  const critical = notifications.filter(n => (n.priority ?? 0) >= 4).length
  const isCrit   = critical > 0

  return (
    <div className="flex flex-col gap-6" style={{ backgroundColor: C.bg }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: C.txt1 }}>
              Global API Command Center
            </h2>
            {activeNotifications > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl" style={{ backgroundColor: C.red }}>
                <Bell size={11} style={{ color: '#fff' }} />
                <span className="text-[11px] font-bold text-white">{activeNotifications}</span>
              </div>
            )}
          </div>
          <p className="text-[14px]" style={{ color: C.txt2 }}>
            Manage rate limits, failovers, and security scopes.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: isProductionMode ? C.green : C.orange }} />
          <div>
            <p className="text-[10px] font-bold" style={{ color: C.txt2 }}>Global Routing</p>
            <p className="text-[12px] font-bold" style={{ color: isProductionMode ? C.green : C.orange }}>
              {isProductionMode ? 'PRODUCTION MODE' : 'SANDBOX MODE'}
            </p>
          </div>
          <div onClick={() => setIsProductionMode(s => !s)}
               className="relative w-11 h-6 rounded-full cursor-pointer transition-colors ml-2"
               style={{ backgroundColor: isProductionMode ? C.green : C.orange }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                 style={{ left: isProductionMode ? '22px' : '2px' }} />
          </div>
        </div>
      </div>

      {activeNotifications > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
             style={{ backgroundColor: isCrit ? '#FEF2F2' : '#FFFBEB', borderColor: isCrit ? '#FECACA' : '#FDE68A' }}>
          {isCrit
            ? <XCircle size={21} style={{ color: '#DC2626' }} />
            : <AlertTriangle size={21} style={{ color: C.orange }} />}
          <div className="flex-1">
            <p className="text-[13px] font-bold" style={{ color: isCrit ? '#991B1B' : '#92400E' }}>
              {activeNotifications} Active Alert{activeNotifications > 1 ? 's' : ''}
            </p>
            <p className="text-[12px]" style={{ color: isCrit ? '#B91C1C' : '#B45309' }}>
              {isCrit ? `${critical} critical issue${critical > 1 ? 's' : ''} require immediate attention` : 'Review your API configuration'}
            </p>
          </div>
          <button onClick={() => setShowNotifications(true)}
            className="text-[13px] font-bold" style={{ color: isCrit ? '#DC2626' : C.orange }}>
            View All
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {TABS.map(t => {
          const Icon       = t.icon
          const isSelected = selectedPlatform === t.id
          return (
            <button key={t.id}
              onClick={t.locked ? undefined : () => setSelectedPlatform(t.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border text-[13px] font-bold transition-all"
              style={{
                backgroundColor: isSelected ? C.navy : C.surface,
                borderColor:     isSelected ? C.navy : C.border,
                cursor:          t.locked ? 'default' : 'pointer',
                opacity:         t.locked ? 0.7 : 1,
              }}>
              <Icon size={15} style={{ color: isSelected ? '#fff' : C.txt2 }} />
              <span style={{ color: isSelected ? '#fff' : C.txt2 }}>{t.name}</span>
              {t.locked && <Lock size={11} style={{ color: isSelected ? 'rgba(255,255,255,0.5)' : C.txt3 }} />}
            </button>
          )
        })}
      </div>

      {selectedPlatform === 'ebay'
        ? <EbayConfigPanel onRefresh={loadNotifications} />
        : <LockedPanel platform={selectedPlatform} />}

      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={markAllRead}
        />
      )}
    </div>
  )
}