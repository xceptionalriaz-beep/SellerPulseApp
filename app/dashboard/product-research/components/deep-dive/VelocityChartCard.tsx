'use client'
// app/dashboard/product-research/components/deep-dive/VelocityChartCard.tsx
// Converted 1:1 from lib/pages/product_research/deep_dive/widgets/velocity_chart_card.dart

import { TrendingUp, BarChart2 } from 'lucide-react'
import NeonIcon from '../shared/NeonIcon'

const C = { text: '#1E293B', muted: '#94A3B8', border: '#E5E7EB', bg: '#F8FAFC' }

interface Props {
  totalSold: string
}

export default function VelocityChartCard({ totalSold }: Props) {
  return (
    <div className="flex flex-col h-full p-5 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 5px 10px rgba(0,0,0,0.02)' }}>

      {/* Header — matches Dart Row NeonIcon + title */}
      <div className="flex items-center gap-2.5 mb-5">
        <NeonIcon icon={TrendingUp} />
        <p className="text-[16px] font-bold" style={{ color: C.text }}>30-Day Sales Velocity</p>
      </div>

      {/* Expanded content — matches Dart Expanded Column */}
      <div className="flex flex-col flex-1 gap-2.5">

        {/* Chart placeholder — matches Dart Container with bg + bar_chart icon */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-xl border"
             style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <BarChart2 size={80} style={{ color: '#E2E8F0' }} />
          <p className="text-[13px] mt-2.5" style={{ color: C.muted }}>
            [ Dynamic Chart rendering engine ]
          </p>
        </div>

        {/* Sales trend row — matches Dart Row NeonIcon + Text */}
        <div className="flex items-center gap-2.5">
          <NeonIcon icon={TrendingUp} />
          <p className="text-[14px] font-bold" style={{ color: C.text }}>
            Sales are trending UP this week! ({totalSold} Total Sold)
          </p>
        </div>
      </div>
    </div>
  )
}