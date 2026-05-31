'use client'
// app/dashboard/product-research/components/keyword-search/HoverableDataRow.tsx
// Converted 1:1 from lib/pages/product_research/keyword_search/widgets/hoverable_data_row.dart

import { useState, useEffect } from 'react'
import { AlertTriangle, Bookmark, ShoppingCart } from 'lucide-react'

const C = {
  lime:   '#8FFF00',
  text:   '#1E293B',
  muted:  '#94A3B8',
  border: '#F1F5F9',
}

interface ProfitResult {
  netProfit: number
}

// Simple profit calc (matches Dart ProfitEngine.calculate)
function calculateProfit(sellingPrice: number, buyPrice: number, shippingCost = 5): ProfitResult {
  const ebayFee     = sellingPrice * 0.1325 + 0.30
  const netProfit   = sellingPrice - buyPrice - ebayFee - shippingCost
  return { netProfit }
}

interface Props {
  imageUrl:    string
  title:       string
  veroWord?:   string
  flag:        string
  score:       string
  sales:       string
  returns:     string
  risk:        string
  margin:      string
  actionColor: string
  actionLabel: string
  isSelected:  boolean
}

// ── Title with VeRO highlight (matches Dart _buildTitleWithVeroHighlight) ──
function TitleWithVero({ title, veroWord }: { title: string; veroWord?: string }) {
  if (!veroWord || !title.toLowerCase().includes(veroWord.toLowerCase())) {
    return <p className="text-[12px] font-bold line-clamp-2" style={{ color: C.text }}>{title}</p>
  }
  const idx  = title.toLowerCase().indexOf(veroWord.toLowerCase())
  const pre  = title.slice(0, idx)
  const hit  = title.slice(idx, idx + veroWord.length)
  const post = title.slice(idx + veroWord.length)

  return (
    <p className="text-[12px] font-bold line-clamp-2" style={{ color: C.text }}>
      {pre}
      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded border mx-0.5"
            style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', verticalAlign: 'middle' }}>
        <AlertTriangle size={11} style={{ color: '#EF4444' }} />
        <span className="text-[11px] font-black" style={{ color: '#7F1D1D' }}>{hit}</span>
      </span>
      {post}
    </p>
  )
}

export default function HoverableDataRow({
  imageUrl, title, veroWord, flag, score, sales,
  returns, risk, margin, actionColor, actionLabel, isSelected,
}: Props) {
  const [hover,     setHover]     = useState(false)
  const [checked,   setChecked]   = useState(isSelected)
  const [costInput, setCostInput] = useState('')
  const [profit,    setProfit]    = useState<ProfitResult | null>(null)

  // Sync checked with isSelected prop (matches Dart didUpdateWidget)
  useEffect(() => { setChecked(isSelected) }, [isSelected])

  // Live profit calculation (matches Dart _calculateRowProfit)
  function handleCostChange(val: string) {
    setCostInput(val)
    if (!val) { setProfit(null); return }
    const buyPrice    = parseFloat(val) || 0
    const cleanSales  = sales.replace(/[^\d.]/g, '')
    const ebayPrice   = parseFloat(cleanSales) || 0
    setProfit(calculateProfit(ebayPrice, buyPrice, 5))
  }

  // Amazon search launch (matches Dart _launchAmazonSearch)
  function launchAmazon() {
    const query = encodeURIComponent(title)
    window.open(`https://www.amazon.com/s?k=${query}`, '_blank')
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center px-2.5 py-3 border-b transition-all"
      style={{
        backgroundColor: hover ? 'rgba(143,255,0,0.06)' : 'transparent',
        borderColor: C.border,
        transitionDuration: '150ms',
      }}>

      {/* Checkbox */}
      <div className="shrink-0 mr-1">
        <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}
          className="w-4 h-4 rounded cursor-pointer accent-lime-400"
          style={{ accentColor: C.lime }} />
      </div>

      {/* 1. Product info — flex 10 */}
      <div className="flex items-center gap-2.5 min-w-0" style={{ flex: 10 }}>
        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0"
             style={{ backgroundColor: '#F3F4F6' }}>
          {imageUrl ? (
            <img src={imageUrl} className="w-full h-full object-cover"
                 onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart size={15} style={{ color: '#9CA3AF' }} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <TitleWithVero title={title} veroWord={veroWord} />
        </div>
      </div>

      {/* 2. eBay price — flex 3 */}
      <div style={{ flex: 3 }}>
        <p className="text-[13px] font-black" style={{ color: C.text }}>{sales}</p>
      </div>

      {/* 3. Cost input — flex 2 */}
      <div style={{ flex: 2 }}>
        <input
          value={costInput}
          onChange={e => handleCostChange(e.target.value)}
          placeholder="Cost $"
          type="number"
          className="h-7 rounded-md border text-[11px] font-bold text-center outline-none"
          style={{
            width: 55,
            backgroundColor: '#fff',
            borderColor: '#D1D5DB',
            color: C.text,
          }} />
      </div>

      {/* 4. Live profit badge — flex 2 */}
      <div style={{ flex: 2 }}>
        {profit === null ? (
          <p className="text-[11px] font-bold" style={{ color: '#9CA3AF' }}>-</p>
        ) : (
          <div className="flex items-center justify-center h-7 rounded-md"
               style={{
                 width: 55,
                 backgroundColor: profit.netProfit > 0 ? '#F0FDF4' : '#FEF2F2',
               }}>
            <p className="text-[11px] font-black"
               style={{ color: profit.netProfit > 0 ? '#15803D' : '#B91C1C' }}>
              ${profit.netProfit.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* 5. Action group — flex 4 */}
      <div className="flex items-center justify-end gap-2" style={{ flex: 4 }}>
        {/* Amazon launch button */}
        <button onClick={launchAmazon}
          className="p-1.5 rounded-md border hover:opacity-70"
          style={{ backgroundColor: '#fff', borderColor: '#E5E7EB' }}
          title="Search on Amazon">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/512px-Amazon_icon.svg.png"
            width={16} height={16}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </button>
        {/* Bookmark */}
        <button className="p-2 rounded-md hover:opacity-70">
          <Bookmark size={17} style={{ color: C.muted }} />
        </button>
      </div>
    </div>
  )
}