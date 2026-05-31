'use client'
// components/admin/settings-tabs/crm_widgets/AdminHudSection.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/crm_widgets/admin_hud_section.dart

import { AlertTriangle, CheckCircle } from 'lucide-react'

interface Props { allUsers: any[] }

function safeRatio(part: number, total: number) {
  if (total <= 0 || part <= 0) return 0
  return Math.min(Math.max(part / total, 0), 1)
}

function clean(value: any): string {
  if (value == null) return ''
  return value.toString().trim().toLowerCase()
}

// ── Circular progress (matches Dart CircularProgressIndicator) ──
function CircleProgress({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 18; const sw = 5; const circ = 2 * Math.PI * r
  const dash = value * circ
  return (
    <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
      <svg width="44" height="44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#F1F5F9" strokeWidth={sw} />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12px] font-bold" style={{ color: '#0F172A' }}>{label}</span>
      </div>
    </div>
  )
}

// ── Mini bar (matches Dart _buildMiniBar) ──────────────────────
function MiniBar({ fill, color }: { fill: number; color: string }) {
  const safeFill = fill <= 0 ? 0.05 : fill < 0.1 ? 0.1 : fill
  return (
    <div className="flex items-end rounded-sm overflow-hidden"
         style={{ width: 10, height: 36, backgroundColor: '#F1F5F9', borderRadius: 3 }}>
      <div className="w-full rounded-sm" style={{ height: `${safeFill * 100}%`, backgroundColor: color, borderRadius: 3 }} />
    </div>
  )
}

// ── HUD card (matches Dart _buildHUDCard) ─────────────────────
function HudCard({ title, value, subtitle, children }: {
  title: string; value: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: '#E2E8F0', boxShadow: '0 4px 8px rgba(0,0,0,0.02)' }}>
      <div className="shrink-0">{children}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold truncate" style={{ color: '#64748B' }}>{title}</p>
        <p className="text-[13px] font-black truncate" style={{ color: '#0F172A' }}>{value}</p>
        <p className="text-[9px] font-bold truncate" style={{ color: '#94A3B8' }}>{subtitle}</p>
      </div>
    </div>
  )
}

export default function AdminHudSection({ allUsers }: Props) {
  const totalUsers = allUsers.length

  // Active subscribers
  const activeSubs = allUsers.filter(u => clean(u.account_status) === 'active' && clean(u.plan_name) !== 'free trial').length
  const activeRatio = safeRatio(activeSubs, totalUsers)

  // Plan distribution
  const freeCount  = allUsers.filter(u => clean(u.plan_name) === 'free trial').length
  const proCount   = allUsers.filter(u => clean(u.plan_name) === 'pro plan').length
  const eliteCount = allUsers.filter(u => clean(u.plan_name) === 'elite plan').length

  // Account health
  const pastDue    = allUsers.filter(u => clean(u.account_status) === 'past due')
  const expired    = allUsers.filter(u => clean(u.account_status) === 'expired')
  const riskTotal  = pastDue.length + expired.length
  const riskRatio  = safeRatio(riskTotal, totalUsers)

  let revenueAtRisk = 0
  for (const u of [...pastDue, ...expired]) {
    const p = clean(u.plan_name)
    if (p === 'pro plan')   revenueAtRisk += 49
    if (p === 'elite plan') revenueAtRisk += 99
  }
  const healthSubtitle = riskTotal > 0 ? `$${revenueAtRisk.toFixed(0)} MRR at risk` : 'All accounts healthy'
  const riskColor = riskTotal > 0 ? '#FB923C' : '#16A34A'

  // Disputes
  const disputeUsers = allUsers.filter(u => u.dispute_note && u.dispute_note.toString().trim() !== '')
  const disputeTotal = disputeUsers.length
  let disputeSubtitle = 'No active issues'
  if (disputeTotal > 0) {
    const fullName  = (disputeUsers[0].name ?? 'Unknown').toString().trim()
    const firstName = fullName.split(' ')[0] ?? 'User'
    disputeSubtitle = `Queue: ${firstName}`
  }

  return (
    // matches Dart GridView.count — 4 cols desktop, 2 cols mobile
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

      {/* Active Subscribers */}
      <HudCard title="Active Subscribers" value={`${activeSubs}`} subtitle={`Total: ${totalUsers} accounts`}>
        <CircleProgress value={activeRatio} color="#0F172A" label={`${activeSubs}`} />
      </HudCard>

      {/* Plan Distribution */}
      <HudCard title="Plan Distribution" value={`Pro Plans: ${proCount}`} subtitle={`Free: ${freeCount} | Elite: ${eliteCount}`}>
        <div className="flex items-end gap-1 shrink-0">
          <MiniBar fill={safeRatio(freeCount, totalUsers)}  color="#8FFF00" />
          <MiniBar fill={safeRatio(proCount, totalUsers)}   color="#0F172A" />
          <MiniBar fill={safeRatio(eliteCount, totalUsers)} color="#64748B" />
        </div>
      </HudCard>

      {/* Account Health */}
      <HudCard title="Account Health" value={`${riskTotal} Risk Users`} subtitle={healthSubtitle}>
        <CircleProgress
          value={riskTotal > 0 ? Math.max(riskRatio, 0.1) : 0}
          color={riskColor}
          label={`${riskTotal}`}
        />
      </HudCard>

      {/* Dispute Center */}
      <HudCard title="Dispute Center" value={`${disputeTotal} Issues`} subtitle={disputeSubtitle}>
        <div className="p-2.5 rounded-full shrink-0"
             style={{ backgroundColor: disputeTotal > 0 ? '#FEF2F2' : '#F0FDF4' }}>
          {disputeTotal > 0
            ? <AlertTriangle size={22} style={{ color: '#F87171' }} />
            : <CheckCircle  size={22} style={{ color: '#16A34A' }} />}
        </div>
      </HudCard>

    </div>
  )
}