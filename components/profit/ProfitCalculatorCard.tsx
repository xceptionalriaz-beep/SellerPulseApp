'use client'
// components/profit/ProfitCalculatorCard.tsx
// Converted 1:1 from lib/pages/product_research/deep_dive/widgets/profit_calculator_card.dart

import { useState } from 'react'
import { Calculator } from 'lucide-react'

interface ProfitCalculatorCardProps {
  salePrice: number
}

export default function ProfitCalculatorCard({ salePrice }: ProfitCalculatorCardProps) {
  // Default the sourcing cost to roughly 40% of the sale price
  const [sourcingCost, setSourcingCost] = useState(salePrice * 0.4)

  const ebayFees  = salePrice * 0.1325
  const netProfit = salePrice - sourcingCost - ebayFees
  const margin    = salePrice > 0 ? Math.round((netProfit / salePrice) * 100) : 0

  const sliderMax = salePrice > 1 ? salePrice : 100.0

  return (
    <div className="flex flex-col p-5 rounded-2xl border"
         style={{
           backgroundColor: '#fff',
           borderColor: '#E2E8F0',
           boxShadow: '0 5px 10px rgba(0,0,0,0.02)',
         }}>

      {/* Header â€” NeonIcon + title */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ backgroundColor: '#1a2410' }}>
          <Calculator size={16} style={{ color: '#8FFF00' }} />
        </div>
        <span className="text-[16px] font-bold" style={{ color: '#1E293B' }}>Profit Calculator</span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-2">

        {/* Est. Sourcing Cost row */}
        <div className="flex items-center justify-between">
          <span className="font-bold" style={{ color: '#64748B' }}>Est. Sourcing Cost:</span>
          <span className="font-bold text-[16px]" style={{ color: '#1E293B' }}>${sourcingCost.toFixed(2)}</span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={1}
          max={sliderMax}
          step={0.01}
          value={sourcingCost}
          onChange={e => setSourcingCost(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            accentColor: '#8FFF00',
            background: `linear-gradient(to right, #8FFF00 ${((sourcingCost - 1) / (sliderMax - 1)) * 100}%, #E2E8F0 ${((sourcingCost - 1) / (sliderMax - 1)) * 100}%)`,
          }}
        />

        {/* Est. eBay Fees row */}
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-bold" style={{ color: '#64748B' }}>Est. eBay Fees:</span>
          <span className="font-bold" style={{ color: '#F87171' }}>
            -${ebayFees.toFixed(2)} (13.25%)
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Net Profit bar */}
        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl mt-2"
             style={{ backgroundColor: '#131B2F' }}>
          <span className="font-bold text-white">NET PROFIT:</span>
          <span className="text-[18px] font-bold" style={{ color: '#8FFF00' }}>
            ${netProfit.toFixed(2)} ({margin}%)
          </span>
        </div>

      </div>
    </div>
  )
}
