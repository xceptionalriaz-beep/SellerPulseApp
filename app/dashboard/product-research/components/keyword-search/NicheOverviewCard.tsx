'use client'
// app/dashboard/product-research/components/keyword-search/NicheOverviewCard.tsx
// Converted 1:1 from lib/pages/product_research/keyword_search/widgets/niche_overview_card.dart

import { DollarSign, Tag, Package, Target, Rocket, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react'

const C = {
  muted:  '#64748B',
  hint:   '#94A3B8',
  text:   '#1E293B',
  border: '#F3F4F6',
  divider:'#F1F5F9',
}

interface Props {
  marketVol?:       string   // default "$0"
  avgPrice?:        string   // default "$0"
  successRate?:     string   // default "0%"
  totalActive?:     string   // default "0"
  successColor?:    string   // default grey
  saturationScore?: number   // default 0.0
  adInsight?:       string   // default "Analyzing..."
}

// â”€â”€ Niche stat row (matches Dart _buildNicheStatRow) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NicheStatRow({ icon: Icon, label, value, valueColor }: {
  icon: React.ElementType; label: string; value: string; valueColor?: string
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={13} style={{ color: C.hint }} />
      <span className="text-[11px]" style={{ color: C.muted }}>{label}</span>
      <div className="flex-1" />
      <span className="text-[11px] font-bold" style={{ color: valueColor ?? C.text }}>{value}</span>
    </div>
  )
}

export default function NicheOverviewCard({
  marketVol       = '$0',
  avgPrice        = '$0',
  successRate     = '0%',
  totalActive     = '0',
  successColor    = '#9CA3AF',
  saturationScore = 0,
  adInsight       = 'Analyzing...',
}: Props) {

  // Parse sentiment badge â€” matches Dart successRate.split(" (") logic
  let strPercentage  = successRate
  let sentimentBadge = ''
  if (successRate.includes(' (')) {
    const parts    = successRate.split(' (')
    strPercentage  = parts[0]
    sentimentBadge = parts[1].replace(')', '')
  }

  // Saturation color â€” matches Dart satColor logic
  const satColor = saturationScore > 75 ? '#EF4444'
    : saturationScore > 40 ? '#F97316'
    : '#22C55E'

  // Sentiment icon â€” matches Dart icon logic
  const SentimentIcon = sentimentBadge.includes('BULLISH') ? Rocket
    : sentimentBadge.includes('RISK') ? AlertTriangle
    : TrendingUp

  return (
    <div className="flex flex-col p-3 rounded-2xl border h-full"
         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>

      {/* Section label */}
      <p className="text-[11px] font-bold tracking-[1.1px] mb-2" style={{ color: C.muted }}>
        ðŸ“Š NICHE OVERVIEW
      </p>

      {/* AI Sentiment pill â€” only shown if badge exists */}
      {sentimentBadge && (
        <div className="flex items-center justify-center gap-1 py-1.5 rounded-lg border mb-2"
             style={{
               backgroundColor: successColor + '14',
               borderColor:     successColor + '51',
             }}>
          <SentimentIcon size={11} style={{ color: successColor }} />
          <span className="text-[11px] font-black" style={{ color: successColor }}>{sentimentBadge}</span>
        </div>
      )}

      {/* Core stats */}
      <NicheStatRow icon={DollarSign} label="Market Vol:"       value={marketVol}      />
      <NicheStatRow icon={Tag}        label="Avg Price:"         value={avgPrice}       />
      <NicheStatRow icon={Package}    label="Total Active:"      value={totalActive}    />
      <NicheStatRow icon={Target}     label="Success (STR):"     value={strPercentage}  valueColor={successColor} />

      {/* Spacer â€” pushes competition map to bottom */}
      <div className="flex-1" />

      <div className="h-px my-2" style={{ backgroundColor: C.divider }} />

      {/* Competitor saturation map */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-bold" style={{ color: C.muted }}>Competition Density</p>
          <p className="text-[9px] font-black" style={{ color: satColor }}>
            {saturationScore.toFixed(0)}/100
          </p>
        </div>

        {/* Progress bar â€” matches Dart FractionallySizedBox */}
        <div className="relative h-1 rounded-full overflow-hidden mb-1"
             style={{ backgroundColor: '#E5E7EB' }}>
          <div className="absolute left-0 top-0 h-full rounded-full transition-all"
               style={{ width: `${Math.min(saturationScore, 100)}%`, backgroundColor: satColor }} />
        </div>

        {/* Ad insight */}
        <div className="flex items-center gap-1">
          <Lightbulb size={9} style={{ color: '#F59E0B', flexShrink: 0 }} />
          <p className="text-[8px] italic truncate" style={{ color: C.hint }}>{adInsight}</p>
        </div>
      </div>
    </div>
  )
}
