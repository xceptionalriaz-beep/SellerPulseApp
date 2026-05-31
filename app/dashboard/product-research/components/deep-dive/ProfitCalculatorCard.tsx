'use client'
// app/dashboard/product-research/components/deep-dive/ProfitCalculatorCard.tsx
// Converted 1:1 from lib/pages/product_research/deep_dive/widgets/profit_calculator_card.dart

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import NeonIcon from '../shared/NeonIcon'

const C = { text: '#1E293B', muted: '#64748B', dark: '#131B2F', lime: '#8FFF00', border: '#E5E7EB' }

interface Props {
  salePrice: number
}

export default function ProfitCalculatorCard({ salePrice }: Props) {
  // Default sourcing cost to 40% of sale price — matches Dart initState
  const [sourcingCost, setSourcingCost] = useState(salePrice * 0.4)

  const ebayFees = salePrice * 0.1325
  const netProfit = salePrice - sourcingCost - ebayFees
  const margin    = salePrice > 0 ? Math.round((netProfit / salePrice) * 100) : 0
  const sliderMax = salePrice > 1 ? salePrice : 100

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 5px 10px rgba(0,0,0,0.02)' }}>

      {/* Header — matches Dart Row NeonIcon + title */}
      <div className="flex items-center gap-2.5 mb-5">
        <NeonIcon icon={Calculator} />
        <p className="text-[16px] font-bold" style={{ color: C.text }}>Profit Calculator</p>
      </div>

      {/* Content — matches Dart Expanded Column */}
      <div className="flex flex-col flex-1 gap-2.5">

        {/* Sourcing cost row */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold" style={{ color: C.muted }}>Est. Sourcing Cost:</p>
          <p className="text-[16px] font-bold" style={{ color: C.text }}>${sourcingCost.toFixed(2)}</p>
        </div>

        {/* Slider — matches Dart Slider lime/grey/dark */}
        <input type="range" min={1} max={sliderMax} step={0.01}
          value={sourcingCost}
          onChange={e => setSourcingCost(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${C.lime} 0%, ${C.lime} ${((sourcingCost-1)/(sliderMax-1))*100}%, #E5E7EB ${((sourcingCost-1)/(sliderMax-1))*100}%, #E5E7EB 100%)`,
            accentColor: C.lime,
          }} />

        {/* eBay fees row */}
        <div className="flex items-center justify-between mt-1">
          <p className="text-[13px] font-bold" style={{ color: C.muted }}>Est. eBay Fees:</p>
          <p className="text-[13px] font-bold" style={{ color: '#F87171' }}>
            -${ebayFees.toFixed(2)} (13.25%)
          </p>
        </div>

        {/* Spacer — matches Dart Spacer() */}
        <div className="flex-1" />

        {/* Net profit box — matches Dart dark Container */}
        <div className="flex items-center justify-between p-4 rounded-xl"
             style={{ backgroundColor: C.dark }}>
          <p className="text-[14px] font-bold text-white">NET PROFIT:</p>
          <p className="text-[18px] font-bold" style={{ color: C.lime }}>
            ${netProfit.toFixed(2)} ({margin}%)
          </p>
        </div>
      </div>
    </div>
  )
}