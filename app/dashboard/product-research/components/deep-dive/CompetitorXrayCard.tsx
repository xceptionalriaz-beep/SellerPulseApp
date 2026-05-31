'use client'
// app/dashboard/product-research/components/deep-dive/CompetitorXrayCard.tsx
// Converted 1:1 from lib/pages/product_research/deep_dive/widgets/competitor_xray_card.dart

import { ScanLine, Tag, Flame, Target, Mouse } from 'lucide-react'
import NeonIcon from '../shared/NeonIcon'

const C = { text: '#1E293B', muted: '#64748B', border: '#E5E7EB', bg: '#F8FAFC' }

interface Props {
  title:    string
  price:    string
  imageUrl: string
  seller:   string
}

// ── Info row (matches Dart _buildInfoRow) ─────────────────────
function InfoRow({ icon: Icon, label, value, valueColor }: {
  icon: React.ElementType; label: string; value: string; valueColor?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} style={{ color: C.muted }} />
      <span className="text-[13px]" style={{ color: C.muted }}>{label}</span>
      <span className="flex-1 text-[13px] font-bold truncate" style={{ color: valueColor ?? C.text }}>{value}</span>
    </div>
  )
}

export default function CompetitorXrayCard({ title, price, imageUrl, seller }: Props) {
  return (
    <div className="flex flex-col h-full p-5 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 5px 10px rgba(0,0,0,0.02)' }}>

      {/* Header — matches Dart Row NeonIcon + title */}
      <div className="flex items-center gap-2.5 mb-5">
        <NeonIcon icon={ScanLine} />
        <p className="text-[16px] font-bold" style={{ color: C.text }}>Competitor X-Ray</p>
      </div>

      {/* Content — matches Dart Expanded Column */}
      <div className="flex flex-col flex-1 justify-center gap-4">

        {/* Product image + title + seller */}
        <div className="flex gap-4 items-start">
          <div className="shrink-0 rounded-xl border overflow-hidden"
               style={{ width: 80, height: 80, backgroundColor: C.bg, borderColor: C.border }}>
            {imageUrl ? (
              <img src={imageUrl} className="w-full h-full object-cover"
                   onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Mouse size={36} style={{ color: C.muted }} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold line-clamp-2" style={{ color: C.text }}>{title}</p>
            <p className="text-[13px] mt-1 underline" style={{ color: '#3B82F6' }}>Seller: {seller}</p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Info rows — matches Dart _buildInfoRow × 3 */}
        <div className="flex flex-col gap-2.5">
          <InfoRow icon={Tag}    label="Sold Price:"      value={price}                                       />
          <InfoRow icon={Flame}  label="Demand:"          value="EXTREME (Top 1%)"  valueColor="#C2410C"      />
          <InfoRow icon={Target} label="Listing Quality:" value="C (Beat them!)"    valueColor="#15803D"      />
        </div>
      </div>
    </div>
  )
}