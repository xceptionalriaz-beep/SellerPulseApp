'use client'
// components/admin/settings-tabs/FounderOpsTab.tsx

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  CheckSquare, Square, RefreshCw, ExternalLink,
  TrendingUp, Users, Ticket, Zap, Shield, Mail,
  AlertTriangle, CheckCircle, XCircle, Clock,
  DollarSign, Activity, Database, Globe,
  Webhook, ToggleLeft, ToggleRight, ArrowRight,
} from 'lucide-react'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#0a0d08',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  red:      '#b91c1c',
  amber:    '#d97706',
  green:    '#16a34a',
  blue:     '#1d4ed8',
}

interface Props { isInvestorMode?: boolean; isMobile?: boolean; onNavigate?: (tab: number) => void }

// â”€â”€ Vital Sign Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function VitalCard({ label, value, sub, icon: Icon, color, onClick }: {
  label: string; value: string; sub: string
  icon: React.ElementType; color: string; onClick?: () => void
}) {
  return (
    <div onClick={onClick}
         className="flex items-center gap-3 p-4 rounded-2xl border transition-all"
         style={{
           backgroundColor: C.surface, borderColor: C.border,
           cursor: onClick ? 'pointer' : 'default',
         }}
         onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.borderColor = C.lime }}
         onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style={{ backgroundColor: color + '18' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold tracking-wider" style={{ color: C.muted }}>{label}</p>
        <p className="text-[20px] font-extrabold leading-tight" style={{ color: C.text }}>{value}</p>
        <p className="text-[10px]" style={{ color: C.muted }}>{sub}</p>
      </div>
      {onClick && <ArrowRight size={14} style={{ color: C.muted, flexShrink: 0 }} />}
    </div>
  )
}

// â”€â”€ Section header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: C.lime }} />
      <div>
        <p className="text-[13px] font-black tracking-wide" style={{ color: C.text }}>{title}</p>
        <p className="text-[11px]" style={{ color: C.muted }}>{sub}</p>
      </div>
    </div>
  )
}

export default function FounderOpsTab({ onNavigate }: Props) {
  const { can } = useTabPermissions('founder_ops')
  const supabase = createClient()

  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [checklist,      setChecklist]      = useState<any[]>([])
  const [toggling,       setToggling]       = useState<string | null>(null)
  const [vitals,         setVitals]         = useState({
    mrr: 0, activeUsers: 0, openTickets: 0, highPriorityTickets: 0,
    apiHealth: 0, connectedApis: 0, emailQueuePending: 0,
    failedPayments: 0, emptyAffiliates: 0, blockedIps: 0,
    activeKillSwitches: 0, openDisputes: 0,
    dbPercent: 0, dbPretty: '0 MB', securityAlerts24h: 0,
  })
  const [loading,        setLoading]        = useState(true)
  const [refreshing,     setRefreshing]     = useState(false)
  const [lastSync,       setLastSync]       = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [togglingMaint,   setTogglingMaint]   = useState(false)

  // â”€â”€ Load all data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadAll = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadChecklist(), loadVitals(), loadMaintenanceStatus()])
      setLastSync(new Date().toLocaleTimeString())
    } catch (e) { console.error('[FounderOps]', e) }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function loadMaintenanceStatus() {
    try {
      const { data } = await (supabase.from('system_status') as any)
        .select('status')
        .limit(1)
        .single()
      if (data) setMaintenanceMode(data.status === 'maintenance')
    } catch { /* no system_status row yet */ }
  }

  async function loadChecklist() {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const { data } = await (supabase.from('founder_checklist') as any)
      .select('*')
      .gte('week_start', weekStart.toISOString().slice(0, 10))
      .order('sort_order', { ascending: true })

    if (data && data.length > 0) {
      setChecklist(data)
    } else {
      // Auto-seed for new week
      const tasks = [
        'Check LemonSqueezy webhook synchronization logs',
        'Review failed payments ledger and trigger manual retries',
        'Audit Affiliate Vault tracking IDs for empty tags',
        'Monitor active server response times and database storage limits',
        'Clear processed items from the outbound email queue',
        'Resolve all open high-priority customer support tickets',
      ]
      const inserts = tasks.map((task, i) => ({
        task, sort_order: i + 1, done: false,
        week_start: weekStart.toISOString().slice(0, 10),
      }))
      const { data: newData } = await (supabase.from('founder_checklist') as any)
        .insert(inserts).select()
      setChecklist(newData ?? [])
    }
  }

  async function loadVitals() {
    const [
      { data: txns },
      { data: profiles },
      { data: tickets },
      { data: apiConfigs },
      { data: emailQueue },
      { data: affiliates },
      { data: blockedIps },
      { data: killSwitches },
      { data: securityLogs },
    ] = await Promise.all([
      (supabase.from('transactions') as any).select('amount, status'),
      supabase.from('profiles').select('subscription_status, last_seen'),
      (supabase.from('tickets') as any).select('status, priority'),
      supabase.from('api_fleet_config').select('status, platform_name'),
      (supabase.from('email_queue') as any).select('status').eq('status', 'pending'),
      (supabase.from('api_fleet_config') as any).select('primary_key_1').like('platform_name', '%affiliate%'),
      (supabase.from('blocked_ips') as any).select('id'),
      (supabase.from('kill_switches') as any).select('is_active').eq('is_active', true),
      (supabase.from('security_logs') as any).select('id').gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    ])

    const mrr = (txns ?? [])
      .filter((t: any) => t.status === 'paid' || t.status === 'active')
      .reduce((s: number, t: any) => s + parseFloat(t.amount ?? 0), 0)

    const now = new Date()
    const activeUsers = (profiles ?? []).filter((p: any) => {
      if (!p.last_seen) return false
      return (now.getTime() - new Date(p.last_seen).getTime()) < 5 * 60 * 1000
    }).length

    const openTickets = (tickets ?? []).filter((t: any) =>
      t.status === 'open' || t.status === 'in_progress').length
    const highPriorityTickets = (tickets ?? []).filter((t: any) =>
      (t.status === 'open' || t.status === 'in_progress') && t.priority === 'high').length

    const failedPayments = (txns ?? []).filter((t: any) =>
      t.status === 'failed' || t.status === 'payment_failed').length

    const connectedApis = (apiConfigs ?? []).filter((a: any) =>
      a.status === 'connected' && !a.platform_name.includes('affiliate')).length

    const TOTAL_AFFILIATE_NETWORKS = 14
    const connectedAffiliates = (affiliates ?? []).filter((a: any) =>
      a.primary_key_1 && a.primary_key_1 !== 'EMPTY' && a.primary_key_1.trim().length > 0).length
    const emptyAffiliates = TOTAL_AFFILIATE_NETWORKS - connectedAffiliates

    // Fetch metrics for DB size
    try {
      const res = await fetch('/api/admin/metrics')
      if (res.ok) {
        const m = await res.json()
        setVitals(v => ({ ...v, dbPercent: Math.round(m.db_percent * 100), dbPretty: m.db_size_pretty }))
      }
    } catch {}

    setVitals(v => ({
      ...v, mrr, activeUsers, openTickets, highPriorityTickets,
      connectedApis, emailQueuePending: (emailQueue ?? []).length,
      failedPayments, emptyAffiliates,
      blockedIps: (blockedIps ?? []).length,
      activeKillSwitches: (killSwitches ?? []).length,
      securityAlerts24h: (securityLogs ?? []).length,
    }))
  }

  async function toggleMaintenanceMode() {
    setTogglingMaint(true)
    try {
      const newVal = !maintenanceMode
      const { data: existing } = await (supabase.from('system_status') as any)
        .select('id').limit(1).single()
      if (existing?.id) {
        await (supabase.from('system_status') as any).update({
          status:     newVal ? 'maintenance' : 'operational',
          message:    newVal ? 'System is undergoing scheduled maintenance.' : 'All systems are fully operational.',
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id)
      }
      setMaintenanceMode(newVal)
    } catch (e) { console.error('[FounderOps] Maintenance toggle error:', e) }
    setTogglingMaint(false)
  }

  async function toggleTask(id: string, done: boolean) {
    setToggling(id)
    await (supabase.from('founder_checklist') as any)
      .update({ done: !done, done_at: !done ? new Date().toISOString() : null })
      .eq('id', id)
    setChecklist(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t))
    setToggling(null)
  }

  const completed = checklist.filter(t => t.done).length
  const progress  = checklist.length > 0 ? completed / checklist.length : 0

  // â”€â”€ Quick Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const QUICK_ACTIONS = [
    { label: 'User CRM',       icon: Users,      tab: 0,  color: C.blue    },
    { label: 'Affiliate Vault',icon: Globe,      tab: 10, color: C.limeDeep},
    { label: 'Payments',       icon: DollarSign, tab: 13, color: C.green   },
    { label: 'Tickets',        icon: Ticket,     tab: 14, color: C.amber   },
  ]

  if (loading) return (
    <div className="flex flex-col gap-4 p-8">
      {[1,2,3].map(i => (
        <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: C.border }} />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 px-6 py-6" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-black tracking-tight" style={{ color: C.text }}>
            Founder Control Center
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: C.muted }}>
            Riazify LLC â€” Executive Operations Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSync && (
            <span className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}` }}>
              Synced {lastSync}
            </span>
          )}
          <button onClick={loadAll} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:opacity-70 transition-all"
            style={{ backgroundColor: C.surface, borderColor: C.border, color: C.muted, fontSize: 12, fontWeight: 600 }}>
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* â”€â”€ Section 1: Business Vital Signs â”€â”€ */}
      <div>
        <SectionHeader title="BUSINESS VITAL SIGNS" sub="Real-time from database" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <VitalCard label="MRR" value={`$${vitals.mrr.toLocaleString()}`}
            sub="from transactions" icon={DollarSign} color={C.green}
            onClick={() => onNavigate?.(13)} />
          <VitalCard label="ONLINE NOW" value={String(vitals.activeUsers)}
            sub="active in last 5min" icon={Users} color={C.blue}
            onClick={() => onNavigate?.(0)} />
          <VitalCard label="OPEN TICKETS" value={String(vitals.openTickets)}
            sub={`${vitals.highPriorityTickets} high priority`} icon={Ticket}
            color={vitals.highPriorityTickets > 0 ? C.red : C.amber}
            onClick={() => onNavigate?.(14)} />
          <VitalCard label="CONNECTED APIs" value={String(vitals.connectedApis)}
            sub="platforms active" icon={Zap} color={C.lime}
            onClick={() => onNavigate?.(9)} />
        </div>
      </div>

      {/* â”€â”€ Section 2: Weekly Checklist â”€â”€ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="WEEKLY REVENUE PULSE" sub={`${completed} of ${checklist.length} complete`} />
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                <div className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${progress * 100}%`, backgroundColor: C.lime }} />
              </div>
              <span className="text-[11px] font-bold" style={{ color: C.limeDeep }}>
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {checklist.map((item) => (
              <button key={item.id}
                onClick={() => toggleTask(item.id, item.done)}
                disabled={toggling === item.id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all hover:opacity-80"
                style={{ backgroundColor: item.done ? 'rgba(143,255,0,0.06)' : 'transparent' }}>
                {toggling === item.id ? (
                  <RefreshCw size={16} className="animate-spin shrink-0" style={{ color: C.muted }} />
                ) : item.done ? (
                  <CheckSquare size={16} style={{ color: C.limeDeep, flexShrink: 0 }} />
                ) : (
                  <Square size={16} style={{ color: C.muted, flexShrink: 0 }} />
                )}
                <span className="text-[13px] font-semibold"
                      style={{ color: item.done ? C.muted : C.text,
                               textDecoration: item.done ? 'line-through' : 'none' }}>
                  {item.task}
                </span>
                {item.done && item.done_at && (
                  <span className="ml-auto text-[10px] shrink-0" style={{ color: C.muted }}>
                    {new Date(item.done_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* â”€â”€ Quick Actions â”€â”€ */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <SectionHeader title="QUICK ACTIONS" sub="Jump to key sections" />
          <div className="flex flex-col gap-2">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i}
                onClick={() => onNavigate?.(action.tab)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:opacity-80"
                style={{ backgroundColor: action.color + '0F', borderColor: action.color + '33' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                     style={{ backgroundColor: action.color + '20' }}>
                  <action.icon size={15} style={{ color: action.color }} />
                </div>
                <span className="flex-1 text-[13px] font-bold" style={{ color: C.text }}>
                  {action.label}
                </span>
                <ArrowRight size={13} style={{ color: C.muted }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Section 3: Revenue Health â”€â”€ */}
      <div>
        <SectionHeader title="REVENUE HEALTH" sub="Payments and billing status" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[10px] font-bold tracking-wider mb-1" style={{ color: C.muted }}>FAILED PAYMENTS</p>
            <p className="text-[24px] font-extrabold" style={{ color: vitals.failedPayments > 0 ? C.red : C.green }}>
              {vitals.failedPayments}
            </p>
            <p className="text-[10px] mt-1" style={{ color: C.muted }}>
              {vitals.failedPayments > 0 ? 'Needs attention' : 'All clear'}
            </p>
          </div>
          <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[10px] font-bold tracking-wider mb-1" style={{ color: C.muted }}>EMAIL QUEUE</p>
            <p className="text-[24px] font-extrabold" style={{ color: vitals.emailQueuePending > 0 ? C.amber : C.green }}>
              {vitals.emailQueuePending}
            </p>
            <p className="text-[10px] mt-1" style={{ color: C.muted }}>pending emails</p>
          </div>
          <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[10px] font-bold tracking-wider mb-1" style={{ color: C.muted }}>EMPTY AFFILIATES</p>
            <p className="text-[24px] font-extrabold" style={{ color: vitals.emptyAffiliates > 0 ? C.amber : C.green }}>
              {vitals.emptyAffiliates}
            </p>
            <p className="text-[10px] mt-1" style={{ color: C.muted }}>missing tracking IDs</p>
          </div>
          <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[10px] font-bold tracking-wider mb-1" style={{ color: C.muted }}>KILL SWITCHES</p>
            <p className="text-[24px] font-extrabold" style={{ color: vitals.activeKillSwitches > 0 ? C.red : C.green }}>
              {vitals.activeKillSwitches}
            </p>
            <p className="text-[10px] mt-1" style={{ color: C.muted }}>
              {vitals.activeKillSwitches > 0 ? 'Features disabled' : 'All features on'}
            </p>
          </div>
        </div>
      </div>

      {/* â”€â”€ Section 4: Security Pulse â”€â”€ */}
      <div>
        <SectionHeader title="SECURITY PULSE" sub="Threats and access control" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <Shield size={20} style={{ color: vitals.blockedIps > 0 ? C.red : C.green }} />
            <div>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: C.muted }}>BLOCKED IPs</p>
              <p className="text-[20px] font-extrabold" style={{ color: C.text }}>{vitals.blockedIps}</p>
              <p className="text-[10px]" style={{ color: C.muted }}>
                {vitals.blockedIps > 0 ? 'IPs blocked' : 'No blocked IPs'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <Activity size={20} style={{ color: C.blue }} />
            <div>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: C.muted }}>DB STORAGE</p>
              <p className="text-[20px] font-extrabold" style={{ color: C.text }}>{vitals.dbPercent}%</p>
              <p className="text-[10px]" style={{ color: C.muted }}>{vitals.dbPretty} / 500 MB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <Shield size={20} style={{ color: vitals.securityAlerts24h > 0 ? C.red : C.green }} />
            <div>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: C.muted }}>SECURITY ALERTS 24H</p>
              <p className="text-[20px] font-extrabold"
                 style={{ color: vitals.securityAlerts24h > 0 ? C.red : C.green }}>
                {vitals.securityAlerts24h}
              </p>
              <p className="text-[10px]" style={{ color: C.muted }}>
                {vitals.securityAlerts24h > 0 ? 'Review security logs' : 'No threats detected'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Section 5: Deployment Shield â”€â”€ */}
      <div className="flex items-center gap-4 p-5 rounded-2xl flex-wrap"
           style={{
             backgroundColor: C.dark,
             border: `1px solid ${maintenanceMode ? 'rgba(217,119,6,0.4)' : 'rgba(143,255,0,0.2)'}`,
           }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             style={{ backgroundColor: maintenanceMode ? 'rgba(217,119,6,0.15)' : 'rgba(143,255,0,0.1)' }}>
          <Shield size={20} style={{ color: maintenanceMode ? C.amber : C.lime }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black text-white">
            {maintenanceMode ? 'MAINTENANCE MODE ACTIVE' : 'DEPLOYMENT GUARD ACTIVE'}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {maintenanceMode
              ? 'All users see maintenance page â€” toggle off to restore access'
              : 'All systems operational â€” next maintenance window: Sunday 02:00 AM'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full"
                 style={{
                   backgroundColor: maintenanceMode ? C.amber : C.lime,
                   boxShadow: `0 0 6px ${maintenanceMode ? C.amber : C.lime}`,
                 }} />
            <span className="text-[11px] font-bold"
                  style={{ color: maintenanceMode ? C.amber : C.lime }}>
              {maintenanceMode ? 'MAINTENANCE' : 'LIVE'}
            </span>
          </div>
          {can('export_financial') && <button onClick={toggleMaintenanceMode} disabled={togglingMaint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: maintenanceMode ? C.amber : C.lime,
              color: '#0a0d08',
            }}>
            {togglingMaint ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : maintenanceMode ? (
              <ToggleRight size={11} />
            ) : (
              <ToggleLeft size={11} />
            )}
            {maintenanceMode ? 'Restore Live' : 'Force Maintenance'}
          </button>}
        </div>
      </div>

    </div>
  )
}
