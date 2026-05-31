'use client'
// app/dashboard/product-research/components/keyword-search/IntelligenceRow.tsx
// Converted 1:1 from lib/pages/product_research/keyword_search/widgets/intelligence_row.dart

import { useState, useEffect, useRef } from 'react'
import { ShoppingBag, Eye, Bookmark, Radar, Star, AlertTriangle, ShoppingCart, Image as ImageIcon } from 'lucide-react'
import { ProfitSettings } from '../keyword-search/ProfitSettingsDialog'

const C = {
  lime:   '#8FFF00',
  dark:   '#0F172A',
  text:   '#1E293B',
  muted:  '#94A3B8',
  border: '#F1F5F9',
}

interface VeroMatch {
  triggered_word?: string
  brand_name?:     string
  severity?:       string
}

interface Props {
  itemId:                   string
  isSelected:               boolean
  onSelect:                 (v: boolean) => void
  onProfitChanged?:         (v: number) => void
  onPulseCheck?:            () => void
  imageUrl:                 string
  title:                    string
  price:                    string
  sellerUsername:           string
  sellerFeedbackScore:      number
  itemLocationCountry:      string
  sellerRegisteredCountry:  string
  totalActiveListings:      number
  itemWebUrl?:              string
  totalSold:                number
  lastSoldDate:             string
  watchCount:               number
  veroMatches:              VeroMatch[]
  categoryPath:             string
  priceTrend:               string
  upc?:                     string
  aiVelocity:               number
  riskScore:                string
  demandHeat:               number
  profitSettings:           ProfitSettings
}

// ── Flag image using flagcdn.com API ─────────────────────────
function FlagImg({ code }: { code: string }) {
  const c = (code === 'UK' ? 'GB' : code).toLowerCase().trim()
  if (!c || c.length !== 2) return <span className="text-[13px]">🏳️</span>
  return (
    <img
      src={`https://flagcdn.com/w20/${c}.png`}
      srcSet={`https://flagcdn.com/w40/${c}.png 2x`}
      width={20} height={14}
      alt={code}
      className="rounded-sm shrink-0"
      style={{ objectFit: 'cover' }}
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

// ── VeRO severity color (matches Dart _getVeroColor) ─────────
function getVeroColor(severity: string): string {
  const s = severity.toLowerCase()
  if (s.includes('critical') || s.includes('ban')) return '#EF4444'
  if (s.includes('high'))                           return '#F97316'
  if (s.includes('caution') || s.includes('yellow'))return '#F59E0B'
  return '#EF4444'
}

// ── Smart title with VeRO inline badges (matches Dart _buildSmartTitle) ──
function SmartTitle({ title, veroMatches }: { title: string; veroMatches: VeroMatch[] }) {
  if (!veroMatches.length) {
    return <p className="text-[11px] font-bold line-clamp-2" style={{ color: C.text, lineHeight: 1.4 }}>{title}</p>
  }

  const lower = title.toLowerCase()
  const found: { start: number; end: number; match: VeroMatch; originalText: string }[] = []

  for (const m of veroMatches) {
    const tw = (m.triggered_word ?? '').toLowerCase()
    if (!tw) continue
    let idx = 0
    while (true) {
      const i = lower.indexOf(tw, idx)
      if (i === -1) break
      found.push({ start: i, end: i + tw.length, match: m, originalText: title.slice(i, i + tw.length) })
      idx = i + tw.length
    }
  }

  found.sort((a, b) => a.start - b.start)
  const clean: typeof found = []
  let lastEnd = 0
  for (const f of found) {
    if (f.start >= lastEnd) { clean.push(f); lastEnd = f.end }
  }

  const parts: React.ReactNode[] = []
  let cur = 0
  for (const f of clean) {
    if (f.start > cur) parts.push(<span key={`t${cur}`}>{title.slice(cur, f.start)}</span>)
    const color = getVeroColor(f.match.severity ?? '')
    parts.push(
      <span key={`v${f.start}`}
        className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded border mx-0.5 align-middle"
        style={{ backgroundColor: color + '19', borderColor: color + '51' }}
        title={`Brand: ${f.match.brand_name}\nRisk: ${f.match.severity}`}>
        <span className="text-[11px] font-black" style={{ color }}>{f.originalText}</span>
        <AlertTriangle size={9} style={{ color }} />
      </span>
    )
    cur = f.end
  }
  if (cur < title.length) parts.push(<span key={`tail`}>{title.slice(cur)}</span>)

  return (
    <p className="text-[11px] font-bold line-clamp-2" style={{ color: C.text, lineHeight: 1.4 }}>
      {parts}
    </p>
  )
}

// ── Last sold freshness signal (matches Dart _buildLastSoldSignal) ──
function LastSoldSignal({ lastSoldDate }: { lastSoldDate: string }) {
  if (!lastSoldDate || ['Verified','N/A','null'].includes(lastSoldDate)) return null
  try {
    const dt   = new Date(lastSoldDate)
    const diff = Date.now() - dt.getTime()
    const hrs  = diff / 3600000
    const mins = diff / 60000

    let timeAgo: string, color: string, pulse: boolean
    if (hrs < 12) {
      timeAgo = mins < 60 ? `${Math.floor(mins)}m ago` : `${Math.floor(hrs)}h ago`
      color = '#16A34A'; pulse = true
    } else if (hrs < 24) {
      timeAgo = `${Math.floor(hrs)}h ago`
      color = '#4ADE80'; pulse = false
    } else {
      timeAgo = `${Math.floor(diff/86400000)}d ago`
      color = '#9CA3AF'; pulse = false
    }

    return (
      <div className="flex items-center gap-1">
        {pulse && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />}
        <p className="text-[9px] font-black" style={{ color }}>{timeAgo}</p>
      </div>
    )
  } catch { return null }
}

// ── Seeded sparkline (matches Dart _buildSparkline — same algorithm as competitor research) ──
function Sparkline({ itemId, aiVelocity, demandHeat }: { itemId: string; aiVelocity: number; demandHeat: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const W = canvas.width, H = canvas.height

    let seed = 0
    for (let i = 0; i < itemId.length; i++) seed = (seed * 31 + itemId.charCodeAt(i)) >>> 0
    function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed >>> 0) / 4294967296 }

    const base       = aiVelocity > 0 ? aiVelocity : 5.0
    const volatility = (demandHeat > 0.05 ? demandHeat : rand()) * 1.2
    const phase      = Math.floor(rand() * 7)
    const drift      = (rand() - 0.5) * 0.12

    const rawY: number[] = []
    let minY = Infinity, maxY = -Infinity
    for (let day = 0; day < 14; day++) {
      const cycle = ((day + phase) % 7 >= 5) ? 1.35 : 0.85
      const noise = 1.0 + ((rand() - 0.5) * volatility)
      const df    = 1.0 + day * drift
      let y = base * cycle * noise * df
      if (y < 0.5) y = 0.5 + rand()
      rawY.push(y)
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    minY = Math.max(0, minY * 0.5); maxY = maxY * 1.15

    const pts = rawY.map((v, i) => ({
      x: (i / 13) * W,
      y: Math.max(2, Math.min(H-2, H - ((v-minY)/(maxY-minY)) * H))
    }))

    ctx.clearRect(0, 0, W, H)

    // Fill
    ctx.beginPath()
    ctx.moveTo(pts[0].x, H)
    pts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(pts[pts.length-1].x, H)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0,0,0,H)
    grad.addColorStop(0, 'rgba(143,255,0,0.3)')
    grad.addColorStop(1, 'rgba(143,255,0,0)')
    ctx.fillStyle = grad; ctx.fill()

    // Line
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) {
      const cp = (pts[i-1].x + pts[i].x) / 2
      ctx.bezierCurveTo(cp, pts[i-1].y, cp, pts[i].y, pts[i].x, pts[i].y)
    }
    ctx.strokeStyle = 'rgba(143,255,0,0.9)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.stroke()
  }, [itemId, aiVelocity, demandHeat])

  return <canvas ref={canvasRef} width={75} height={32} />
}

// ── Small action icon (matches Dart _buildSmallActionIcon) ────
function SmallAction({ logoUrl, onTap, fallbackColor }: { logoUrl: string; onTap: () => void; fallbackColor: string }) {
  const [imgError, setImgError] = useState(false)
  return (
    <button onClick={onTap}
      className="p-1 rounded border hover:opacity-70"
      style={{ backgroundColor: '#fff', borderColor: '#E5E7EB' }}>
      {!imgError
        ? <img src={logoUrl} width={14} height={14} onError={() => setImgError(true)} />
        : <ShoppingCart size={13} style={{ color: fallbackColor }} />}
    </button>
  )
}

// ── Main IntelligenceRow ──────────────────────────────────────
export default function IntelligenceRow({
  itemId, isSelected, onSelect, onProfitChanged, onPulseCheck,
  imageUrl, title, price, sellerUsername, sellerFeedbackScore,
  itemLocationCountry, sellerRegisteredCountry, totalActiveListings,
  itemWebUrl, totalSold, lastSoldDate, watchCount,
  veroMatches, categoryPath, priceTrend, upc,
  aiVelocity, riskScore, demandHeat, profitSettings,
}: Props) {
  const [hover,       setHover]       = useState(false)
  const [imgHover,    setImgHover]    = useState(false)
  const [costInput,   setCostInput]   = useState('')
  const [liveProfit,  setLiveProfit]  = useState<number | null>(null)

  const isDropship    = itemLocationCountry !== sellerRegisteredCountry
  const strengthColor = sellerFeedbackScore > 10000 ? '#EF4444' : sellerFeedbackScore > 500 ? '#F97316' : '#22C55E'
  const formattedFb   = sellerFeedbackScore.toLocaleString()

  // Live profit calc (matches Dart _calculateRowProfit + ProfitEngine)
  function calcProfit(val: string) {
    setCostInput(val)
    if (!val) { setLiveProfit(null); onProfitChanged?.(0); return }
    const buy    = parseFloat(val) || 0
    const ebay   = parseFloat(price.replace(/[^\d.]/g, '')) || 0
    const fee    = ebay * (profitSettings.categoryFeePercent / 100) + profitSettings.fixedFee
    const adFee  = ebay * (profitSettings.adRatePercent / 100)
    const net    = ebay - buy - fee - adFee - profitSettings.defaultShipping
    setLiveProfit(net); onProfitChanged?.(net)
  }

  function launch(url: string) { window.open(url, '_blank') }
  function launchItem() { if (itemWebUrl) launch(itemWebUrl) }
  function launchSearch(base: string, param: string) { launch(`${base}?${param}=${encodeURIComponent(title)}`) }
  function launchLens() { launch(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`) }

  const rowBg = isSelected ? 'rgba(143,255,0,0.10)' : hover ? 'rgba(143,255,0,0.06)' : '#fff'

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         onClick={onPulseCheck}
         className="flex items-center px-2.5 py-2.5 border-b transition-all cursor-pointer"
         style={{ backgroundColor: rowBg, borderColor: C.border, transitionDuration: '150ms' }}>

      {/* Checkbox */}
      <div style={{ width: 48, flexShrink: 0 }}>
        <input type="checkbox" checked={isSelected} onChange={e => onSelect(e.target.checked)}
          className="w-4 h-4 cursor-pointer" style={{ accentColor: C.lime }}
          onClick={e => e.stopPropagation()} />
      </div>

      {/* 1. Product — flex 8 */}
      <div className="flex items-center gap-2.5 min-w-0 pr-5" style={{ flex: 8 }}>
        <div onMouseEnter={() => setImgHover(true)} onMouseLeave={() => setImgHover(false)}
             onClick={e => { e.stopPropagation(); launchItem() }}
             className="rounded-md overflow-hidden cursor-pointer shrink-0 border-2 transition-all"
             style={{ borderColor: imgHover ? C.lime : 'transparent', width: 34, height: 34 }}>
          <img src={imageUrl} className="w-full h-full object-cover"
               onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
        </div>
        <div className="min-w-0 flex-1">
          <SmartTitle title={title} veroMatches={veroMatches} />
          <p className="text-[9px] truncate mt-0.5" style={{ color: '#6B7280' }}>{categoryPath}</p>
        </div>
      </div>

      {/* 2. Seller — flex 4 */}
      <div className="flex items-center gap-1.5 min-w-0" style={{ flex: 4 }}>
        <FlagImg code={sellerRegisteredCountry} />
        <p className="text-[11px] font-bold truncate" style={{ color: '#334155' }}>{sellerUsername}</p>
        <button onClick={e => { e.stopPropagation(); console.log('Deep scan:', sellerUsername) }}
          title="Deep Scan Seller"
          className="p-1 rounded border shrink-0"
          style={{ backgroundColor: '#6366F114', borderColor: '#6366F133' }}>
          <Radar size={11} style={{ color: '#6366F1' }} />
        </button>
      </div>

      {/* 3. Feedback — flex 2 */}
      <div className="flex items-center gap-1" style={{ flex: 2 }}>
        <Star size={12} style={{ color: C.lime }} />
        <p className="text-[11px] font-black" style={{ color: strengthColor }}>{formattedFb}</p>
        {isDropship && <AlertTriangle size={11} style={{ color: '#EF4444' }} />}
      </div>

      {/* 4. Trend sparkline — flex 2 */}
      <div style={{ flex: 2 }}>
        <Sparkline itemId={itemId} aiVelocity={aiVelocity} demandHeat={demandHeat} />
      </div>

      {/* 5. Sold + freshness — flex 2 */}
      <div style={{ flex: 2 }}>
        <div className="flex items-center gap-1">
          <ShoppingBag size={12} style={{ color: '#94A3B8' }} />
          <p className="text-[14px] font-black" style={{ color: C.text }}>{totalSold}</p>
        </div>
        <LastSoldSignal lastSoldDate={lastSoldDate} />
      </div>

      {/* 6. Watch — flex 2 */}
      <div className="flex items-center gap-1" style={{ flex: 2 }}>
        <Eye size={11} style={{ color: '#64748B' }} />
        <p className="text-[11px] font-bold" style={{ color: C.text }}>{watchCount}</p>
      </div>

      {/* 7. Price — flex 2 */}
      <div style={{ flex: 2 }}>
        <p className="text-[13px] font-black" style={{ color: C.text }}>{price}</p>
      </div>

      {/* 8. Buy cost input — flex 2 */}
      <div style={{ flex: 2 }}>
        <input value={costInput} onChange={e => calcProfit(e.target.value)}
          onClick={e => e.stopPropagation()}
          type="number" placeholder="Cost"
          className="h-7 rounded text-center text-[11px] font-bold border outline-none"
          style={{ width: 55, backgroundColor: '#fff', borderColor: '#D1D5DB', color: C.text }} />
      </div>

      {/* 9. Live profit — flex 2 */}
      <div style={{ flex: 2 }}>
        {liveProfit === null
          ? <p className="text-[13px] font-bold" style={{ color: '#9CA3AF' }}>-</p>
          : <p className="text-[13px] font-black" style={{ color: liveProfit > 0 ? '#15803D' : '#B91C1C' }}>
              ${liveProfit.toFixed(2)}
            </p>}
      </div>

      {/* 10. Action hub — flex 3 */}
      <div className="flex items-center justify-end gap-1" style={{ flex: 3 }}
           onClick={e => e.stopPropagation()}>
        <SmallAction logoUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/128px-Amazon_icon.svg.png"
          onTap={() => launchSearch('https://www.amazon.com/s','k')} fallbackColor="#F97316" />
        <SmallAction logoUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Aliexpress_logo.svg/128px-Aliexpress_logo.svg.png"
          onTap={() => launchSearch('https://www.aliexpress.com/wholesale','SearchText')} fallbackColor="#EF4444" />
        <SmallAction logoUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Google_Lens_-_new_logo.png/120px-Google_Lens_-_new_logo.png"
          onTap={launchLens} fallbackColor="#3B82F6" />
        <button onClick={() => {}} className="p-2 hover:opacity-70">
          <Bookmark size={17} style={{ color: C.muted }} />
        </button>
      </div>

    </div>
  )
}