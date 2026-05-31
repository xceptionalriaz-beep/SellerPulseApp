'use client'
// components/profit/ProDashboard.tsx
// Converted 1:1 from lib/pages/pro_dashboard.dart

import { useState, useEffect, useRef } from 'react'

// ── CalculatorResult interface (matches Dart) ──────────────────
interface CalculatorResult {
  totalRevenue:      number
  totalCosts:        number
  taxAmount:         number
  ebayFee:           number
  paymentFee:        number
  adFee:             number
  totalFees:         number
  netProfit:         number
  profitMargin:      number
  roi:               number
  breakEvenPrice:    number
  activeFeeDecimal:  number
  taxMultiplier:     number
  ebayFixedFee:      number
  paymentFeeDecimal: number
  paymentFixedFee:   number
}

interface ProDashboardProps {
  currency:     string
  currentPrice: number
  result:       CalculatorResult
}

// ── KPI Card (matches Dart _buildKPICard) ─────────────────────
function KPICard({ title, value, valueColor }: { title: string; value: string; valueColor: string }) {
  return (
    <div className="flex-1 flex flex-col gap-2 px-4 py-5 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: '#E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
      <span className="text-[11px] font-bold tracking-[1px]" style={{ color: '#64748B' }}>{title}</span>
      <span className="text-[24px] font-black leading-tight" style={{ color: valueColor }}>{value}</span>
    </div>
  )
}

// ── Ledger Row (matches Dart _buildLedgerRow) ─────────────────
function LedgerRow({ label, amount, currency, isPositive = false, color }: {
  label: string; amount: number; currency: string; isPositive?: boolean; color?: string
}) {
  const displayColor = color ?? (isPositive ? '#16A34A' : '#0F172A')
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[13px] truncate flex-1" style={{ color: '#0F172A' }}>{label}</span>
      <span className="text-[14px] font-bold ml-2 shrink-0" style={{ color: displayColor }}>
        {amount === 0 ? `${currency} 0.00` : `${isPositive ? '+' : '-'}${currency}${Math.abs(amount).toFixed(2)}`}
      </span>
    </div>
  )
}

// ── Animated Donut Chart (matches Dart AnimatedDonutChart + DonutChartPainter) ──
function AnimatedDonutChart({ revenue, profit, costs, ebayFees, adFee, currency }: {
  revenue: number; profit: number; costs: number; ebayFees: number; adFee: number; currency: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animate values — matches Dart ImplicitlyAnimatedWidget
  const [animated, setAnimated] = useState({ revenue: 0, profit: 0, costs: 0, ebayFees: 0, adFee: 0 })
  const target = useRef({ revenue, profit, costs, ebayFees, adFee })
  const frame  = useRef<number>(0)
  const start  = useRef<number>(0)
  const from   = useRef({ revenue: 0, profit: 0, costs: 0, ebayFees: 0, adFee: 0 })

  useEffect(() => {
    from.current   = { ...animated }
    target.current = { revenue, profit, costs, ebayFees, adFee }
    start.current  = performance.now()
    cancelAnimationFrame(frame.current)

    function tick(now: number) {
      const t = Math.min((now - start.current) / 800, 1) // 800ms matches Dart
      const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setAnimated({
        revenue:  from.current.revenue  + (target.current.revenue  - from.current.revenue)  * ease,
        profit:   from.current.profit   + (target.current.profit   - from.current.profit)   * ease,
        costs:    from.current.costs    + (target.current.costs    - from.current.costs)    * ease,
        ebayFees: from.current.ebayFees + (target.current.ebayFees - from.current.ebayFees) * ease,
        adFee:    from.current.adFee    + (target.current.adFee    - from.current.adFee)    * ease,
      })
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [revenue, profit, costs, ebayFees, adFee])

  // Draw on canvas — matches Dart DonutChartPainter
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { revenue: rev, profit: prof, costs: co, ebayFees: ef, adFee: af } = animated
    if (rev <= 0) { ctx.clearRect(0, 0, canvas.width, canvas.height); return }

    const size = canvas.width
    const cx   = size / 2, cy = size / 2
    const sw   = 14 // strokeWidth matches Dart
    const r    = size / 2 - sw / 2

    ctx.clearRect(0, 0, size, size)

    const profitAngle   = (Math.max(prof, 0) / rev) * 2 * Math.PI
    const costsAngle    = (co  / rev) * 2 * Math.PI
    const ebayFeeAngle  = (ef  / rev) * 2 * Math.PI
    const adFeeAngle    = (af  / rev) * 2 * Math.PI

    function drawArc(start: number, angle: number, color: string) {
      ctx!.beginPath()
      ctx!.arc(cx, cy, r, start, start + angle)
      ctx!.strokeStyle = color
      ctx!.lineWidth   = sw
      ctx!.lineCap     = 'round'
      ctx!.stroke()
    }

    let start = -Math.PI / 2
    if (prof > 0) { drawArc(start, profitAngle, '#8FFF00');    start += profitAngle }
    drawArc(start, costsAngle,   '#F87171');   start += costsAngle
    drawArc(start, ebayFeeAngle, '#FB923C');   start += ebayFeeAngle
    drawArc(start, adFeeAngle,   '#818CF8')    // indigoAccent
  }, [animated])

  return (
    <div className="relative" style={{ width: 160, height: 160 }}>
      <canvas ref={canvasRef} width={160} height={160} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px]" style={{ color: '#64748B' }}>Total Rev</span>
        <span className="text-[18px] font-bold" style={{ color: '#0F172A' }}>
          {currency}{revenue.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

// ── Interactive Forecaster (matches Dart InteractiveForecaster) ──
function InteractiveForecaster({ currency, currentPrice, result }: {
  currency: string; currentPrice: number; result: CalculatorResult
}) {
  const [dragValue, setDragValue] = useState(0.5)

  const adRateDecimal = result.totalRevenue > 0 ? result.adFee / result.totalRevenue : 0

  const minPrice = result.breakEvenPrice
  const maxPrice = Math.max(currentPrice * 1.5, result.breakEvenPrice + 50)
  const simPrice = minPrice + (dragValue * (maxPrice - minPrice))

  const simEbayFee   = (simPrice * result.taxMultiplier * result.activeFeeDecimal) + result.ebayFixedFee
  const simPayPalFee = (simPrice * result.taxMultiplier * result.paymentFeeDecimal) + result.paymentFixedFee
  const simAdFee     = simPrice * adRateDecimal
  const simTotalFees = simEbayFee + simPayPalFee + simAdFee

  const simProfit = simPrice - result.totalCosts - simTotalFees
  const simMargin = simPrice > 0 ? (simProfit / simPrice) * 100 : 0

  let roiDisplay: string
  if (result.totalCosts > 0) {
    roiDisplay = `${((simProfit / result.totalCosts) * 100).toFixed(1)}%`
  } else {
    roiDisplay = simProfit > 0 ? '∞' : '0.0%'
  }

  const healthColor      = simProfit < 0 ? '#F87171' : simMargin < 15 ? '#D97706' : '#16A34A'
  const sliderTrackColor = simProfit < 0 ? '#F87171' : simMargin < 15 ? '#FBBF24' : '#8FFF00'

  function SimStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-bold" style={{ color: '#64748B' }}>{label}</span>
        <span className="text-[18px] font-black leading-tight truncate" style={{ color }}>{value}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center gap-2">
      {/* Stats row */}
      <div className="flex items-center gap-2">
        <SimStat label="Sim Price"  value={`${currency}${simPrice.toFixed(2)}`}    color="#0F172A" />
        <SimStat label="Est. Profit" value={`${currency}${simProfit.toFixed(2)}`}  color={healthColor} />
        <SimStat label="ROI"         value={roiDisplay}                            color={healthColor} />
        <SimStat label="Margin"      value={`${simMargin.toFixed(1)}%`}            color={healthColor} />
      </div>

      {/* Fee info */}
      <p className="text-[11px] italic font-medium" style={{ color: '#94A3B8' }}>
        At this price, total fees will be: {currency}{simTotalFees.toFixed(2)}
      </p>

      {/* Slider — matches Dart SliderTheme */}
      <div className="flex flex-col gap-1">
        <input type="range" min={0} max={1} step={0.001} value={dragValue}
          onChange={e => setDragValue(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            accentColor: sliderTrackColor,
            background: `linear-gradient(to right, ${sliderTrackColor} ${dragValue * 100}%, #E2E8F0 ${dragValue * 100}%)`,
            height: 8,
          }} />
        <div className="flex justify-between">
          <span className="text-[10px] font-bold" style={{ color: '#F87171' }}>Break Even Area</span>
          <span className="text-[10px] font-bold" style={{ color: '#16A34A' }}>High Profit Area</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function ProDashboard({ currency, currentPrice, result }: ProDashboardProps) {
  const safeAdRate           = result.totalRevenue > 0 ? ((result.netProfit + result.adFee) / result.totalRevenue) * 100 : 0
  const currentAdRatePercent = result.totalRevenue > 0 ? (result.adFee / result.totalRevenue) * 100 : 0
  const adDangerProgress     = safeAdRate > 0 ? Math.min(currentAdRatePercent / safeAdRate, 1.0) : 0

  // KPI values
  const netProfitVal = result.netProfit >= 0
    ? `+${currency}${result.netProfit.toFixed(2)}`
    : `-${currency}${Math.abs(result.netProfit).toFixed(2)}`
  const roiVal = result.totalCosts > 0
    ? `${result.roi.toFixed(1)}%`
    : result.netProfit > 0 ? '∞' : '0.0%'

  // Responsive — matches Dart LayoutBuilder isNarrow < 700
  const containerRef = useRef<HTMLDivElement>(null)
  const [isNarrow, setIsNarrow] = useState(false)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setIsNarrow(e.contentRect.width < 700)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col gap-4">

      {/* ROW 1: KPI Cards */}
      {isNarrow ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <KPICard title="NET PROFIT"  value={netProfitVal}                                 valueColor={result.netProfit >= 0 ? '#16A34A' : '#F87171'} />
            <KPICard title="MARGIN"      value={`${result.profitMargin.toFixed(1)}%`}         valueColor="#0F172A" />
          </div>
          <div className="flex gap-4">
            <KPICard title="ROI"         value={roiVal}                                       valueColor="#0F172A" />
            <KPICard title="BREAK EVEN"  value={`${currency}${result.breakEvenPrice.toFixed(2)}`} valueColor="#C2710C" />
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <KPICard title="NET PROFIT"  value={netProfitVal}                                 valueColor={result.netProfit >= 0 ? '#16A34A' : '#F87171'} />
          <KPICard title="MARGIN"      value={`${result.profitMargin.toFixed(1)}%`}         valueColor="#0F172A" />
          <KPICard title="ROI"         value={roiVal}                                       valueColor="#0F172A" />
          <KPICard title="BREAK EVEN"  value={`${currency}${result.breakEvenPrice.toFixed(2)}`} valueColor="#C2710C" />
        </div>
      )}

      {/* ROW 2: Revenue Split + Transaction Ledger */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: '#E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
        {isNarrow ? (
          <div className="flex flex-col gap-4">
            {/* Donut */}
            <div className="flex flex-col items-center gap-5">
              <p className="text-[11px] font-bold tracking-[1px] self-start" style={{ color: '#64748B' }}>REVENUE SPLIT</p>
              <AnimatedDonutChart currency={currency} revenue={result.totalRevenue} profit={result.netProfit} costs={result.totalCosts} ebayFees={result.ebayFee + result.paymentFee} adFee={result.adFee} />
            </div>
            <div className="h-px" style={{ backgroundColor: '#E2E8F0' }} />
            {/* Ledger */}
            <LedgerSection currency={currency} result={result} safeAdRate={safeAdRate} adDangerProgress={adDangerProgress} />
          </div>
        ) : (
          <div className="flex gap-5">
            {/* Donut — flex 4 */}
            <div className="flex flex-col gap-5" style={{ flex: 4 }}>
              <p className="text-[11px] font-bold tracking-[1px]" style={{ color: '#64748B' }}>REVENUE SPLIT</p>
              <div className="flex justify-center">
                <AnimatedDonutChart currency={currency} revenue={result.totalRevenue} profit={result.netProfit} costs={result.totalCosts} ebayFees={result.ebayFee + result.paymentFee} adFee={result.adFee} />
              </div>
            </div>
            {/* Vertical divider */}
            <div className="w-px self-stretch" style={{ backgroundColor: '#E2E8F0' }} />
            {/* Ledger — flex 5 */}
            <div style={{ flex: 5 }}>
              <LedgerSection currency={currency} result={result} safeAdRate={safeAdRate} adDangerProgress={adDangerProgress} />
            </div>
          </div>
        )}
      </div>

      {/* ROW 3: WHAT-IF FORECASTER */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: '#E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', minHeight: 220 }}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-[1px]" style={{ color: '#64748B' }}>
            WHAT-IF FORECASTER (DRAG TO TEST)
          </span>
          <div className="px-2 py-1 rounded-md" style={{ backgroundColor: '#0F172A' }}>
            <span className="text-[9px] font-bold" style={{ color: '#8FFF00' }}>INTERACTIVE</span>
          </div>
        </div>
        <InteractiveForecaster currency={currency} currentPrice={currentPrice} result={result} />
      </div>

    </div>
  )
}

// ── Ledger Section (extracted for reuse in narrow/wide layouts) ──
function LedgerSection({ currency, result, safeAdRate, adDangerProgress }: {
  currency: string; result: CalculatorResult; safeAdRate: number; adDangerProgress: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-bold tracking-[1px] mb-3" style={{ color: '#64748B' }}>TRANSACTION LEDGER</p>
      <LedgerRow label="Revenue (Price + Ship)" amount={result.totalRevenue} currency={currency} isPositive />
      <div className="h-px my-1.5" style={{ backgroundColor: '#E2E8F0' }} />
      <LedgerRow label="Item & Shipping Costs" amount={result.totalCosts} currency={currency} color="#F87171" />
      <LedgerRow label="eBay Final Value Fee"  amount={result.ebayFee}    currency={currency} color="#C2710C" />
      {result.paymentFee > 0 && (
        <LedgerRow label="PayPal Fee"           amount={result.paymentFee} currency={currency} color="#C2710C" />
      )}
      <LedgerRow label="Promoted Ad Fee"       amount={result.adFee}      currency={currency} color="#818CF8" />

      {/* AD DANGER ZONE */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold" style={{ color: '#64748B' }}>AD DANGER ZONE</span>
          <span className="text-[10px] font-bold" style={{ color: '#F87171' }}>Max Safe: {safeAdRate.toFixed(1)}%</span>
        </div>
        <div className="relative h-2.5 rounded-full overflow-hidden"
             style={{ background: 'linear-gradient(to right, #8FFF00 0%, #FACC15 60%, #F87171 100%)' }}>
          {/* Animated indicator — matches Dart AnimatedAlign */}
          <div className="absolute top-0 bottom-0 w-1 rounded-full bg-black transition-all duration-500"
               style={{ left: `${Math.max(0, adDangerProgress * 100 - 2)}%` }} />
        </div>
      </div>
    </div>
  )
}