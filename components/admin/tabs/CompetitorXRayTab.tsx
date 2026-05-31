'use client'
// components/admin/tabs/CompetitorXRayTab.tsx
// Converted 1:1 from lib/pages/admin_tabs/competitor_xray_tab.dart

import { Search, Store, User, DollarSign, List, TrendingUp, Image } from 'lucide-react'

const C = {
  dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0',
  bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8',
}

interface Props { isInvestorMode?: boolean; isMobile?: boolean; startChartAnimation?: boolean }

function XRayStat({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-2 px-8">
      <Icon size={20} style={{ color: C.lime }} />
      <p className="text-[18px] font-bold text-white">{value}</p>
      <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{title}</p>
    </div>
  )
}

function XRayProductRow({ title, price, sold, rev }: {
  title: string; price: string; sold: string; rev: string
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border mb-3"
         style={{ backgroundColor: C.bg, borderColor: C.border }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
           style={{ backgroundColor: C.border }}>
        <Image size={18} style={{ color: C.hint }} />
      </div>
      <p className="flex-1 text-[14px] font-bold min-w-0 truncate" style={{ color: C.text }}>{title}</p>
      <p className="text-[13px] w-20 shrink-0" style={{ color: C.muted }}>{price}</p>
      <p className="text-[13px] font-bold w-20 shrink-0" style={{ color: '#16A34A' }}>{sold}</p>
      <p className="text-[14px] font-bold w-24 text-right shrink-0" style={{ color: C.text }}>{rev}</p>
    </div>
  )
}

export default function CompetitorXRayTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>Competitor Store X-Ray</h2>
      <p className="text-[13px] mb-6" style={{ color: C.muted }}>
        Paste an eBay store URL to reverse-engineer their best sellers and revenue.
      </p>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-lg border"
             style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <Store size={16} style={{ color: C.hint }} />
          <input placeholder="https://www.ebay.com/usr/TopTechDeals_99"
            className="flex-1 text-[13px] outline-none bg-transparent" style={{ color: C.text }} />
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold shrink-0"
                style={{ backgroundColor: C.dark, color: C.lime }}>
          <Search size={16} /> Scan Store
        </button>
      </div>

      {/* Mock scan results */}
      <div className="mt-8 p-5 rounded-xl overflow-x-auto" style={{ backgroundColor: C.dark }}>
        {/* FIX: Removed spaceAround to prevent infinite width freeze bug (matches Dart comment) */}
        <div className="flex items-center">
          <XRayStat title="Target Store"     value="TechDeals_99" icon={User} />
          <div className="w-px h-10 mx-7 shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <XRayStat title="Est. Monthly Rev" value="$45,210"      icon={DollarSign} />
          <div className="w-px h-10 mx-7 shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <XRayStat title="Active Listings"  value="1,402"        icon={List} />
          <div className="w-px h-10 mx-7 shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <XRayStat title="Sell-Through"     value="48%"          icon={TrendingUp} />
        </div>
      </div>

      {/* Top selling items */}
      <p className="text-[16px] font-bold mt-6 mb-4" style={{ color: C.text }}>
        Top Selling Items (Last 30 Days)
      </p>
      <XRayProductRow title="Apple AirPods Pro (2nd Gen)"   price="$189.99" sold="342 Sold" rev="$64,976 Rev" />
      <XRayProductRow title="Sony WH-1000XM5 Headphones"    price="$298.00" sold="125 Sold" rev="$37,250 Rev" />

    </div>
  )
}