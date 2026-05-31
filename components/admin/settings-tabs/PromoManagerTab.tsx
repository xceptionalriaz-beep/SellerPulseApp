'use client'
// components/admin/settings-tabs/PromoManagerTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/promo_manager_tab.dart

import { Plus } from 'lucide-react'

const C = { dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B' }

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

function PromoCard({ code, desc, status, usage }: {
  code: string; desc: string; status: string; usage: string
}) {
  const isActive = status === 'Active'
  return (
    <div className="p-4 rounded-xl border shrink-0" style={{ width: 280, backgroundColor: C.bg, borderColor: C.border }}>
      <div className="flex items-center justify-between mb-3">
        <span className="px-2 py-1 rounded text-[12px] font-bold"
              style={{ backgroundColor: C.dark, color: C.lime }}>{code}</span>
        <span className="px-2 py-1 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: isActive ? '#DCFCE7' : '#FEF2F2',
                color:           isActive ? '#16A34A' : '#F87171',
              }}>{status}</span>
      </div>
      <p className="text-[14px] font-bold mb-2" style={{ color: C.text }}>{desc}</p>
      <p className="text-[12px]" style={{ color: C.muted }}>{usage}</p>
    </div>
  )
}

function ABVariant({ title, price, visitors, conversion, mrr, isWinner }: {
  title: string; price: string; visitors: string; conversion: string; mrr: string; isWinner: boolean
}) {
  return (
    <div className="p-4 rounded-xl border shrink-0" style={{
      width: 320,
      backgroundColor: isWinner ? '#DCFCE7' : C.bg,
      borderColor:     isWinner ? '#16A34A' : C.border,
      borderWidth:     isWinner ? 2 : 1,
    }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-bold" style={{ color: isWinner ? '#16A34A' : C.text }}>{title}</p>
        {isWinner && (
          <span className="px-2 py-1 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: '#16A34A' }}>Winning</span>
        )}
      </div>
      <p className="text-[24px] font-bold mb-3" style={{ color: C.text }}>{price}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.text }}>{visitors}</p>
          <p className="text-[11px]" style={{ color: C.muted }}>Visitors</p>
        </div>
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.text }}>{conversion}</p>
          <p className="text-[11px]" style={{ color: C.muted }}>Conversion</p>
        </div>
        <div>
          <p className="text-[14px] font-bold" style={{ color: isWinner ? '#16A34A' : C.text }}>{mrr}</p>
          <p className="text-[11px]" style={{ color: C.muted }}>MRR Generated</p>
        </div>
      </div>
    </div>
  )
}

export default function PromoManagerTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h2 className="text-[18px] font-bold flex-1" style={{ color: C.text }}>
          Promo Code & Discount Manager
        </h2>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold shrink-0"
                style={{ backgroundColor: C.lime, color: C.dark }}>
          <Plus size={15} /> New Code
        </button>
      </div>
      <p className="text-[13px] mb-6" style={{ color: C.muted }}>
        Generate custom Stripe discount codes for marketing campaigns.
      </p>

      {/* Promo cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 mb-8">
        <PromoCard code="BLACKFRIDAY50" desc="50% Off First 3 Months"  status="Active"  usage="84 / 100 Used" />
        <PromoCard code="COMEBACK20"    desc="20% Off Lifetime"         status="Active"  usage="12 / ∞ Used"  />
        <PromoCard code="LAUNCHPRO"     desc="1 Month Free Elite"       status="Expired" usage="500 / 500 Used" />
      </div>

      {/* A/B Pricing Engine */}
      <p className="text-[16px] font-bold mb-4" style={{ color: C.text }}>A/B Pricing Engine (Live Tests)</p>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <ABVariant title="Variant A (Control)" price="$29/mo" visitors="1,240" conversion="4.2%" mrr="$1,508" isWinner={false} />
        <ABVariant title="Variant B (Test)"    price="$39/mo" visitors="1,255" conversion="3.8%" mrr="$1,862" isWinner={true}  />
      </div>

    </div>
  )
}