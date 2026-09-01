// app/status/page.tsx
// Public system status page — readable by anyone

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, XCircle, Activity, Bell } from 'lucide-react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SystemStatus {
  status: 'operational' | 'degraded' | 'major_outage'
  message: string
  updated_at: string
}

interface Component {
  id: string
  name: string
  status: string
  order_index: number
}

// -- Riazify Color Role Tokens (v2.0) ---------------------------
const T = {
  primary: '#7530fb',
  primaryHover: '#6020e0',
  primaryLight: '#f3eeff',
  accent: '#b8fa33',
  accentHover: '#a3e635',
  dark: '#1e1535',
  darkHover: '#2d1f4e',
  darkCard: '#271c42',
  border: '#ede9fe',
  borderDark: '#2d1f4e',
  borderInput: '#e5e0f5',
  bg: '#f8f7ff',
  surface: '#ffffff',
  text: '#1f1d2e',
  textDark: '#1e1535',
  muted: '#6b7280',
  textLight: '#a89cc8',
}

const STATUS_CONFIG = {
  operational: {
    label: 'All Systems Operational',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: CheckCircle2,
    dot: '#16a34a',
  },
  degraded: {
    label: 'Degraded Performance',
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    icon: AlertTriangle,
    dot: '#f97316',
  },
  major_outage: {
    label: 'Major Outage',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: XCircle,
    dot: '#dc2626',
  },
}

const COMPONENT_STATUS_CONFIG = {
  operational: { label: 'Operational', color: '#16a34a', dot: '#16a34a' },
  degraded: { label: 'Degraded', color: '#f97316', dot: '#f97316' },
  major_outage: { label: 'Major Outage', color: '#dc2626', dot: '#dc2626' },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) === 1 ? '' : 's'} ago`
}

export default async function StatusPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: statusData }, { data: componentsData }] = await Promise.all([
    (supabase as any)
      .from('system_status')
      .select('status, message, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1),
    (supabase as any)
      .from('system_components')
      .select('id, name, status, order_index')
      .order('order_index', { ascending: true }),
  ])

  const status: SystemStatus = statusData?.[0] ?? {
    status: 'operational',
    message: 'All systems and intelligence engines are operating with zero detected latency.',
    updated_at: new Date().toISOString(),
  }

  const components: Component[] = componentsData ?? []
  const cfg = STATUS_CONFIG[status.status] ?? STATUS_CONFIG.operational

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: T.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <Navbar />

      {/* ── 1. Hero Status Banner ── */}
      <div className="text-center px-4 pt-24 pb-14 relative overflow-hidden">
        {/* Background glow effects */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -80,
            right: -80,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'rgba(117,48,251,0.08)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -80,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(184,250,51,0.08)',
          }}
        />

        <div className="relative z-10">
          {/* Status Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border shadow-xs"
            style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}` }}
            />
            <span className="text-[12px] font-black uppercase tracking-wider font-syne" style={{ color: cfg.color }}>
              {cfg.label}
            </span>
          </div>

          <h1
            className="font-black mb-3 font-syne tracking-tight"
            style={{ color: T.textDark, fontSize: 'clamp(32px, 5vw, 52px)' }}
          >
            System Status
          </h1>

          <p className="text-[15px] max-w-md mx-auto mb-2 font-medium" style={{ color: T.muted }}>
            {status.message}
          </p>
          <p className="text-[12px] mb-8" style={{ color: T.muted }}>
            Last verified {timeAgo(status.updated_at)}
          </p>

          {/* High-Level Core Subsystem Badges */}
          <div
            className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl border mx-auto shadow-xs"
            style={{ backgroundColor: T.surface, borderColor: T.border }}
          >
            {[
              { label: 'eBay Sync API', status: 'operational' },
              { label: 'Cassini Engine', status: 'operational' },
              { label: 'Database Mesh', status: 'operational' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#16a34a', boxShadow: '0 0 6px rgba(22,163,74,0.6)' }}
                />
                <span className="text-[12px] font-bold font-syne" style={{ color: T.textDark }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Component Health Ledger ── */}
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pb-14 flex flex-col gap-3">
        <div className="flex items-center justify-between px-2 mb-1">
          <p className="text-[11px] font-black uppercase tracking-wider font-syne" style={{ color: T.primary }}>
            SERVICES & SUBNETS
          </p>
          <p className="text-[11px] font-bold" style={{ color: T.muted }}>
            Real-Time Telemetry
          </p>
        </div>

        {components.length > 0 ? (
          components.map((component) => {
            const compCfg =
              COMPONENT_STATUS_CONFIG[component.status as keyof typeof COMPONENT_STATUS_CONFIG] ??
              COMPONENT_STATUS_CONFIG.operational
            return (
              <div
                key={component.id}
                className="flex items-center justify-between p-4 rounded-2xl border shadow-xs transition-colors hover:border-[#7530fb]"
                style={{ backgroundColor: T.surface, borderColor: T.border }}
              >
                <p className="text-[14px] font-bold font-syne" style={{ color: T.textDark }}>
                  {component.name}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: compCfg.dot,
                      boxShadow: component.status === 'operational' ? `0 0 6px ${compCfg.dot}` : 'none',
                    }}
                  />
                  <span className="text-[12px] font-bold font-syne" style={{ color: compCfg.color }}>
                    {compCfg.label}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          [
            'eBay Product Search API',
            'VeRO Risk Protection Engine',
            'Profit & Fee Calculation Service',
            'AI Cassini Title Builder',
            'Order Monitoring & Ingestion',
            'Inventory Velocity Tracking',
            'Analytics & Reporting Data Lake',
          ].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between p-4 rounded-2xl border shadow-xs transition-colors hover:border-[#7530fb]"
              style={{ backgroundColor: T.surface, borderColor: T.border }}
            >
              <p className="text-[14px] font-bold font-syne" style={{ color: T.textDark }}>
                {name}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }}
                />
                <span className="text-[12px] font-bold font-syne" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── 3. Subscribe for Status Updates ── */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-20">
        <div
          className="rounded-3xl p-8 text-center border shadow-xl relative overflow-hidden"
          style={{ backgroundColor: T.dark, borderColor: T.borderDark }}
        >
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(117,48,251,0.2)',
              pointerEvents: 'none',
            }}
          />
          <div className="relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border shadow-sm"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: T.primary }}
            >
              <Bell size={18} style={{ color: T.accent }} />
            </div>
            <h3 className="text-[18px] font-black text-white font-syne mb-1 tracking-tight">
              Subscribe to incident notifications
            </h3>
            <p className="text-[13px] mb-5 font-medium" style={{ color: T.textLight }}>
              Get automated email alerts the moment maintenance starts or incidents resolve.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                placeholder="operator@riazify.com"
                className="flex-1 h-11 px-4 rounded-xl text-[13px] outline-none border transition-colors focus:border-[#7530fb]"
                style={{
                  backgroundColor: T.darkCard,
                  color: '#ffffff',
                  borderColor: T.borderDark,
                }}
              />
              <button
                className="h-11 px-6 rounded-xl text-[13px] font-black shrink-0 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                style={{ backgroundColor: T.accent, color: T.dark }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
