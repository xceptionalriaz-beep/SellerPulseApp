'use client'
// app/dashboard/product-research/components/keyword-search/FilterHub.tsx
// Converted 1:1 from lib/pages/product_research/keyword_search/widgets/filter_hub.dart

import { useState, useRef, useEffect } from 'react'
import { Store, Truck, DollarSign, Star, Package, Tag, Calendar, TrendingUp, HelpCircle, ChevronDown } from 'lucide-react'
import { SearchFilters, getCurrencySymbol } from '../../models/searchFilters'

const C = {
  dark:   '#1a2410',
  text:   '#1E293B',
  muted:  '#94A3B8',
  border: '#E2E8F0',
  lime:   '#8FFF00',
  white:  '#FFFFFF',
  bg:     '#F1F5F9',
}

interface Props {
  filters:  SearchFilters
  onChange: (f: SearchFilters) => void
}

// â”€â”€ Dropdown pill item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FilterPill({ label, selected, onTap }: { label: string; selected: boolean; onTap: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         onClick={onTap}
         className="px-4 py-2 rounded-full text-[13px] cursor-pointer transition-all border"
         style={{
           backgroundColor: selected ? C.lime : 'transparent',
           borderColor:     selected ? 'transparent' : hover ? C.lime : 'transparent',
           borderWidth:     1.5,
           color:           selected ? '#000' : C.text,
           fontWeight:      selected ? 700 : 500,
         }}>
      {label}
    </div>
  )
}

// â”€â”€ Filter dropdown â€” fixed position so never clipped â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FilterDropdown({ value, items, onChange }: {
  value: string
  items: { val: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const current      = items.find(i => i.val === value)
  const displayLabel = current?.label ?? value

  function openDropdown() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 8, left: rect.left })
    }
    setOpen(true)
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref}>
      <button onClick={() => open ? setOpen(false) : openDropdown()}
        className="flex items-center justify-between w-full border-b text-[13px] font-bold transition-all"
        style={{
          borderColor:  open ? C.lime : 'rgba(0,0,0,0.4)',
          borderWidth:  open ? '0 0 2px 0' : '0 0 1.2px 0',
          color:        C.text,
          background:   'transparent',
          paddingBottom: 4,
        }}>
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown size={14} style={{ color: C.dark, flexShrink: 0, marginLeft: 4 }} />
      </button>

      {open && (
        <div className="fixed z-[9999] rounded-2xl border shadow-xl p-1.5"
             style={{
               top: pos.top, left: pos.left,
               backgroundColor: C.white, borderColor: C.border,
               minWidth: 200, maxHeight: 300, overflowY: 'auto',
               boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
             }}>
          {items.map((item, i) => (
            <FilterPill key={i} label={item.label} selected={item.val === value}
              onTap={() => { onChange(item.val); setOpen(false) }} />
          ))}
        </div>
      )}
    </div>
  )
}

// â”€â”€ Range input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RangeInput({ hintMin, hintMax, onMinChange, onMaxChange }: {
  hintMin: string; hintMax: string
  onMinChange: (v: string) => void; onMaxChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <InputBox hint={hintMin} onChange={onMinChange} />
      <span className="text-[12px]" style={{ color: C.muted }}>-</span>
      <InputBox hint={hintMax} onChange={onMaxChange} />
    </div>
  )
}

function InputBox({ hint, onChange }: { hint: string; onChange: (v: string) => void }) {
  const [focus, setFocus] = useState(false)
  return (
    <input placeholder={hint} onChange={e => onChange(e.target.value)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      className="text-center text-[13px] font-semibold outline-none bg-transparent border-b w-full"
      style={{
        color:       C.text,
        borderColor: focus ? C.lime : 'rgba(0,0,0,0.4)',
        borderWidth: focus ? '0 0 2px 0' : '0 0 1.2px 0',
        paddingBottom: 4,
      }} />
  )
}

// â”€â”€ Individual filter card â€” equal width â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FilterCard({ title, icon: Icon, helpText, children }: {
  title: string; icon: React.ElementType; helpText: string; children: React.ReactNode
}) {
  return (
    <div className="flex-1 px-2.5 py-3 rounded-xl border flex flex-col gap-3"
         style={{ backgroundColor: C.white, borderColor: C.border,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)', minWidth: 0 }}>
      {/* Header row */}
      <div className="flex items-center gap-1">
        <Icon size={13} style={{ color: C.dark, flexShrink: 0 }} />
        <p className="text-[11px] font-bold flex-1 truncate" style={{ color: C.dark }}>{title}</p>
        <div title={helpText} className="cursor-help shrink-0">
          <HelpCircle size={12} style={{ color: C.muted }} />
        </div>
      </div>
      {/* Control */}
      <div>{children}</div>
    </div>
  )
}

// â”€â”€ Main FilterHub â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function FilterHub({ filters, onChange }: Props) {
  function update(partial: Partial<SearchFilters>) {
    onChange({ ...filters, ...partial })
  }
  const currency = getCurrencySymbol(filters.marketplace)

  return (
    <div className="flex gap-2 w-full pb-4">

      {/* 1. Marketplace */}
      <FilterCard title="Marketplace" icon={Store} helpText="Select which eBay country site to search.">
        <FilterDropdown value={filters.marketplace}
          items={[
            { val: 'US', label: 'ðŸ‡ºðŸ‡¸ ebay.com'   },
            { val: 'UK', label: 'ðŸ‡¬ðŸ‡§ ebay.co.uk' },
            { val: 'DE', label: 'ðŸ‡©ðŸ‡ª ebay.de'    },
            { val: 'IT', label: 'ðŸ‡®ðŸ‡¹ ebay.it'    },
          ]}
          onChange={v => update({ marketplace: v })} />
      </FilterCard>

      {/* 2. Shipping Location */}
      <FilterCard title="Shipping Location" icon={Truck} helpText="Filter by where the item is located.">
        <FilterDropdown value={filters.shipFrom}
          items={[
            { val: 'Any', label: 'ðŸŒŽ Anywhere'       },
            { val: 'US',  label: 'ðŸ‡ºðŸ‡¸ United States' },
            { val: 'CN',  label: 'ðŸ‡¨ðŸ‡³ China'         },
          ]}
          onChange={v => update({ shipFrom: v })} />
      </FilterCard>

      {/* 3. Price */}
      <FilterCard title={`Price (${currency})`} icon={DollarSign} helpText="Set min and max price range.">
        <RangeInput hintMin="min" hintMax="max"
          onMinChange={v => update({ minPrice: parseFloat(v) || null })}
          onMaxChange={v => update({ maxPrice: parseFloat(v) || null })} />
      </FilterCard>

      {/* 4. Feedback */}
      <FilterCard title="Feedback" icon={Star} helpText="Filter by seller feedback score.">
        <RangeInput hintMin="min" hintMax="max"
          onMinChange={v => update({ minFeedback: parseInt(v) || 0 })}
          onMaxChange={v => update({ maxFeedback: parseInt(v) || 500 })} />
      </FilterCard>

      {/* 5. Condition */}
      <FilterCard title="Condition" icon={Package} helpText="Target New, Used, or Any items.">
        <FilterDropdown value={filters.condition}
          items={[
            { val: 'New',  label: 'âœ¨ New'  },
            { val: 'Used', label: 'ðŸ“¦ Used' },
            { val: 'Any',  label: 'ðŸ”„ Any'  },
          ]}
          onChange={v => update({ condition: v })} />
      </FilterCard>

      {/* 6. Listing Type */}
      <FilterCard title="Listing Type" icon={Tag} helpText="Fixed price or Auction listings.">
        <FilterDropdown value={filters.listingType}
          items={[
            { val: 'Fixed',   label: 'ðŸ’° Buy It Now' },
            { val: 'Auction', label: 'ðŸ”¨ Auction'    },
          ]}
          onChange={v => update({ listingType: v })} />
      </FilterCard>

      {/* 7. Sales Range */}
      <FilterCard title="Sales Range" icon={Calendar} helpText="Filter sales by timeframe.">
        <FilterDropdown value={filters.salesRange}
          items={[
            { val: 'Total',   label: 'ðŸ“… Total'   },
            { val: '7 Days',  label: 'ðŸ”¥ 7 Days'  },
            { val: '15 Days', label: 'ðŸ“ˆ 15 Days' },
            { val: '30 Days', label: 'ðŸ“† 30 Days' },
          ]}
          onChange={v => update({ salesRange: v })} />
      </FilterCard>

      {/* 8. Min Sales */}
      <FilterCard title="Min Sales" icon={TrendingUp} helpText="Only show items sold at least this many times.">
        <InputBox hint="e.g. 5" onChange={v => update({ minSales: parseInt(v) || 0 })} />
      </FilterCard>

    </div>
  )
}
