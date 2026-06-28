'use client'
// components/profit/CommandCenter.tsx
// Converted 1:1 from lib/pages/command_center.dart

import { useState, useRef, useEffect } from 'react'
import { Info, Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'

// â”€â”€ Design tokens (matches Dart _C) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  dark:        '#0F172A',
  lime:        '#8FFF00',
  border:      '#E2E8F0',
  bg:          '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary:'#475569',
  textHint:    '#94A3B8',
  labelColor:  '#64748B',
}

// â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CommandCenterProps {
  currency:              string
  categoryFees:          string[]
  storeTiers:            string[]
  sellerLevels:          string[]
  processors:            string[]
  isInternational:       boolean
  selectedCategory:      string
  selectedStoreTier:     string
  selectedSellerLevel:   string
  selectedProcessor:     string
  salePriceValue?:       number
  buyerShipValue?:       number
  onItemCostChanged:     (v: number) => void
  onShippingCostChanged: (v: number) => void
  onSalePriceChanged:    (v: number) => void
  onBuyerShippingChanged:(v: number) => void
  onAdRateChanged:       (v: number) => void
  onTaxRateChanged:      (v: number) => void
  onCategoryChanged:     (v: string) => void
  onStoreTierChanged:    (v: string) => void
  onSellerLevelChanged:  (v: string) => void
  onProcessorChanged:    (v: string) => void
  onInternationalChanged:(v: boolean) => void
}

// â”€â”€ Speech bubble tooltip (matches Dart _TooltipSpeechBubbleShape) â”€â”€
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  function handleClick() {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ top: r.top - 10, left: r.left + r.width / 2 })
    setShow(s => !s)
  }

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button type="button" onClick={handleClick}>
        {children}
      </button>
      {show && typeof window !== 'undefined' && createPortal(
        <div className="fixed z-[9999]" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}>
          <div className="relative px-3.5 py-2.5 rounded-lg max-w-[220px] text-[12px] leading-[1.4] font-medium text-white"
               style={{ backgroundColor: C.dark }}>
            {text}
            {/* Speech bubble arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                 style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${C.dark}` }} />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// â”€â”€ Label with help icon (matches Dart _buildLabelWithHelp) â”€â”€â”€
function LabelWithHelp({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[12px] font-bold truncate" style={{ color: C.labelColor }}>{label}</span>
      <Tooltip text={tooltip}>
        <Info size={15} style={{ color: C.textHint }} />
      </Tooltip>
    </div>
  )
}

// â”€â”€ Input field (matches Dart _buildInput) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Input({
  label, tooltip, symbol, isSuffix = false, value, onChange
}: {
  label:     string
  tooltip:   string
  symbol:    string
  isSuffix?: boolean
  value?:    number
  onChange:  (v: number) => void
}) {
  const [focused, setFocused] = useState(false)
  const [local, setLocal] = useState(value !== undefined && value > 0 ? String(value) : '')

  useEffect(() => {
    if (value !== undefined) setLocal(value > 0 ? String(value) : '')
  }, [value])

  return (
    <div className="flex flex-col gap-1.5">
      <LabelWithHelp label={label} tooltip={tooltip} />
      <div className="flex items-center h-10 rounded-lg border px-3.5 gap-1 transition-all"
           style={{
             backgroundColor: C.bg,
             borderColor: C.border,
             boxShadow: focused ? '0 0 0 3px rgba(143, 255, 0, 0.2)' : 'none',
           }}>
        {!isSuffix && <span className="text-[14px] font-bold shrink-0" style={{ color: C.labelColor }}>{symbol}</span>}
        <input
          type="number"
          value={local}
          onChange={e => {
            setLocal(e.target.value)
            onChange(parseFloat(e.target.value) || 0)
          }}
          className="flex-1 text-[14px] font-bold bg-transparent min-w-0"
          style={{ color: C.textPrimary, outline: 'none' }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0.00"
          step="0.01"
        />
        {isSuffix && <span className="text-[14px] font-bold shrink-0" style={{ color: C.labelColor }}>{symbol}</span>}
      </div>
    </div>
  )
}

// â”€â”€ Dropdown (matches Dart _buildDropdown) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Dropdown({
  label, tooltip, value, items, onChange
}: {
  label:    string
  tooltip:  string
  value:    string
  items:    string[]
  onChange: (v: string) => void
}) {
  const safeValue = items.includes(value) ? value : (items[0] ?? '')
  return (
    <div className="flex flex-col gap-1.5">
      <LabelWithHelp label={label} tooltip={tooltip} />
      <div className="h-10 rounded-lg border px-2.5"
           style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <select
          value={safeValue}
          onChange={e => onChange(e.target.value)}
          className="w-full h-full text-[12px] font-semibold outline-none bg-transparent cursor-pointer"
          style={{ color: C.textPrimary }}>
          {items.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// â”€â”€ Searchable Category Dialog (matches Dart _showSearchDialog) â”€â”€
function SearchableCategoryDialog({
  currentValue, items, onSelect, onClose
}: {
  currentValue: string
  items:        string[]
  onSelect:     (v: string) => void
  onClose:      () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = items.filter(i => i.toLowerCase().includes(query.toLowerCase()))

  if (typeof window === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      {/* Scale+fade animation matches Dart transitionBuilder */}
      <div className="bg-white rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95"
           style={{ width: 450, height: 500, padding: 20 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[18px] font-bold" style={{ color: C.textPrimary }}>Select eBay Category</span>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border"
            style={{ borderColor: C.border }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.backgroundColor = '#FEF2F2'
              b.style.borderColor = '#F87171'
              b.querySelectorAll('svg').forEach(s => s.style.stroke = '#F87171')
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.backgroundColor = 'transparent'
              b.style.borderColor = C.border
              b.querySelectorAll('svg').forEach(s => s.style.stroke = C.textHint)
            }}>
            <X size={15} style={{ color: C.textHint }} />
          </button>
        </div>
        {/* Search field */}
        <div className="flex items-center gap-2 px-3 h-10 rounded-lg mb-4"
             style={{ backgroundColor: '#F1F5F9' }}>
          <Search size={16} style={{ color: C.labelColor }} />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 text-[13px] outline-none bg-transparent"
            style={{ color: C.textPrimary }}
            placeholder="Search (e.g., 'Watches', 'Shoes')" />
        </div>
        {/* List â€” BouncingScrollPhysics = native scroll */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map(item => {
            const isSel = item === currentValue
            return (
              <button key={item} onClick={() => { onSelect(item); onClose() }}
                className="w-full text-left px-4 py-3.5 rounded-lg text-[13px] transition-colors"
                style={{
                  backgroundColor: isSel ? `${C.lime}28` : 'transparent',
                  color:           isSel ? C.textPrimary : C.textSecondary,
                  fontWeight:      isSel ? 700 : 500,
                }}>
                {item}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}

// â”€â”€ Searchable Category trigger (matches Dart _buildSearchableCategory) â”€â”€
function SearchableCategory({
  label, tooltip, currentValue, items, onChange
}: {
  label:        string
  tooltip:      string
  currentValue: string
  items:        string[]
  onChange:     (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <LabelWithHelp label={label} tooltip={tooltip} />
      <button onClick={() => setOpen(true)}
        className="h-10 w-full flex items-center justify-between px-3.5 rounded-lg border text-left transition-all"
        style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <span className="text-[12px] font-semibold truncate flex-1" style={{ color: C.textPrimary }}>{currentValue}</span>
        <Search size={16} style={{ color: C.labelColor }} />
      </button>
      {open && (
        <SearchableCategoryDialog
          currentValue={currentValue}
          items={items}
          onSelect={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CommandCenter({
  currency, categoryFees, storeTiers, sellerLevels, processors,
  isInternational, selectedCategory, selectedStoreTier, selectedSellerLevel, selectedProcessor,
  salePriceValue, buyerShipValue,
  onItemCostChanged, onShippingCostChanged, onSalePriceChanged, onBuyerShippingChanged,
  onAdRateChanged, onTaxRateChanged, onCategoryChanged, onStoreTierChanged,
  onSellerLevelChanged, onProcessorChanged, onInternationalChanged,
}: CommandCenterProps) {
  return (
    <div className="flex flex-col rounded-2xl border overflow-hidden"
         style={{
           backgroundColor: '#fff',
           borderColor: C.border,
           boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
         }}>
      <div className="flex flex-col gap-3 p-5 overflow-y-auto"
           style={{ scrollbarWidth: 'none' }}>

        {/* COMMAND CENTER label */}
        <p className="text-[11px] font-bold tracking-[1.5px]" style={{ color: C.labelColor }}>
          COMMAND CENTER
        </p>

        {/* Row 1: Item Cost + Shipping Cost */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Item Cost"     tooltip="How much you paid to buy this item."                          symbol={currency} onChange={onItemCostChanged} />
          <Input label="Shipping Cost" tooltip="How much it costs YOU to ship this item to the buyer."       symbol={currency} onChange={onShippingCostChanged} />
        </div>

        {/* Row 2: Selling Price + Buyer Paid Ship */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Selling Price"  tooltip="The price you will list this item for."                         symbol={currency} value={salePriceValue} onChange={onSalePriceChanged} />
          <Input label="Buyer Paid Ship" tooltip="How much your customers are going to pay for shipping."        symbol={currency} value={buyerShipValue}  onChange={onBuyerShippingChanged} />
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: C.border }} />

        {/* eBay Category â€” searchable */}
        <SearchableCategory
          label="eBay Category"
          tooltip="What category does your product belong to? Search to find it faster."
          currentValue={selectedCategory}
          items={categoryFees}
          onChange={onCategoryChanged}
        />

        {/* Row 3: Store Tier + Seller Level */}
        <div className="grid grid-cols-2 gap-3">
          <Dropdown label="Store Tier"   tooltip="Do you have a paid eBay Store subscription?"         value={selectedStoreTier}   items={storeTiers}   onChange={onStoreTierChanged} />
          <Dropdown label="Seller Level" tooltip="Your current eBay seller rating level."              value={selectedSellerLevel} items={sellerLevels} onChange={onSellerLevelChanged} />
        </div>

        {/* Row 4: Promoted Ad Rate + Est. Buyer Tax */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Promoted Ad Rate" tooltip="Are you paying eBay to promote this item? Put the % here." symbol="%" isSuffix onChange={onAdRateChanged} />
          <Input label="Est. Buyer Tax"   tooltip="The average sales tax your buyer pays."                     symbol="%" isSuffix onChange={onTaxRateChanged} />
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: C.border }} />

        {/* International Sale toggle */}
        <div className="flex items-center justify-between">
          <LabelWithHelp
            label="International Sale"
            tooltip="Turn ON if the buyer is in a different country. eBay adds a 1.65% cross-border fee."
          />
          <button onClick={() => onInternationalChanged(!isInternational)}
            className="relative w-11 h-6 rounded-full transition-colors shrink-0"
            style={{ backgroundColor: isInternational ? C.dark : '#CBD5E1' }}>
            <span className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all"
                  style={{
                    left: isInternational ? '24px' : '4px',
                    backgroundColor: isInternational ? C.lime : '#fff',
                  }} />
          </button>
        </div>

        {/* Payment Processor dropdown */}
        <Dropdown
          label="Payment Processor"
          tooltip="Select 'Managed' if eBay pays you directly, or 'PayPal' if you use the old payment system."
          value={selectedProcessor}
          items={processors}
          onChange={onProcessorChanged}
        />

      </div>
    </div>
  )
}
