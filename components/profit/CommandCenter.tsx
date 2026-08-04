'use client'
// components/profit/CommandCenter.tsx
// Riazify brand colors applied throughout.
// Searchable category dialog + speech bubble tooltips kept from original.
// Payment Processor removed. US tiered fee fields + regulatory fee + advanced pro added.

import { useState, useRef, useEffect } from 'react'
import { Info, Search, X, RotateCcw, RefreshCw, Loader } from 'lucide-react'
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
  cpcEnabled: boolean
  cpcBid: string
  cpcCTR: string
  cpcCVR: string
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
  // Output VAT
  outputVATEnabled: boolean
  outputVATPercent: number
  hasOutputVATRate: boolean   // true if country has a known VAT rate
  // advanced values
  sourcingTax: string
  fxFee: string
  buyCurrency: string
  fxRate: string
  fxEnabled: boolean
  sellCurrencySymbol: string   // e.g. '£', '€', '$'
  sellCurrencyCode: string   // e.g. 'GBP', 'EUR', 'USD'
  defectRate: string
  payoutFee: string
  defaultPayoutFee: number   // country-specific eBay managed payments default
  cashback: string
  // paypal
  paypalEnabled: boolean
  paypalType: string
  paypalRate: string
  // callbacks
  onItemCostChange: (v: string) => void
  onShippingCostChange: (v: string) => void
  onSellingPriceChange: (v: string) => void
  onBuyerPaidShipChange: (v: string) => void
  onAdRateChange: (v: string) => void
  onCpcEnabledChange: (v: boolean) => void
  onCpcBidChange: (v: string) => void
  onCpcCTRChange: (v: string) => void
  onCpcCVRChange: (v: string) => void
  onBuyerTaxChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onStoreTierChange: (v: string) => void
  onSellerLevelChange: (v: string) => void
  onInternationalChange: (v: boolean) => void
  onRegFeeChange: (v: boolean) => void
  onOutputVATChange: (enabled: boolean, percent: number) => void
  onAdvancedChange: (v: boolean) => void
  onSourcingTaxChange: (v: string) => void
  onFxFeeChange: (v: string) => void
  onBuyCurrencyChange: (v: string) => void
  onFxRateChange: (v: string) => void
  onFxEnabledChange: (v: boolean) => void
  onDefectRateChange: (v: string) => void
  onPayoutFeeChange: (v: string) => void
  onCashbackChange: (v: string) => void
  onPaypalEnabledChange: (v: boolean) => void
  onPaypalTypeChange: (v: string) => void
  onPaypalRateChange: (v: string) => void
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
  label, tooltip, value, onChange, prefix, suffix, max,
}: {
  label: string
  tooltip: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  max?: number
}) {
  const [focused, setFocused] = useState(false)
  const displayValue = !focused && value !== '' && !isNaN(parseFloat(value))
    ? parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : value
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
          value={displayValue}
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9.]/g, '')
            const num = parseFloat(raw)
            if (max !== undefined && !isNaN(num) && num > max) return
            onChange(raw)
          }}
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
  adRate, cpcEnabled, cpcBid, cpcCTR, cpcCVR, buyerTax,
  selectedCategory, selectedStoreTier, selectedSellerLevel,
  isInternational, includeRegFee, regFeeConfirmed, regulatoryFeeRate,
  outputVATEnabled, outputVATPercent, hasOutputVATRate,
  isAdvancedEnabled,
  sourcingTax, fxFee, buyCurrency, fxRate, fxEnabled, sellCurrencySymbol, sellCurrencyCode, defectRate, payoutFee, defaultPayoutFee, cashback,
  onItemCostChange, onShippingCostChange, onSellingPriceChange, onBuyerPaidShipChange,
  onAdRateChange, onCpcEnabledChange, onCpcBidChange, onCpcCTRChange, onCpcCVRChange, onBuyerTaxChange, onCategoryChange, onStoreTierChange,
  onSellerLevelChange, onInternationalChange, onRegFeeChange, onOutputVATChange, onAdvancedChange,
  onSourcingTaxChange, onFxFeeChange, onBuyCurrencyChange, onFxRateChange, onFxEnabledChange, onDefectRateChange, onPayoutFeeChange,
  onCashbackChange, onReset, onPaypalEnabledChange, onPaypalTypeChange, onPaypalRateChange,
  paypalEnabled, paypalType, paypalRate,
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
          value={itemCost} prefix={currency} onChange={onItemCostChange} max={999999.99} />
        <InputField
          label="Shipping cost" tooltip="What YOU pay the courier to ship to the buyer"
          value={shippingCost} prefix={currency} onChange={onShippingCostChange} max={9999.99} />
      </div>

      {/* Row 2: Selling price + Buyer paid ship */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <InputField
          label="Selling price" tooltip="Your eBay listing price"
          value={sellingPrice} prefix={currency} onChange={onSellingPriceChange} max={999999.99} />
        <InputField
          label="Buyer paid ship" tooltip="Shipping the buyer pays you — eBay charges FVF on this too"
          value={buyerPaidShipping} prefix={currency} onChange={onBuyerPaidShipChange} max={9999.99} />
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

      {/* Row 4: Promoted Listings (PLS + CPC) + buyer tax */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Promoted Listings section */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Promoted Listings</span>

          {/* PLS row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <InputField
              label="PLS rate %"
              tooltip="Promoted Listings Standard — % of sale price charged only when buyer clicks your ad and purchases. Stacks on top of FVF."
              value={adRate} suffix="%" onChange={onAdRateChange} />
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
              <p style={{ fontSize: 10, color: C.muted, margin: 0, lineHeight: 1.5 }}>Pay-on-sale. eBay suggests 2–15%.</p>
            </div>
          </div>

          {/* CPC toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>+ PLA (CPC) — Promoted Listings Advanced</span>
              <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>Pay per click regardless of sale — estimates cost from bid × CTR × CVR</p>
            </div>
            <button onClick={() => onCpcEnabledChange(!cpcEnabled)} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: cpcEnabled ? C.lime : C.border, transition: 'background 0.2s' }}>
              <span style={{ position: 'absolute', top: 2.5, left: cpcEnabled ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
            </button>
          </div>

          {/* CPC inputs */}
          {cpcEnabled && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>Max CPC bid</p>
                  <div style={{ display: 'flex', alignItems: 'center', height: 26, padding: '0 4px', gap: 2, border: `1.5px solid ${C.border}`, borderRadius: 6, background: C.surface }}>
                    <span style={{ fontSize: 10, color: C.muted }}>{sellCurrencySymbol}</span>
                    <input type="text" inputMode="decimal" value={cpcBid} onChange={e => onCpcBidChange(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00"
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 11, fontWeight: 600, color: C.text, background: 'transparent', minWidth: 0 }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>Est. CTR %</p>
                  <div style={{ display: 'flex', alignItems: 'center', height: 26, padding: '0 4px', gap: 2, border: `1.5px solid ${C.border}`, borderRadius: 6, background: C.surface }}>
                    <input type="text" inputMode="decimal" value={cpcCTR} onChange={e => onCpcCTRChange(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.0"
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 11, fontWeight: 600, color: C.text, background: 'transparent', minWidth: 0 }} />
                    <span style={{ fontSize: 10, color: C.muted }}>%</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>Est. CVR %</p>
                  <div style={{ display: 'flex', alignItems: 'center', height: 26, padding: '0 4px', gap: 2, border: `1.5px solid ${C.border}`, borderRadius: 6, background: C.surface }}>
                    <input type="text" inputMode="decimal" value={cpcCVR} onChange={e => onCpcCVRChange(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.0"
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 11, fontWeight: 600, color: C.text, background: 'transparent', minWidth: 0 }} />
                    <span style={{ fontSize: 10, color: C.muted }}>%</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 10, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                💡 Est. cost per sale ≈ {sellCurrencySymbol}{(parseFloat(cpcBid) > 0 && parseFloat(cpcCTR) > 0 && parseFloat(cpcCVR) > 0 ? (parseFloat(cpcBid) / ((parseFloat(cpcCTR) / 100) * (parseFloat(cpcCVR) / 100))).toFixed(2) : '—')} · Electronics CTR~1.8%/CVR~2.5% · Fashion CTR~2.2%/CVR~3% · Collectibles CTR~2.5%/CVR~4%
              </p>
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <InputField
            label="Est. buyer tax"
            tooltip="Sales tax / VAT % collected from buyer. eBay applies FVF to this amount too."
            value={buyerTax} suffix="%" onChange={onBuyerTaxChange} />
        </div>
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

      {/* Output VAT toggle — only show for countries with a known VAT rate */}
      {hasOutputVATRate && (
        <>
          <Toggle
            label={`Output VAT on sales (${outputVATPercent}%)`}
            tooltip={`VAT-registered sellers must remit ${outputVATPercent}% of the sale price to the tax authority. Enabling this shows your real post-VAT profit. Toggle off if you list prices ex-VAT (B2B).`}
            checked={outputVATEnabled}
            onChange={v => onOutputVATChange(v, outputVATPercent)} />
          {outputVATEnabled && (
            <p style={{ fontSize: 9, color: C.amber, margin: '-8px 0 0', lineHeight: 1.4 }}>
              Prices assumed inc-VAT. Net revenue = sale price ÷ {(1 + outputVATPercent / 100).toFixed(4)}
            </p>
          )}
        </>
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
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8, background: C.surface, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
              {/* FX toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Cross-currency sourcing</span>
                  <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>
                    {fxEnabled
                      ? `Buying in ${buyCurrency}, selling in ${sellCurrencyCode} — rate applied to buy cost`
                      : `Enable if you source in a different currency to your eBay market (${sellCurrencyCode})`}
                  </p>
                </div>
                <button onClick={() => onFxEnabledChange(!fxEnabled)} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: fxEnabled ? C.lime : C.border, transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', top: 2.5, left: fxEnabled ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                </button>
              </div>
              {fxEnabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.text }}>Buy currency</label>
                    <ProDropdown
                      prefix=""
                      currentValue={buyCurrency}
                      options={[
                        { val: 'USD', label: 'USD — US Dollar', flagCode: 'us', enabled: true },
                        { val: 'GBP', label: 'GBP — British Pound', flagCode: 'gb', enabled: true },
                        { val: 'EUR', label: 'EUR — Euro', flagCode: 'eu', enabled: true },
                        { val: 'CAD', label: 'CAD — Canadian Dollar', flagCode: 'ca', enabled: true },
                        { val: 'AUD', label: 'AUD — Australian Dollar', flagCode: 'au', enabled: true },
                        { val: 'CNY', label: 'CNY — Chinese Yuan', flagCode: 'cn', enabled: true },
                        { val: 'JPY', label: 'JPY — Japanese Yen', flagCode: 'jp', enabled: true },
                        { val: 'HKD', label: 'HKD — Hong Kong Dollar', flagCode: 'hk', enabled: true },
                        { val: 'SGD', label: 'SGD — Singapore Dollar', flagCode: 'sg', enabled: true },
                        { val: 'CHF', label: 'CHF — Swiss Franc', flagCode: 'ch', enabled: true },
                        { val: 'PLN', label: 'PLN — Polish Złoty', flagCode: 'pl', enabled: true },
                        { val: 'INR', label: 'INR — Indian Rupee', flagCode: 'in', enabled: true },
                        { val: 'MXN', label: 'MXN — Mexican Peso', flagCode: 'mx', enabled: true },
                        { val: 'BRL', label: 'BRL — Brazilian Real', flagCode: 'br', enabled: true },
                        { val: 'AED', label: 'AED — UAE Dirham', flagCode: 'ae', enabled: true },
                        { val: 'KRW', label: 'KRW — South Korean Won', flagCode: 'kr', enabled: true },
                        { val: 'THB', label: 'THB — Thai Baht', flagCode: 'th', enabled: true },
                        { val: 'TRY', label: 'TRY — Turkish Lira', flagCode: 'tr', enabled: true },
                        { val: 'NZD', label: 'NZD — New Zealand Dollar', flagCode: 'nz', enabled: true },
                        { val: 'SEK', label: 'SEK — Swedish Krona', flagCode: 'se', enabled: true },
                        { val: 'NOK', label: 'NOK — Norwegian Krone', flagCode: 'no', enabled: true },
                        { val: 'DKK', label: 'DKK — Danish Krone', flagCode: 'dk', enabled: true },
                        { val: 'ZAR', label: 'ZAR — South African Rand', flagCode: 'za', enabled: true },
                        { val: 'TWD', label: 'TWD — Taiwan Dollar', flagCode: 'tw', enabled: true },
                        { val: 'MYR', label: 'MYR — Malaysian Ringgit', flagCode: 'my', enabled: true },
                        { val: 'IDR', label: 'IDR — Indonesian Rupiah', flagCode: 'id', enabled: true },
                        { val: 'VND', label: 'VND — Vietnamese Dong', flagCode: 'vn', enabled: true },
                        { val: 'BDT', label: 'BDT — Bangladeshi Taka', flagCode: 'bd', enabled: true },
                        { val: 'PKR', label: 'PKR — Pakistani Rupee', flagCode: 'pk', enabled: true },
                        { val: 'LKR', label: 'LKR — Sri Lankan Rupee', flagCode: 'lk', enabled: true },
                      ]}
                      onChanged={onBuyCurrencyChange}
                      width="full"
                      maxItems={8}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <LabelWithHelp
                      label={`Rate (1 ${buyCurrency} = ? ${sellCurrencyCode})`}
                      tooltip={`Enter how many ${sellCurrencyCode} you get for 1 ${buyCurrency}. Example: if 1 USD = 0.92 EUR, enter 0.92`}
                    />
                    <div style={{ display: 'flex', gap: 4 }}>
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        height: 36, padding: '0 10px', gap: 4,
                        border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.surface,
                      }}>
                        <input
                          type="text" inputMode="decimal"
                          value={fxRate}
                          onChange={e => onFxRateChange(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder="0.00"
                          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: C.text, background: 'transparent', minWidth: 0 }}
                        />
                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{sellCurrencyCode}</span>
                        <button
                          onClick={async () => {
                            try {
                              onFxRateChange('Loading...')
                              const res = await fetch(`https://open.er-api.com/v6/latest/${buyCurrency}`)
                              const data = await res.json()
                              const rate = data?.rates?.[sellCurrencyCode]
                              if (rate) {
                                onFxRateChange(rate.toFixed(4))
                              } else {
                                onFxRateChange('')
                                alert('Could not fetch rate. Please enter manually.')
                              }
                            } catch {
                              onFxRateChange('')
                              alert('Failed to fetch rate. Please enter manually.')
                            }
                          }}
                          title="Get live exchange rate"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '2px 4px', borderRadius: 4, flexShrink: 0,
                            display: 'flex', alignItems: 'center',
                            color: fxRate === 'Loading...' ? C.muted : C.dark,
                            fontSize: 14, fontWeight: 700,
                          }}
                        >
                          {fxRate === 'Loading...' ? <Loader size={13} color={C.muted} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} color={C.dark} />}
                        </button>
                      </div>
                    </div>
                    {fxRate && fxRate !== 'Loading...' && parseFloat(fxRate) > 0 && (
                      <p style={{ fontSize: 9, color: C.muted, margin: '2px 0 0' }}>
                        1 {buyCurrency} = {fxRate} {sellCurrencyCode} · {(1 / parseFloat(fxRate)).toFixed(4)} {buyCurrency} = 1 {sellCurrencyCode}
                      </p>
                    )}
                  </div>
                  <InputField
                    label="Bank FX fee %"
                    tooltip="Extra % your bank or payment processor charges on top of the conversion (e.g. 1.5% for Wise, 2-3% for credit cards)"
                    value={fxFee}
                    suffix="%"
                    onChange={onFxFeeChange}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 4 }}>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                      <Info size={10} color={C.muted} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span><strong>Wise:</strong> ~0.5–1% · <strong>Revolut:</strong> ~0% · <strong>Credit card:</strong> 2–3%</span>
                    </p>
                  </div>
                </div>
              )}
              {!fxEnabled && (
                <InputField
                  label="Bank FX fee %"
                  tooltip="Currency conversion fee on your sourcing cost (same currency)"
                  value={fxFee}
                  suffix="%"
                  onChange={onFxFeeChange}
                />
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <InputField
              label="Return buffer %" tooltip="Expected return/defect rate as a revenue loss buffer"
              value={defectRate} suffix="%" onChange={onDefectRateChange} />
            <InputField
              label="Payout fee %" tooltip={`eBay managed payments default for this country: ${defaultPayoutFee}%. Override if you use a different processor. PayPal: 3.49% | Stripe: 2.9% | Square: 2.6%`}
              value={payoutFee} suffix="%" onChange={onPayoutFeeChange} />
          </div>
          <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
            <Info size={10} color={C.muted} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>eBay managed: {defaultPayoutFee}% (this country) · PayPal: 3.49% · Stripe: 2.9% · Square: 2.6%</span>
          </p>
          <InputField
            label="Cashback / rewards %" tooltip="Cashback earned on sourcing cost — adds back to profit"
            value={cashback} suffix="%" onChange={onCashbackChange} />

          {/* PayPal fee toggle */}
          <div style={{ background: C.surface, borderRadius: 8, padding: 10, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>PayPal fee</span>
                <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>
                  {paypalEnabled ? 'Deducted from profit in ledger' : 'Enable if buyer pays via PayPal'}
                </p>
              </div>
              <button onClick={() => onPaypalEnabledChange(!paypalEnabled)} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: paypalEnabled ? C.lime : C.border, transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 2.5, left: paypalEnabled ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
              </button>
            </div>
            {paypalEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.text }}>Transaction type</label>
                    <ProDropdown
                      prefix=""
                      currentValue={paypalType}
                      options={[
                        { val: 'goods', label: 'Goods & Services (3.49%)', enabled: true },
                        { val: 'micropayment', label: 'Micropayment <$10 (5%)', enabled: true },
                        { val: 'international', label: 'International (4.99%)', enabled: true },
                        { val: 'custom', label: 'Custom rate', enabled: true },
                      ]}
                      onChanged={onPaypalTypeChange}
                      width="full"
                      maxItems={4}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.text }}>Rate %</label>
                    <div style={{ height: 34, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '0 8px', background: paypalType === 'custom' ? C.surface : C.bg, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="text" inputMode="decimal"
                        value={paypalRate}
                        onChange={e => onPaypalRateChange(e.target.value.replace(/[^0-9.]/g, ''))}
                        readOnly={paypalType !== 'custom'}
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, fontWeight: 600, color: paypalType === 'custom' ? C.text : C.muted, background: 'transparent' }}
                      />
                      <span style={{ fontSize: 11, color: C.muted }}>%</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: C.muted, margin: 0, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <Info size={9} color={C.muted} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Goods & Services:</strong> 3.49% + $0.49 · <strong>International:</strong> 4.99% + fixed · <strong>Micropayment:</strong> 5% + $0.05</span>
                </p>
              </div>
            )}
          </div>
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

    </div>
  )
}
