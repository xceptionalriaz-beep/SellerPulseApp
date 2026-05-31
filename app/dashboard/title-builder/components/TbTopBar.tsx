'use client'
// app/dashboard/title-builder/components/TbTopBar.tsx
// Converted 1:1 from lib/pages/title_builder/tb_top_bar.dart

import { useState, useRef } from 'react'
import { Link, Search, Settings, ChevronDown, ChevronUp } from 'lucide-react'

const C = {
  border:  '#E2E8F0',
  bg:      '#F1F5F9',
  text:    '#1E293B',
  muted:   '#94A3B8',
  lime:    '#8FFF00',
  blue:    '#1D70F5',
  dark:    '#0F172A',
}

// ── Option types ──────────────────────────────────────────────
interface Option { val: string; label: string; enabled: boolean }

// ── ProDropdown (matches Dart ProDropdown + _DropdownPill) ────
function ProDropdown({ prefix, currentValue, options, onChanged }: {
  prefix: string; currentValue: string
  options: Option[]; onChanged: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  // Display label — first word of matching option label (matches Dart displayLabel logic)
  const displayLabel = (() => {
    const match = options.find(o => o.val === currentValue)
    return match ? match.label.split(' ')[0] : currentValue
  })()

  return (
    <div className="relative">
      <button onClick={() => setOpen(s => !s)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] font-semibold transition-all"
        style={{
          backgroundColor: open ? C.bg : '#fff',
          borderColor:     open ? C.lime : C.border,
          color: C.text,
        }}>
        {`${prefix} ${displayLabel}`.trim()}
        {open
          ? <ChevronUp   size={15} style={{ color: C.lime }} />
          : <ChevronDown size={15} style={{ color: C.muted }} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 z-50 rounded-2xl border shadow-xl overflow-hidden"
               style={{ width: 220, backgroundColor: '#fff', borderColor: C.border,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
            <div className="p-2 flex flex-col gap-1">
              {options.map((o, i) => {
                const isSelected = o.val === currentValue
                return (
                  <DropdownPill key={i} option={o} isSelected={isSelected}
                    onTap={o.enabled ? () => { onChanged(o.val); setOpen(false) } : undefined} />
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── DropdownPill (matches Dart _DropdownPill) ─────────────────
function DropdownPill({ option, isSelected, onTap }: {
  option: Option; isSelected: boolean; onTap?: () => void
}) {
  const [hover, setHover] = useState(false)
  const enabled = option.enabled

  const bgColor   = !enabled ? 'transparent' : isSelected ? C.lime    : 'transparent'
  const textColor = !enabled ? '#CBD5E1'      : isSelected ? C.dark    : C.text
  const border    = !enabled ? 'transparent'  : hover && !isSelected ? C.lime : 'transparent'

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         onClick={onTap}
         className="px-4 py-2.5 rounded-full text-[13px] transition-all mb-0.5"
         style={{
           backgroundColor: bgColor,
           color:           textColor,
           fontWeight:      isSelected ? 700 : 500,
           fontStyle:       enabled ? 'normal' : 'italic',
           cursor:          enabled ? 'pointer' : 'default',
           border:          `1.5px solid ${border}`,
         }}>
      {option.label}
    </div>
  )
}

// ── Search field (matches Dart _searchField) ──────────────────
function SearchField({ icon: Icon, hint, btnText, btnColor, textColor = '#fff', onAction }: {
  icon: React.ElementType; hint: string; btnText: string
  btnColor: string; textColor?: string; onAction: (val: string) => void
}) {
  const [val, setVal] = useState('')
  return (
    <div className="flex items-center rounded-lg border overflow-hidden"
         style={{ backgroundColor: C.bg, borderColor: C.border }}>
      <div className="pl-3.5 pr-2.5 shrink-0">
        <Icon size={19} style={{ color: C.muted }} />
      </div>
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onAction(val)}
        placeholder={hint}
        className="flex-1 text-[14px] outline-none bg-transparent py-2.5"
        style={{ color: C.text }} />
      <button onClick={() => onAction(val)}
        className="px-4 py-2.5 text-[13px] font-bold shrink-0"
        style={{ backgroundColor: btnColor, color: textColor }}>
        {btnText}
      </button>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
  selectedTimeframe:    string
  onTimeframeChanged:   (v: string) => void
  selectedMarket:       string
  onMarketChanged:      (v: string) => void
  selectedLocation:     string
  onLocationChanged:    (v: string) => void
  onExtract:            (v: string) => void
  onSearch:             (v: string) => void
  onOpenSettings:       () => void
}

// ── Main TbTopBar ─────────────────────────────────────────────
export default function TbTopBar({
  selectedTimeframe, onTimeframeChanged,
  selectedMarket,    onMarketChanged,
  selectedLocation,  onLocationChanged,
  onExtract, onSearch, onOpenSettings,
}: Props) {

  const marketOptions: Option[] = [
    { val: 'eBay',    label: 'eBay',                   enabled: true  },
    { val: 'Amazon',  label: 'Amazon (Coming Soon)',    enabled: false },
    { val: 'Walmart', label: 'Walmart (Coming Soon)',   enabled: false },
  ]
  const locationOptions: Option[] = [
    { val: 'All', label: 'All Locations 🌍',     enabled: true },
    { val: 'US',  label: 'United States 🇺🇸',   enabled: true },
    { val: 'UK',  label: 'United Kingdom 🇬🇧',  enabled: true },
    { val: 'CA',  label: 'Canada 🇨🇦',           enabled: true },
    { val: 'AU',  label: 'Australia 🇦🇺',        enabled: true },
  ]
  const timeOptions: Option[] = [
    { val: '7D',  label: 'Time: 7D',  enabled: true },
    { val: '30D', label: 'Time: 30D', enabled: true },
    { val: '12M', label: 'Time: 12M', enabled: true },
  ]

  return (
    <div className="p-5 rounded-xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      {/* Search fields — desktop: side by side, mobile: stacked */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 mb-4">
        <div className="flex-1">
          <SearchField icon={Link}   hint="Paste Competitor Item ID..." btnText="Extract"
            btnColor={C.blue} onAction={onExtract} />
        </div>
        {/* Divider — desktop only */}
        <div className="hidden md:flex items-center">
          <span className="text-[24px] font-light" style={{ color: C.muted }}>|</span>
        </div>
        <div className="flex-1">
          <SearchField icon={Search} hint="Enter Seed Keyword..." btnText="Search"
            btnColor={C.lime} textColor="#000" onAction={onSearch} />
        </div>
      </div>

      {/* Dropdowns + Settings */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-wrap gap-2.5 flex-1">
          <ProDropdown prefix="Market:"   currentValue={selectedMarket}    options={marketOptions}    onChanged={onMarketChanged}    />
          <ProDropdown prefix="Location:" currentValue={selectedLocation}  options={locationOptions}  onChanged={onLocationChanged}  />
          <ProDropdown prefix=""          currentValue={selectedTimeframe} options={timeOptions}      onChanged={onTimeframeChanged} />
        </div>
        {/* Settings button */}
        <button onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-50"
          style={{ color: C.muted }}>
          <Settings size={17} />
          <span className="hidden sm:inline text-[13px] font-bold">Settings</span>
        </button>
      </div>

    </div>
  )
}