'use client'
// components/profit/CommandCenter.tsx
// Riazify brand colors applied throughout.
// Searchable category dialog + speech bubble tooltips kept from original.
// Payment Processor removed. US tiered fee fields + regulatory fee + advanced pro added.

import { useState, useRef, useEffect } from 'react'
import { Info, Search, X, RotateCcw } from 'lucide-react'
import { createPortal } from 'react-dom'
import ProDropdown from '@/components/ui/ProDropdown'

// ── Brand palette (spec-exact) ─────────────────────────────────
const C = {
  lime: '#8fff00',
  dark: '#1a2410',
  border: '#e8ede2',
  muted: '#8a9e78',
  surface: '#ffffff',
  bg: '#f7f9f5',
  text: '#1a2410',
  red: '#b91c1c',
  amber: '#d97706',
  green: '#16a34a',
}

// ── Props ──────────────────────────────────────────────────────
export interface CommandCenterProps {
  currency: string
  country: string
  // category + store + seller options
  categoryOptions: { label: string; value: string }[]
  storeTierOptions: { label: string; value: string }[]
  sellerLevelOptions: { label: string; value: string }[]
  // input values (controlled strings)
  itemCost: string
  shippingCost: string
  sellingPrice: string
  buyerPaidShipping: string
  adRate: string
  buyerTax: string
  // select values
  selectedCategory: string
  selectedStoreTier: string
  selectedSellerLevel: string
  // toggles
  isInternational: boolean
  includeRegFee: boolean
  regFeeConfirmed: boolean
  regulatoryFeeRate: number
  isAdvancedEnabled: boolean
  // advanced values
  sourcingTax: string
  fxFee: string
  defectRate: string
  payoutFee: string
  cashback: string
  // callbacks
  onItemCostChange: (v: string) => void
  onShippingCostChange: (v: string) => void
  onSellingPriceChange: (v: string) => void
  onBuyerPaidShipChange: (v: string) => void
  onAdRateChange: (v: string) => void
  onBuyerTaxChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onStoreTierChange: (v: string) => void
  onSellerLevelChange: (v: string) => void
  onInternationalChange: (v: boolean) => void
  onRegFeeChange: (v: boolean) => void
  onAdvancedChange: (v: boolean) => void
  onSourcingTaxChange: (v: string) => void
  onFxFeeChange: (v: string) => void
  onDefectRateChange: (v: string) => void
  onPayoutFeeChange: (v: string) => void
  onCashbackChange: (v: string) => void
  onReset: () => void
}

// ── Speech bubble tooltip (portal-based, hover-triggered) ──────
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  function updatePos() {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ top: r.top - 10 + window.scrollY, left: r.left + r.width / 2 })
  }

  function handleMouseEnter() {
    updatePos()
    setShow(true)
  }

  function handleMouseLeave() {
    setShow(false)
  }

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span style={{ display: 'flex', cursor: 'default' }}>
        {children}
      </span>
      {show && typeof window !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', zIndex: 9999,
          top: pos.top, left: pos.left,
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'relative', padding: '8px 14px', borderRadius: 8,
            display: 'table',
            maxWidth: 200,
            fontSize: 12, lineHeight: 1.5, fontWeight: 500,
            color: '#ffffff', backgroundColor: C.dark,
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            textAlign: 'center',
            wordBreak: 'break-word',
          }}>
            {text}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              top: '100%', width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `7px solid ${C.dark}`,
            }} />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Label with tooltip icon ────────────────────────────────────
function LabelWithHelp({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{label}</span>
      <Tooltip text={tooltip}>
        <Info size={11} color={C.muted} />
      </Tooltip>
    </div>
  )
}

// ── Controlled input field ─────────────────────────────────────
function InputField({
  label, tooltip, value, onChange, prefix, suffix,
}: {
  label: string
  tooltip: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <LabelWithHelp label={label} tooltip={tooltip} />
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 36, padding: '0 10px', gap: 4,
        border: `1.5px solid ${focused ? C.lime : C.border}`,
        borderRadius: 8, background: C.surface,
        boxShadow: focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
        {prefix && <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0.00"
          style={{
            flex: 1, border: 'none', outline: 'none', minWidth: 0,
            fontSize: 13, fontWeight: 600, color: C.text,
            background: 'transparent',
          }}
        />
        {suffix && <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  )
}

// ── Select field ───────────────────────────────────────────────
// SelectField removed — using ProDropdown from @/components/ui/ProDropdown

// ── Toggle ─────────────────────────────────────────────────────
function Toggle({
  label, tooltip, checked, onChange,
}: {
  label: string
  tooltip: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <LabelWithHelp label={label} tooltip={tooltip} />
      <button
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative', width: 38, height: 21,
          borderRadius: 999, border: 'none', cursor: 'pointer',
          background: checked ? C.lime : C.border,
          transition: 'background 0.2s', flexShrink: 0,
        }}>
        <span style={{
          position: 'absolute', top: 2.5,
          left: checked ? 19 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: C.surface,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          display: 'block',
        }} />
      </button>
    </div>
  )
}

// ── Searchable category dialog ─────────────────────────────────
function SearchableCategoryDialog({
  currentValue, options, onSelect, onClose,
}: {
  currentValue: string
  options: { label: string; value: string }[]
  onSelect: (v: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = (options ?? []).filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )

  if (typeof window === 'undefined') return null
  return createPortal(
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backgroundColor: 'rgba(26,36,16,0.4)',
      }}>
      <div style={{
        background: C.surface, borderRadius: 16,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        width: 450, height: 500, padding: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Select eBay Category</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
            background: 'transparent', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={15} color={C.muted} />
          </button>
        </div>

        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 40, padding: '0 12px', borderRadius: 8,
          background: C.bg, marginBottom: 12,
        }}>
          <Search size={15} color={C.muted} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search categories..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 13, color: C.text, background: 'transparent',
            }}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(o => {
            const isSelected = o.value === currentValue
            return (
              <button
                key={o.value}
                onClick={() => { onSelect(o.value); onClose() }}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? `${C.lime}28` : 'transparent',
                  color: C.text,
                  transition: 'background 0.1s',
                }}>
                {o.label}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', padding: 20 }}>
              No categories found
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Searchable category trigger button ─────────────────────────
function SearchableCategory({
  label, tooltip, currentValue, options, onChange,
}: {
  label: string
  tooltip: string
  currentValue: string
  options: { label: string; value: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const currentLabel = (options ?? []).find(o => o.value === currentValue)?.label ?? currentValue

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <LabelWithHelp label={label} tooltip={tooltip} />
      <button
        onClick={() => setOpen(true)}
        style={{
          height: 36, width: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 10px', borderRadius: 8,
          border: `1.5px solid ${C.border}`,
          background: C.surface, cursor: 'pointer',
          textAlign: 'left',
        }}>
        <span style={{
          fontSize: 12, fontWeight: 600, color: C.text,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {currentLabel}
        </span>
        <Search size={14} color={C.muted} style={{ flexShrink: 0, marginLeft: 6 }} />
      </button>
      {open && (
        <SearchableCategoryDialog
          currentValue={currentValue}
          options={options}
          onSelect={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// ── Divider ────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: C.border, margin: '2px 0' }} />
}

// ── Main Component ─────────────────────────────────────────────
export default function CommandCenter({
  currency, country,
  categoryOptions, storeTierOptions, sellerLevelOptions,
  itemCost, shippingCost, sellingPrice, buyerPaidShipping,
  adRate, buyerTax,
  selectedCategory, selectedStoreTier, selectedSellerLevel,
  isInternational, includeRegFee, regFeeConfirmed, regulatoryFeeRate,
  isAdvancedEnabled,
  sourcingTax, fxFee, defectRate, payoutFee, cashback,
  onItemCostChange, onShippingCostChange, onSellingPriceChange, onBuyerPaidShipChange,
  onAdRateChange, onBuyerTaxChange, onCategoryChange, onStoreTierChange,
  onSellerLevelChange, onInternationalChange, onRegFeeChange, onAdvancedChange,
  onSourcingTaxChange, onFxFeeChange, onDefectRateChange, onPayoutFeeChange,
  onCashbackChange, onReset,
}: CommandCenterProps) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, display: 'flex', flexDirection: 'column',
      gap: 12, padding: 16, fontFamily: "'Inter', sans-serif",
    }}>

      {/* Header */}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', color: C.muted }}>
        COMMAND CENTER
      </span>

      {/* Row 1: Item cost + Shipping cost */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <InputField
          label="Item cost" tooltip="What you paid to source this item"
          value={itemCost} prefix={currency} onChange={onItemCostChange} />
        <InputField
          label="Shipping cost" tooltip="What YOU pay the courier to ship to the buyer"
          value={shippingCost} prefix={currency} onChange={onShippingCostChange} />
      </div>

      {/* Row 2: Selling price + Buyer paid ship */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <InputField
          label="Selling price" tooltip="Your eBay listing price"
          value={sellingPrice} prefix={currency} onChange={onSellingPriceChange} />
        <InputField
          label="Buyer paid ship" tooltip="Shipping the buyer pays you — eBay charges FVF on this too"
          value={buyerPaidShipping} prefix={currency} onChange={onBuyerPaidShipChange} />
      </div>

      <Divider />

      {/* Searchable category */}
      <SearchableCategory
        label="eBay category"
        tooltip="eBay final value fee varies by category. Use search to find yours faster."
        currentValue={selectedCategory}
        options={categoryOptions}
        onChange={onCategoryChange}
      />

      {/* Row 3: Store tier + Seller level */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <LabelWithHelp label="Store tier" tooltip={country === 'US'
            ? 'Basic store or higher unlocks lower fee rates across all categories'
            : 'eBay Store subscriptions reduce your final value fee'} />
          <ProDropdown
            prefix=""
            currentValue={selectedStoreTier}
            options={(storeTierOptions ?? []).map(o => ({ val: o.value, label: o.label, enabled: true }))}
            onChanged={onStoreTierChange}
            width="full"
            maxItems={6}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <LabelWithHelp label="Seller level" tooltip={country === 'US'
            ? 'Top Rated Plus: 10% off FVF amount. Below Standard: +6% additional FVF.'
            : 'Top Rated: discount on FVF. Below Standard: higher fees.'} />
          <ProDropdown
            prefix=""
            currentValue={selectedSellerLevel}
            options={(sellerLevelOptions ?? []).map(o => ({ val: o.value, label: o.label, enabled: true }))}
            onChanged={onSellerLevelChange}
            width="full"
            maxItems={8}
          />
        </div>
      </div>

      {/* Row 4: Promoted ad rate + Est. buyer tax */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <InputField
          label="Promoted ad rate"
          tooltip="Promoted Listings rate. Stacks on top of FVF. Leave 0 if not running ads."
          value={adRate} suffix="%" onChange={onAdRateChange} />
        <InputField
          label="Est. buyer tax"
          tooltip="Sales tax / VAT % collected from buyer. eBay applies FVF to this amount too."
          value={buyerTax} suffix="%" onChange={onBuyerTaxChange} />
      </div>

      <Divider />

      {/* International sale toggle */}
      <Toggle
        label="International sale"
        tooltip={`Adds eBay cross-border fee when your buyer is in a different country`}
        checked={isInternational}
        onChange={onInternationalChange} />

      {/* Regulatory fee toggle */}
      <Toggle
        label={`Regulatory fee (${regulatoryFeeRate}%)`}
        tooltip={regFeeConfirmed
          ? `Confirmed for ${country} — verify exact rate on your seller invoice`
          : `Unconfirmed for ${country} — check your eBay seller invoice before enabling`}
        checked={includeRegFee}
        onChange={onRegFeeChange} />
      {!regFeeConfirmed && (
        <p style={{ fontSize: 9, color: C.muted, margin: '-8px 0 0', lineHeight: 1.4 }}>
          Unconfirmed for {country} — verify on your seller invoice.
        </p>
      )}

      <Divider />

      {/* Advanced pro toggle */}
      <Toggle
        label="Advanced pro factors"
        tooltip="Adds sourcing tax, FX fees, return buffer, payout fees and cashback to your calculation"
        checked={isAdvancedEnabled}
        onChange={onAdvancedChange} />

      {/* Advanced panel */}
      {isAdvancedEnabled && (
        <div style={{
          background: C.bg, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: 12,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <InputField
              label="Sourcing tax %" tooltip="Tax paid when buying stock from your supplier"
              value={sourcingTax} suffix="%" onChange={onSourcingTaxChange} />
            <InputField
              label="Bank FX fee %" tooltip="Currency conversion fee on your sourcing cost"
              value={fxFee} suffix="%" onChange={onFxFeeChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <InputField
              label="Return buffer %" tooltip="Expected return/defect rate as a revenue loss buffer"
              value={defectRate} suffix="%" onChange={onDefectRateChange} />
            <InputField
              label="Payout fee %" tooltip="PayPal: 3.49% | Stripe: 2.9% | Square: 2.6% | eBay managed: ~0.2% | Enter your processor's rate here"
              value={payoutFee} suffix="%" onChange={onPayoutFeeChange} />
          </div>
          <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0', lineHeight: 1.4 }}>
            💳 PayPal 3.49% · Stripe 2.9% · Square 2.6% · eBay managed ~0.2%
          </p>
          <InputField
            label="Cashback / rewards %" tooltip="Cashback earned on sourcing cost — adds back to profit"
            value={cashback} suffix="%" onChange={onCashbackChange} />
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={onReset}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 36, borderRadius: 8, border: `1px solid ${C.border}`,
          background: C.surface, color: C.muted,
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
        <RotateCcw size={13} />
        Reset to defaults
      </button>

    </div>
  )
}
