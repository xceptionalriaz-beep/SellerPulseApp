'use client'
// components/profit/ProfitReceipt.tsx
// Converted 1:1 from lib/pages/profit_receipt.dart

import { useState, useEffect, useRef } from 'react'

// ── Props ──────────────────────────────────────────────────────
interface ProfitReceiptCardProps {
  currency:         string
  totalRevenue:     number
  totalCosts:       number
  calculatedEbayFee: number
  adFeeAmount:      number
  taxRate:          number
  taxAmount:        number
  totalFeeNoStore:  number
  totalFeeStore:    number
  netProfit:        number
  profitMargin:     number
  roi:              number
  breakEvenPrice:   number
  salePrice:        number
}

// ── Badge helpers (matches Dart _getBadge* methods) ────────────
function getBadgeBorderColor(margin: number) {
  return margin > 30 ? '#8FFF00' : margin >= 15 ? '#FB923C' : '#F87171'
}
function getBadgeBgColor(margin: number) {
  return margin > 30 ? '#8FFF001A' : margin >= 15 ? '#FB923C1A' : '#F871711A'
}
function getBadgeTextColor(margin: number) {
  return margin > 30 ? '#000000' : margin >= 15 ? '#FB923C' : '#F87171'
}
function getBadgeText(margin: number) {
  return margin > 30 ? '🔥 HIGH POTENTIAL' : margin >= 15 ? '⚖️ BALANCED' : '⚠️ RISKY MARGIN'
}

// ── Donut Chart (matches Dart DonutChartPainter) ───────────────
function DonutChart({ revenue, profit, costs, fees }: { revenue: number; profit: number; costs: number; fees: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || revenue <= 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size   = canvas.width
    const cx     = size / 2
    const cy     = size / 2
    const radius = size / 2 - 6
    ctx.clearRect(0, 0, size, size)

    const profitAngle = (Math.max(profit, 0) / revenue) * 2 * Math.PI
    const costsAngle  = (costs  / revenue) * 2 * Math.PI
    const feesAngle   = (fees   / revenue) * 2 * Math.PI

    const drawArc = (start: number, angle: number, color: string) => {
      ctx.beginPath()
      ctx.arc(cx, cy, radius, start, start + angle)
      ctx.strokeStyle = color
      ctx.lineWidth   = 10
      ctx.lineCap     = 'round'
      ctx.stroke()
    }

    let start = -Math.PI / 2
    if (profit > 0) { drawArc(start, profitAngle, '#8FFF00'); start += profitAngle }
    drawArc(start, costsAngle, '#F87171'); start += costsAngle
    drawArc(start, feesAngle, '#FB923C')
  }, [revenue, profit, costs, fees])

  return (
    <div className="relative" style={{ width: 100, height: 100 }}>
      <canvas ref={canvasRef} width={100} height={100} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px]" style={{ color: '#64748B' }}>Total Rev</span>
        <span className="text-[13px] font-bold" style={{ color: '#1E293B' }}>
          {/* currency injected by parent */}
        </span>
      </div>
    </div>
  )
}

// ── Best Offer Curve (matches Dart BestOfferLineChartPainter) ──
function BestOfferCurve({ breakEvenPrice, currentPrice, currentProfit, currency }: { breakEvenPrice: number; currentPrice: number; currentProfit: number; currency: string }) {
  if (currentPrice <= 0 || breakEvenPrice <= 0 || currentPrice <= breakEvenPrice) return null

  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.5px] mb-1" style={{ color: '#64748B' }}>BEST OFFER STRATEGY CURVE</p>
      <div className="relative" style={{ height: 50 }}>
        <svg width="100%" height="50" className="overflow-visible">
          {/* Dashed baseline */}
          <line x1="0" y1="48" x2="100%" y2="48" stroke="#F8717166" strokeWidth="1" strokeDasharray="4 4" />
          {/* Profit curve */}
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8FFF00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8FFF00" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 48 Q 40% 38 100% 4" fill="none" stroke="#8FFF00" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 0 48 Q 40% 38 100% 4 L 100% 48 Z" fill="url(#curveGrad)" />
          {/* Endpoint dot */}
          <circle cx="100%" cy="4" r="4" fill="#1E293B" />
          <circle cx="100%" cy="4" r="4" fill="none" stroke="#8FFF00" strokeWidth="2" />
        </svg>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] font-bold" style={{ color: '#F87171' }}>Break Even ({currency}{breakEvenPrice.toFixed(2)})</span>
        <span className="text-[8px] font-bold" style={{ color: '#16A34A' }}>Current Price ({currency}{currentPrice.toFixed(2)})</span>
      </div>
    </div>
  )
}

// ── Volume Card (matches Dart _buildVolumeCard) ────────────────
function VolumeCard({ label, projectedProfit, currency }: { label: string; projectedProfit: number; currency: string }) {
  const isPositive = projectedProfit >= 0
  return (
    <div className="flex-1 flex flex-col items-center py-1.5 rounded-md border"
         style={{
           backgroundColor: isPositive ? '#8FFF0014' : '#F8717114',
           borderColor:     isPositive ? '#8FFF00'   : '#F87171',
         }}>
      <span className="text-[9px] font-bold" style={{ color: '#64748B' }}>{label}</span>
      <span className="text-[12px] font-black" style={{ color: isPositive ? '#16A34A' : '#F87171' }}>
        {isPositive ? '+' : '-'}{currency}{Math.abs(projectedProfit).toFixed(0)}
      </span>
    </div>
  )
}

// ── Stat Block (matches Dart _buildStatBlock) ──────────────────
function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] font-bold tracking-[0.5px]" style={{ color: '#64748B' }}>{label}</span>
      <span className="text-[13px] font-bold mt-0.5" style={{ color: '#1E293B' }}>{value}</span>
    </div>
  )
}

// ── Receipt Row (matches Dart _buildReceiptRow) ────────────────
function ReceiptRow({ label, amount, currency, isPositive = false, color }: { label: string; amount: number; currency: string; isPositive?: boolean; color?: string }) {
  const displayColor = color ?? (isPositive ? '#16A34A' : '#1E293B')
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[11px]" style={{ color: '#64748B' }}>{label}</span>
      <span className="text-[12px] font-bold" style={{ color: displayColor }}>
        {amount === 0 ? `${currency} 0.00` : `${isPositive ? '+' : '-'}${currency}${Math.abs(amount).toFixed(2)}`}
      </span>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function ProfitReceiptCard({
  currency, totalRevenue, totalCosts, calculatedEbayFee, adFeeAmount,
  taxRate, taxAmount, totalFeeNoStore, totalFeeStore,
  netProfit, profitMargin, roi, breakEvenPrice, salePrice,
}: ProfitReceiptCardProps) {

  const [showShopify, setShowShopify] = useState(false)

  // Shopify comparison (matches Dart inline vars)
  const shopifyFeePercent    = 2.9
  const shopifyFixedFee      = 0.30
  const shopifyCalculatedFee = totalRevenue > 0 ? (totalRevenue * (shopifyFeePercent / 100)) + shopifyFixedFee : 0.0
  const shopifyTotalFees     = shopifyCalculatedFee
  const shopifyNetProfit     = totalRevenue - totalCosts - shopifyTotalFees
  const shopifyMargin        = totalRevenue > 0 ? (shopifyNetProfit / totalRevenue) * 100 : 0.0

  const profitBeforeAds      = netProfit + adFeeAmount
  const maxSafeAdRate        = totalRevenue > 0 ? (profitBeforeAds / totalRevenue) * 100 : 0.0
  const currentAdRatePercent = totalRevenue > 0 ? (adFeeAmount / totalRevenue) * 100 : 0.0
  const adDangerProgress     = maxSafeAdRate > 0 ? Math.min(currentAdRatePercent / maxSafeAdRate, 1.0) : 0.0

  const activeEbayFee  = showShopify ? shopifyCalculatedFee : calculatedEbayFee
  const activeTotalFees = showShopify ? shopifyTotalFees : (calculatedEbayFee + adFeeAmount)
  const activeNetProfit = showShopify ? shopifyNetProfit  : netProfit

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border"
         style={{
           backgroundColor: '#fff',
           borderColor: '#E2E8F0',
           boxShadow: '0 10px 20px rgba(0,0,0,0.04)',
         }}>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[1px]" style={{ color: '#1E293B' }}>TRANSACTION BREAKDOWN</span>
        <div className="px-2.5 py-1 rounded-full border text-[9px] font-black"
             style={{ backgroundColor: getBadgeBgColor(profitMargin), borderColor: getBadgeBorderColor(profitMargin), color: getBadgeTextColor(profitMargin), borderWidth: 1.5 }}>
          {getBadgeText(profitMargin)}
        </div>
      </div>

      {/* SHOPIFY TOGGLE */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl"
           style={{ backgroundColor: '#F8FAFC' }}>
        <span className="text-[11px] font-semibold" style={{ color: '#1E293B' }}>Compare with Shopify/Stripe</span>
        <button onClick={() => setShowShopify(s => !s)}
          className="relative w-9 h-5 rounded-full transition-colors"
          style={{ backgroundColor: showShopify ? '#8FFF00' : '#CBD5E1' }}>
          <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                style={{ left: showShopify ? '18px' : '2px' }} />
        </button>
      </div>

      {/* DONUT CHART + RECEIPT SIDE BY SIDE */}
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
          <DonutChartSVG
            revenue={totalRevenue}
            profit={activeNetProfit}
            costs={totalCosts}
            fees={activeTotalFees}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px]" style={{ color: '#64748B' }}>Total Rev</span>
            <span className="text-[13px] font-bold" style={{ color: '#1E293B' }}>{currency}{totalRevenue.toFixed(2)}</span>
          </div>
        </div>
        {/* Receipt list */}
        <div className="flex-1 flex flex-col gap-0">
          <ReceiptRow label="Rev (Price+Ship)" amount={totalRevenue} currency={currency} isPositive />
          <div className="h-px my-1" style={{ backgroundColor: '#E2E8F0' }} />
          <ReceiptRow label="Item & Shipping" amount={totalCosts} currency={currency} color="#F87171" />
          <ReceiptRow label={showShopify ? 'Shopify Fee' : 'eBay Fee'} amount={activeEbayFee} currency={currency} color="#C2710C" />
          {!showShopify && <ReceiptRow label="Promoted Ad" amount={adFeeAmount} currency={currency} color="#C2710C" />}
          <ReceiptRow label={`Sales Tax (${taxRate}%)`} amount={taxAmount} currency={currency} color="#94A3B8" />
        </div>
      </div>

      {/* BEST OFFER STRATEGY CURVE */}
      <BestOfferCurve
        breakEvenPrice={breakEvenPrice}
        currentPrice={salePrice}
        currentProfit={activeNetProfit}
        currency={currency}
      />

      {/* VOLUME PROJECTION + AD DANGER */}
      <div className="flex gap-4 items-start">
        {/* Volume */}
        <div className="flex flex-col gap-1.5" style={{ flex: 5 }}>
          <p className="text-[9px] font-bold tracking-[0.5px]" style={{ color: '#64748B' }}>VOLUME PROJECTION</p>
          <div className="flex gap-1">
            <VolumeCard label="10x" projectedProfit={activeNetProfit * 10}  currency={currency} />
            <VolumeCard label="50x" projectedProfit={activeNetProfit * 50}  currency={currency} />
          </div>
        </div>
        {/* Ad danger bar */}
        {!showShopify && (
          <div className="flex flex-col gap-1.5" style={{ flex: 4 }}>
            <p className="text-[9px] font-bold tracking-[0.5px]" style={{ color: '#F87171' }}>
              MAX AD RATE: {maxSafeAdRate.toFixed(1)}%
            </p>
            <div className="relative h-2.5 rounded-full overflow-hidden"
                 style={{ background: 'linear-gradient(to right, #8FFF00, #FACC15, #F87171)' }}>
              {/* Position indicator */}
              <div className="absolute top-0 bottom-0 w-1 rounded-full bg-black transition-all"
                   style={{ left: `${Math.max(0, adDangerProgress * 100 - 2)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM DASHBOARD */}
      <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border"
           style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
        <span className="text-[10px] font-bold tracking-[1px]" style={{ color: '#64748B' }}>NET PROFIT</span>
        <span className="text-[32px] font-black leading-none"
              style={{ color: activeNetProfit >= 0 ? '#16A34A' : '#F87171' }}>
          {activeNetProfit >= 0
            ? `+${currency}${activeNetProfit.toFixed(2)}`
            : `-${currency}${Math.abs(activeNetProfit).toFixed(2)}`}
        </span>
        <div className="flex items-center gap-4 w-full justify-around mt-1">
          <StatBlock label="MARGIN"     value={`${(showShopify ? shopifyMargin   : profitMargin).toFixed(1)}%`} />
          <div className="h-5 w-px" style={{ backgroundColor: '#E2E8F0' }} />
          <StatBlock label="ROI"        value={`${(showShopify ? shopifyNetProfit : roi).toFixed(1)}%`} />
          <div className="h-5 w-px" style={{ backgroundColor: '#E2E8F0' }} />
          <StatBlock label="BREAK EVEN" value={`${currency}${breakEvenPrice.toFixed(2)}`} />
        </div>
      </div>

    </div>
  )
}

// ── Donut SVG (replaces Canvas — same visual output) ──────────
function DonutChartSVG({ revenue, profit, costs, fees }: { revenue: number; profit: number; costs: number; fees: number }) {
  if (revenue <= 0) return <svg width="100" height="100" />

  const cx = 50, cy = 50, r = 44, stroke = 10
  const circumference = 2 * Math.PI * r

  const profitPct = Math.max(profit, 0) / revenue
  const costsPct  = costs  / revenue
  const feesPct   = fees   / revenue

  function arc(pct: number, offset: number, color: string) {
    const dash = pct * circumference
    return (
      <circle cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={circumference * (0.25 - offset)}
        strokeLinecap="round" />
    )
  }

  let offset = 0
  const profitEl = profitPct > 0 ? arc(profitPct, offset, '#8FFF00') : null; offset += profitPct
  const costsEl  = arc(costsPct,  offset, '#F87171'); offset += costsPct
  const feesEl   = arc(feesPct,   offset, '#FB923C')

  return (
    <svg width="100" height="100" style={{ transform: 'rotate(0deg)' }}>
      {profitEl}{costsEl}{feesEl}
    </svg>
  )
}