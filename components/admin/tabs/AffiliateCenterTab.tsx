'use client'
// components/admin/tabs/AffiliateCenterTab.tsx
// Converted 1:1 from lib/pages/admin_tabs/affiliate_center_tab.dart

import { Link } from 'lucide-react'

const C = {
  dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0',
  bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8',
}

interface Props { isInvestorMode?: boolean }

function obscureText(text: string, mode: boolean, isEmail = false): string {
  if (!mode) return text
  if (isEmail) {
    const parts = text.split('@')
    if (parts.length !== 2) return text
    return `${parts[0][0]}***@${parts[1]}`
  }
  return `${text[0]}***`
}

function AffiliateTier({ title, req, payout, isHighlight = false }: {
  title: string; req: string; payout: string; isHighlight?: boolean
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-2">
      <p className="text-[14px] font-bold" style={{ color: isHighlight ? C.lime : '#fff' }}>{title}</p>
      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{req}</p>
      <p className="text-[12px] font-bold" style={{ color: isHighlight ? C.lime : '#fff' }}>{payout}</p>
    </div>
  )
}

export default function AffiliateCenterTab({ isInvestorMode = false }: Props) {
  const affiliates = [
    { name: 'Tech Hustler', code: 'TECH20',  clicks: '1,240', signups: '42', mrr: '$1,260', payout: '$252.00' },
    { name: 'eBay Ninja',   code: 'NINJA99', clicks: '850',   signups: '18', mrr: '$540',   payout: '$108.00' },
  ]

  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h2 className="text-[18px] font-bold" style={{ color: C.text }}>Affiliate & Partner Command Center</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold"
                style={{ backgroundColor: C.lime, color: C.dark }}>
          <Link size={15} /> Generate Link
        </button>
      </div>
      <p className="text-[13px] mb-6" style={{ color: C.muted }}>
        Track your top promoters, referral clicks, and pending payouts.
      </p>

      {/* Tier bar */}
      <div className="flex items-center rounded-xl p-4 mb-6" style={{ backgroundColor: C.dark }}>
        <AffiliateTier title="🥉 Bronze" req="1-10 Signups"  payout="15% Comm." />
        <div className="w-px h-10" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <AffiliateTier title="🥈 Silver" req="11-50 Signups" payout="25% Comm." />
        <div className="w-px h-10" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <AffiliateTier title="🥇 Gold"   req="50+ Signups"   payout="40% Comm." isHighlight />
      </div>

      {/* Affiliate rows */}
      <div className="flex flex-col gap-3">
        {affiliates.map((a, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border flex-wrap"
               style={{ backgroundColor: C.bg, borderColor: C.border }}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                 style={{ backgroundColor: C.dark }}>
              <span className="text-[14px] font-bold" style={{ color: C.lime }}>{a.name[0]}</span>
            </div>
            {/* Name + code */}
            <div className="flex-[2] min-w-0">
              <p className="text-[14px] font-bold truncate" style={{ color: C.text }}>
                {obscureText(a.name, isInvestorMode)}
              </p>
              <p className="text-[12px]" style={{ color: C.muted }}>Code: {a.code}</p>
            </div>
            {/* Clicks */}
            <div className="flex-1 min-w-[60px]">
              <p className="text-[14px] font-bold" style={{ color: C.text }}>{a.clicks}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Clicks</p>
            </div>
            {/* Signups */}
            <div className="flex-1 min-w-[60px]">
              <p className="text-[14px] font-bold" style={{ color: '#16A34A' }}>{a.signups}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Signups</p>
            </div>
            {/* MRR */}
            <div className="flex-1 min-w-[60px]">
              <p className="text-[14px] font-bold" style={{ color: C.text }}>{a.mrr}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>New MRR</p>
            </div>
            {/* Payout */}
            <div className="text-right shrink-0">
              <p className="text-[16px] font-bold" style={{ color: C.text }}>{a.payout}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Pending Payout</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}