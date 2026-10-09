'use client'
// app/dashboard/product-research/components/deep-dive/SourcingIntelCard.tsx
// Converted 1:1 from lib/pages/product_research/deep_dive/widgets/sourcing_intel_card.dart

import { useState } from 'react'
import { Globe, Package, AlertTriangle, Key, ShoppingBag } from 'lucide-react'
import NeonIcon from '../shared/NeonIcon'

const C = { text: '#1E293B', muted: '#64748B', border: '#E5E7EB' }

interface Props {
  stockLeft: string
  veroRisk:  string
  keywords:  string
}

// â”€â”€ Info row (matches Dart _buildInfoRow) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Animated source button (matches Dart _AnimatedSourceButton) â”€â”€
function AnimatedSourceButton({ domain, price, color }: { domain: string; price: string; color: string }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => window.open(`https://${domain}`, '_blank')}
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all"
      style={{
        backgroundColor: color + '14',
        borderColor:     color + (hover ? 'CC' : '66'),
        borderWidth:     hover ? 2 : 1,
        transform:       hover ? 'scale(1.08)' : 'scale(1)',
        transitionDuration: '150ms',
      }}>
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        width={16} height={16}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <span className="text-[13px] font-bold" style={{ color }}>{price}</span>
    </button>
  )
}

export default function SourcingIntelCard({ stockLeft, veroRisk, keywords }: Props) {
  const veroColor = veroRisk.includes('HIGH') ? '#F87171' : '#22C55E'

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 5px 10px rgba(0,0,0,0.02)' }}>

      {/* Header â€” matches Dart Row NeonIcon + title */}
      <div className="flex items-center gap-2.5 mb-5">
        <NeonIcon icon={Globe} />
        <p className="text-[16px] font-bold" style={{ color: C.text }}>Sourcing & Intel</p>
      </div>

      {/* Content â€” matches Dart Expanded Column */}
      <div className="flex flex-col flex-1">

        {/* Source buttons */}
        <p className="text-[12px] font-bold mb-2" style={{ color: C.muted }}>Matches (Click to open):</p>
        <div className="flex justify-between gap-2">
          <AnimatedSourceButton domain="amazon.com"    price="$24.00" color="#F97316" />
          <AnimatedSourceButton domain="walmart.com"   price="$25.50" color="#3B82F6" />
          <AnimatedSourceButton domain="aliexpress.com" price="$22.00" color="#EF4444" />
        </div>

        {/* Spacer + divider + spacer */}
        <div className="flex-1" />
        <div className="h-px my-3" style={{ backgroundColor: C.border }} />
        <div className="flex-1" />

        {/* Info rows */}
        <div className="flex flex-col gap-3">
          <InfoRow icon={Package}       label="Stock Spy:"    value={stockLeft}  valueColor="#F87171" />
          <InfoRow icon={AlertTriangle} label="VERO Risk:"    value={veroRisk}   valueColor={veroColor} />
          <InfoRow icon={Key}           label="Top Keywords:" value={keywords}   />
        </div>
      </div>
    </div>
  )
}
