'use client'
// app/dashboard/product-research/components/keyword-search/AdvancedFiltersModal.tsx
// Converted 1:1 from lib/pages/product_research/keyword_search/widgets/advanced_filters_modal.dart

import { useState } from 'react'
import { X } from 'lucide-react'

const C = {
  dark:   '#131B2F',
  text:   '#1E293B',
  muted:  '#64748B',
  border: '#E2E8F0',
  lime:   '#8FFF00',
  white:  '#FFFFFF',
}

interface Props {
  onClose: () => void
  onApply: (filters: { minPrice: string; maxPrice: string; minMonthlySales: number }) => void
}

export default function AdvancedFiltersModal({ onClose, onApply }: Props) {
  const [minPrice,        setMinPrice]        = useState('')
  const [maxPrice,        setMaxPrice]        = useState('')
  const [minMonthlySales, setMinMonthlySales] = useState(50)

  return (
    // Backdrop
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Dialog â€” width:500, padding:30, borderRadius:20 */}
      <div className="w-full rounded-2xl p-8 flex flex-col gap-5"
           style={{ maxWidth: 500, backgroundColor: C.white }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[22px] font-bold" style={{ color: C.text }}>âš™ï¸ Advanced Filters</p>
          <button onClick={onClose} className="p-1.5 hover:opacity-70">
            <X size={20} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Price Range */}
        <div>
          <p className="text-[14px] font-bold mb-2.5" style={{ color: C.muted }}>Price Range ($)</p>
          <div className="flex items-center gap-2.5">
            <input value={minPrice} onChange={e => setMinPrice(e.target.value)}
              placeholder="Min"
              className="flex-1 h-11 px-3 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: C.border }} />
            <span style={{ color: C.muted }}>-</span>
            <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="flex-1 h-11 px-3 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: C.border }} />
          </div>
        </div>

        {/* Min Monthly Sales slider */}
        <div>
          <p className="text-[14px] font-bold mb-2.5" style={{ color: C.muted }}>
            Minimum Monthly Sales
          </p>
          <div className="relative">
            <input
              type="range"
              min={0} max={500}
              value={minMonthlySales}
              onChange={e => setMinMonthlySales(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                // matches Dart Slider activeColor:lime, thumbColor:dark
                background: `linear-gradient(to right, ${C.lime} 0%, ${C.lime} ${(minMonthlySales/500)*100}%, #E2E8F0 ${(minMonthlySales/500)*100}%, #E2E8F0 100%)`,
                accentColor: C.lime,
              }}
            />
            <p className="text-[13px] font-bold mt-1.5 text-center" style={{ color: C.dark }}>
              {minMonthlySales} sales/mo
            </p>
          </div>
        </div>

        {/* Apply button */}
        <button
          onClick={() => { onApply({ minPrice, maxPrice, minMonthlySales }); onClose() }}
          className="w-full h-12 rounded-xl text-[16px] font-bold text-white"
          style={{ backgroundColor: C.dark }}>
          Apply Filters
        </button>

      </div>
    </div>
  )
}
