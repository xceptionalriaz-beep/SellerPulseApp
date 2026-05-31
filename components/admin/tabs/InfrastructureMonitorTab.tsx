'use client'
// components/admin/tabs/InfrastructureMonitorTab.tsx
// Converted 1:1 from lib/pages/admin_tabs/infrastructure_monitor_tab.dart

import { useState, useEffect, useRef } from 'react'
import { ExternalLink, CheckCircle, AlertTriangle, XCircle, Plus, Building2 } from 'lucide-react'

const C = {
  dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0',
  bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8',
}

interface Props {
  isMobile?:            boolean
  startChartAnimation?: boolean
  isInvestorMode?:      boolean
}

// ── Circular gauge (matches Dart TweenAnimationBuilder + CircularProgressIndicator) ──
function ServerGauge({ title, target, subtitle, isWarning, animate }: {
  title: string; target: number; subtitle: string; isWarning: boolean; animate: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [current, setCurrent] = useState(0)
  const frameRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (!animate) return
    startRef.current = performance.now()
    cancelAnimationFrame(frameRef.current)
    function tick(now: number) {
      const t = Math.min((now - startRef.current) / 1500, 1) // 1500ms matches Dart
      const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setCurrent(target * ease)
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [animate, target])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = canvas.width
    const cx = size / 2, cy = size / 2, r = size / 2 - 8, sw = 12
    ctx.clearRect(0, 0, size, size)
    // Background ring
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.strokeStyle = '#F1F5F9'; ctx.lineWidth = sw; ctx.stroke()
    // Progress ring
    const color = isWarning && current > 0.8 ? '#F87171' : C.lime
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * current)
    ctx.strokeStyle = color; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.stroke()
  }, [current, isWarning])

  return (
    <div className="flex-1 flex flex-col items-center p-6 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: C.border }}>
      <p className="text-[15px] font-bold text-center mb-5" style={{ color: C.text }}>{title}</p>
      <div className="relative" style={{ width: 120, height: 120 }}>
        <canvas ref={canvasRef} width={120} height={120} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[24px] font-bold" style={{ color: C.text }}>
            {Math.round(current * 100)}%
          </span>
        </div>
      </div>
      <p className="text-[13px] font-bold mt-5" style={{ color: C.muted }}>{subtitle}</p>
    </div>
  )
}

// ── Status toggle (matches Dart _buildStatusToggle) ───────────
function StatusToggle({ title, icon: Icon, color, isActive, onTap }: {
  title: string; icon: React.ElementType; color: string; isActive: boolean; onTap: () => void
}) {
  return (
    <button onClick={onTap}
      className="w-[200px] flex items-center justify-center gap-2 py-4 rounded-xl border transition-all shrink-0"
      style={{
        backgroundColor: isActive ? color + '14' : C.bg,
        borderColor:     isActive ? color : C.border,
        borderWidth:     isActive ? 2 : 1,
      }}>
      <Icon size={19} style={{ color: isActive ? color : C.hint }} />
      <span className="text-[13px] font-bold truncate" style={{ color: isActive ? color : C.muted }}>{title}</span>
    </button>
  )
}

// ── B2B partner row (matches Dart _buildB2BPartnerRow) ────────
function B2BPartnerRow({ name, apiKey, usage, rev }: {
  name: string; apiKey: string; usage: string; rev: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border mb-3"
         style={{ backgroundColor: C.bg, borderColor: C.border }}>
      <div className="flex items-center gap-4 min-w-0 flex-[2]">
        <Building2 size={20} style={{ color: C.muted }} />
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.text }}>{name}</p>
          <p className="text-[12px]" style={{ color: C.hint }}>API Key: {apiKey}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold" style={{ color: C.text }}>{usage}</p>
        <p className="text-[11px]" style={{ color: C.muted }}>This Month</p>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold" style={{ color: '#16A34A' }}>{rev}</p>
        <p className="text-[11px]" style={{ color: C.muted }}>B2B Revenue</p>
      </div>
    </div>
  )
}

export default function InfrastructureMonitorTab({ isMobile, startChartAnimation }: Props) {
  const [apiStatus, setApiStatus] = useState('Operational')

  return (
    <div className="flex flex-col gap-6">

      {/* Uptime Status Manager */}
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <h2 className="text-[18px] font-bold flex-1" style={{ color: C.text }}>
            Public 'Uptime Status' Page Manager
          </h2>
          <button className="flex items-center gap-1.5 text-[13px] font-semibold"
                  style={{ color: C.muted }}>
            <ExternalLink size={13} /> View status.sellerpulse.com
          </button>
        </div>
        <p className="text-[13px] mb-6" style={{ color: C.muted }}>
          Manually override the public system status if eBay or Amazon APIs go down to prevent support ticket flooding.
        </p>
        <div className="flex gap-4 overflow-x-auto pb-1">
          <StatusToggle title="Operational"  icon={CheckCircle}   color="#16A34A" isActive={apiStatus === 'Operational'}  onTap={() => setApiStatus('Operational')} />
          <StatusToggle title="Degraded"     icon={AlertTriangle} color="#FB923C" isActive={apiStatus === 'Degraded'}     onTap={() => setApiStatus('Degraded')} />
          <StatusToggle title="Major Outage" icon={XCircle}       color="#F87171" isActive={apiStatus === 'Major Outage'} onTap={() => setApiStatus('Major Outage')} />
        </div>
      </div>

      {/* Server gauges */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
        <ServerGauge title={isMobile ? 'Supabase DB'        : 'Supabase Database'}   target={0.52} subtitle={isMobile ? '4.2 GB / 8 GB'      : '4.2 GB / 8 GB Used'}  isWarning={false} animate={!!startChartAnimation} />
        <ServerGauge title="Vercel Bandwidth"                                          target={0.45} subtitle="45 GB / 100 GB"                                           isWarning={false} animate={!!startChartAnimation} />
        <ServerGauge title={isMobile ? 'Websockets'         : 'Active Websockets'}   target={0.85} subtitle="1,204 Connected"                                           isWarning={true}  animate={!!startChartAnimation} />
      </div>

      {/* B2B API Hub */}
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <h2 className="text-[18px] font-bold flex-1" style={{ color: C.text }}>
            B2B 'White-Label' API Monetization
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold text-white"
                  style={{ backgroundColor: C.dark }}>
            <Plus size={15} /> Issue New Key
          </button>
        </div>
        <p className="text-[13px] mb-6" style={{ color: C.muted }}>
          Manage third-party startups paying to access your VeRO & Profit Engine APIs.
        </p>
        <B2BPartnerRow name="AutoLister Pro" apiKey="sk_live_x89f..." usage="42,500 Calls" rev="$425.00" />
        <B2BPartnerRow name="Dropship Ninja" apiKey="sk_live_a12b..." usage="18,200 Calls" rev="$182.00" />
      </div>

    </div>
  )
}