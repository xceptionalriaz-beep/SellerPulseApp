'use client'
// app/dashboard/title-builder/components/TbProHud.tsx
// Converted 1:1 from lib/pages/title_builder/tb_pro_hud.dart

import { useEffect, useRef } from 'react'
import { ShieldCheck, AlertTriangle, Tag, Gauge, BarChart2, Info } from 'lucide-react'

const C = { dark: '#1a2410', lime: '#8FFF00', white10: 'rgba(255,255,255,0.1)' }

interface Props {
  veroCount:    number
  currentTitle: string
  timeframe:    string
  saturScore:   number   // from MarketProvider
  trendData:    number[] // from MarketProvider
  isLoading:    boolean  // from MarketProvider
}

// â”€â”€ Icon badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function IconBadge({ icon: Icon, color }: { icon: React.ElementType; color: string }) {
  return (
    <div className="p-1.5 rounded-md border shrink-0"
         style={{ backgroundColor: color + '1A', borderColor: color + '33' }}>
      <Icon size={13} style={{ color }} />
    </div>
  )
}

// â”€â”€ HUD row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HudRow({ icon, label, children, tooltip }: {
  icon: React.ReactNode; label: string; children: React.ReactNode; tooltip?: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div className="flex items-center gap-1 shrink-0" style={{ width: 105 }}>
        <p className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
        {tooltip && (
          <div title={tooltip}>
            <Info size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

// â”€â”€ Inline saturation meter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function InlineSaturMeter({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold mb-1.5"
         style={{ color, fontStyle: score === 0 ? 'italic' : 'normal' }}>{label}</p>
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ width: '100%' }}>
        {/* Gradient track */}
        <div className="absolute inset-0 rounded-full"
             style={{ background: score === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(to right, #8FFF00, #F97316, #EF4444)' }} />
        {/* White thumb indicator */}
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#0F172A] bg-white transition-all duration-500 shadow-md"
             style={{ left: `calc(${Math.min(score, 1) * 100}% - 6px)` }} />
      </div>
    </div>
  )
}

// â”€â”€ Smart specifics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SmartSpecifics({ title, isEmpty }: { title: string; isEmpty: boolean }) {
  if (isEmpty || !title.trim()) {
    return <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.24)' }}>Awaiting Search...</p>
  }
  const stopWords = new Set(['for','with','and','the','in','on','a','to','of','genuine','new','original','fast'])
  const tags = title.replace(/[^\w\s\-]/g, '').split(/\s+/)
    .filter(w => w && !stopWords.has(w.toLowerCase()))
    .slice(0, 3)

  if (!tags.length) return <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.24)' }}>No specifics found</p>

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, i) => (
        <span key={i} className="px-2 py-1 rounded text-[11px] font-bold text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          {tag[0].toUpperCase() + tag.slice(1)}
        </span>
      ))}
    </div>
  )
}

// â”€â”€ Word chip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function WordChip({ word, percent }: { word: string; percent: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded border"
         style={{ backgroundColor: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.3)' }}>
      <span className="text-[11px] font-bold" style={{ color: '#FB923C' }}>{word}</span>
      <span className="text-[10px]" style={{ color: '#FDBA74' }}>({percent})</span>
    </div>
  )
}

// â”€â”€ Hero chart (matches Dart _HeroLinePainter + _animatedHeroChart) â”€â”€
function HeroChart({ data, isEmpty }: { data: number[]; isEmpty: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx    = canvas.getContext('2d'); if (!ctx) return
    const W = canvas.width, H = canvas.height

    if (!data.length) return
    ctx.clearRect(0, 0, W, H)

    const maxD  = Math.max(...data)
    const minD  = Math.min(...data)
    const range = maxD - minD === 0 ? 1 : maxD - minD
    const step  = W / (data.length - 1)

    // Build path â€” matches Dart cubic bezier
    const pts = data.map((v, i) => ({
      x: i * step,
      y: H * 0.9 - ((v - minD) / range) * (H * 0.8),
    }))

    const path = new Path2D()
    path.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      path.bezierCurveTo(prev.x + step/2, prev.y, curr.x - step/2, curr.y, curr.x, curr.y)
    }

    const primaryColor = isEmpty ? 'rgba(255,255,255,0.15)' : '#8FFF00'

    // Fill gradient
    const fill = new Path2D(path)
    fill.lineTo(W, H); fill.lineTo(0, H); fill.closePath()
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, isEmpty ? 'rgba(255,255,255,0.1)' : 'rgba(143,255,0,0.5)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fill(fill)

    // Line
    ctx.strokeStyle = primaryColor
    ctx.lineWidth   = 2.5
    ctx.lineCap     = 'round'
    ctx.stroke(path)
  }, [data, isEmpty])

  return <canvas ref={canvasRef} width={400} height={60} className="w-full h-full" />
}

// â”€â”€ Main TbProHud â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function TbProHud({ veroCount, currentTitle, timeframe, saturScore, trendData, isLoading }: Props) {
  const isEmpty  = !currentTitle.trim()
  const isSafe   = veroCount === 0
  const standby  = isEmpty || isLoading

  // Chart data â€” matches Dart logic
  const chartData  = (isEmpty || isLoading || !trendData.length) ? [0,0,0,0,0,0,0,0] : trendData
  const peakText   = isEmpty || isLoading ? (isLoading ? '(ANALYZING...)' : '(--)') :
    timeframe === '7D' ? '(Peak Thursday)' : timeframe === '12M' ? '(Peak Nov)' : '(Peak Day 14)'

  // Competition â€” matches Dart saturScore logic
  let saturLabel = 'Awaiting Search...'
  let saturColor = 'rgba(255,255,255,0.38)'
  if (isLoading)       { saturLabel = 'Analyzing Market...'; saturColor = '#22D3EE' }
  else if (!isEmpty)   {
    if      (saturScore > 0.70) { saturLabel = 'High (Saturated)';   saturColor = '#F87171' }
    else if (saturScore > 0.40) { saturLabel = 'Moderate Comp.';     saturColor = '#FB923C' }
    else                        { saturLabel = 'Low (Opportunity)';  saturColor = '#8FFF00' }
  }

  const activeIconColor = standby ? 'rgba(255,255,255,0.24)' : C.lime

  return (
    <div className="p-5 rounded-2xl border"
         style={{ backgroundColor: C.dark, borderColor: 'rgba(255,255,255,0.05)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold tracking-[1px]" style={{ color: 'rgba(255,255,255,0.54)' }}>
          PRO CHARTS & SAFETY HUD
        </p>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full"
               style={{
                 backgroundColor: standby ? 'rgba(255,255,255,0.38)' : C.lime,
                 boxShadow: standby ? 'none' : `0 0 4px rgba(143,255,0,0.5)`,
               }} />
          <p className="text-[10px] font-bold" style={{ color: standby ? 'rgba(255,255,255,0.38)' : C.lime }}>
            {standby ? 'STANDBY' : 'LIVE'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* 1. VeRO Risk */}
        <HudRow
          icon={<IconBadge icon={isSafe ? ShieldCheck : AlertTriangle} color={isEmpty ? 'rgba(255,255,255,0.24)' : isSafe ? C.lime : '#F87171'} />}
          label="VeRO Risk:"
          tooltip="Account Safety Check.\nShows if this brand often takes down eBay listings.">
          {isEmpty
            ? <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.38)' }}>Awaiting Search...</p>
            : <p className="text-[13px] font-black" style={{ color: isSafe ? C.lime : '#F87171' }}>
                {isSafe ? 'SECURE (0 flags)' : `HIGH RISK (${veroCount} flags)`}
              </p>}
        </HudRow>

        <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

        {/* 2. Specifics */}
        <HudRow
          icon={<IconBadge icon={Tag} color={activeIconColor} />}
          label="Specifics:"
          tooltip="Key item details.\nAutomatically finds the Brand, Model, or Color.">
          {isLoading
            ? <p className="text-[11px] italic" style={{ color: '#22D3EE' }}>Analyzing...</p>
            : <SmartSpecifics title={currentTitle} isEmpty={isEmpty} />}
        </HudRow>

        <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

        {/* 3. Competition */}
        <HudRow
          icon={<IconBadge icon={Gauge} color={activeIconColor} />}
          label="Competition:"
          tooltip="How easy it is to rank.\nGreen means high buyer demand and low competition.">
          <InlineSaturMeter score={saturScore} label={saturLabel} color={saturColor} />
        </HudRow>

        <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

        {/* 4. Top Words */}
        <HudRow
          icon={<IconBadge icon={BarChart2} color={activeIconColor} />}
          label="Top Words:"
          tooltip="The most profitable keywords.\nPercentages show how much they drive sales.">
          {isEmpty || isLoading
            ? <p className="text-[11px] italic" style={{ color: isLoading ? '#22D3EE' : 'rgba(255,255,255,0.38)' }}>
                {isLoading ? 'Analyzing Data...' : 'Awaiting Search...'}
              </p>
            : <div className="flex flex-wrap gap-1.5">
                <WordChip word="1. Fast" percent="85%" />
                <WordChip word="2. OEM"  percent="60%" />
              </div>}
        </HudRow>
      </div>

      {/* 5. Trend Visualizer */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {timeframe} Trend Visualizer
          </p>
          <p className="text-[10px] font-bold"
             style={{ color: standby ? 'rgba(255,255,255,0.38)' : C.lime }}>
            {peakText}
          </p>
        </div>
        <div className="border-b" style={{ height: 60, borderColor: 'rgba(255,255,255,0.05)' }}>
          <HeroChart data={chartData} isEmpty={standby} />
        </div>
      </div>
    </div>
  )
}
