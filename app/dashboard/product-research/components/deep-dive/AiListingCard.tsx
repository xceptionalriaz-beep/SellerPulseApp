'use client'
// app/dashboard/product-research/components/deep-dive/AiListingCard.tsx
// Converted 1:1 from lib/pages/product_research/deep_dive/widgets/ai_listing_card.dart

import { Sparkles, Copy, FileEdit } from 'lucide-react'
import NeonIcon from '../shared/NeonIcon'

const C = { text: '#1E293B', muted: '#64748B', dark: '#131B2F', lime: '#8FFF00', bg: '#F8FAFC' }

interface Props {
  optimizedTitle: string
  suggestedPrice: string
}

export default function AiListingCard({ optimizedTitle, suggestedPrice }: Props) {
  return (
    // Lime border — matches Dart Border.all(color:0xFF8FFF00, width:2)
    <div className="flex flex-col h-full p-5 rounded-2xl"
         style={{ backgroundColor: '#fff', border: `2px solid ${C.lime}`, boxShadow: '0 5px 10px rgba(0,0,0,0.02)' }}>

      {/* Header — matches Dart Row NeonIcon + title */}
      <div className="flex items-center gap-2.5 mb-5">
        <NeonIcon icon={Sparkles} />
        <p className="text-[16px] font-bold" style={{ color: C.text }}>AI Listing Assistant</p>
      </div>

      {/* Content — matches Dart Expanded Column */}
      <div className="flex flex-col flex-1">

        {/* Optimized title */}
        <p className="text-[12px] font-bold mb-1.5" style={{ color: C.muted }}>Optimized Title:</p>
        <div className="flex items-center gap-2 p-2.5 rounded-lg mb-4"
             style={{ backgroundColor: C.bg }}>
          <button onClick={() => navigator.clipboard.writeText(optimizedTitle)}
            className="shrink-0 hover:opacity-70">
            <Copy size={13} style={{ color: '#3B82F6' }} />
          </button>
          <p className="text-[13px] font-bold" style={{ color: C.text }}>{optimizedTitle}</p>
        </div>

        {/* Suggested price */}
        <p className="text-[12px] font-bold mb-1.5" style={{ color: C.muted }}>Suggested Price:</p>
        <div className="flex items-center gap-2 p-2.5 rounded-lg"
             style={{ backgroundColor: C.bg }}>
          <button onClick={() => navigator.clipboard.writeText(suggestedPrice)}
            className="shrink-0 hover:opacity-70">
            <Copy size={13} style={{ color: '#3B82F6' }} />
          </button>
          <p className="text-[14px] font-bold" style={{ color: C.text }}>{suggestedPrice}</p>
          <p className="text-[12px]" style={{ color: '#22C55E' }}> (Win BuyBox)</p>
        </div>

        {/* Spacer — matches Dart Spacer() */}
        <div className="flex-1" />

        {/* Generate description button */}
        <button onClick={() => {}}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[14px] font-bold text-white"
          style={{ backgroundColor: C.dark }}>
          <FileEdit size={15} />
          Generate Description
        </button>
      </div>
    </div>
  )
}