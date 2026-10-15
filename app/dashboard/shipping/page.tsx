'use client'
// app/dashboard/shipping/page.tsx
// Shipping Label Generator — Step 1 (Package) → Step 2 (Rate) → Step 3 (Confirm) → Success

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Package, Truck, MapPin, Weight, Ruler, ChevronRight,
  Plus, Check, Loader2, AlertCircle, RefreshCw,
  ArrowLeft, Shield, Clock, X, ChevronDown, Info,
  Box, Copy, Download, CheckCircle2, RotateCcw, Sparkles,
  ExternalLink, FileText,
} from 'lucide-react'
import ProDropdown, { DropdownOption } from '@/components/ui/ProDropdown'

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:           '#f8f7ff',
  surface:      '#ffffff',
  border:       '#ede9fe',
  borderInput:  '#e5e0f5',
  primary:      '#7530fb',
  primaryHover: '#6020e0',
  primaryLight: '#f3eeff',
  accent:       '#b8fa33',
  dark:         '#1e1535',
  body:         '#1f1d2e',
  secondary:    '#6b7280',
  muted:        '#9ca3af',
  success:      '#16a34a',
  successBg:    '#dcfce7',
  warning:      '#d97706',
  warningBg:    '#fef3c7',
  danger:       '#ef4444',
  dangerBg:     '#fee2e2',
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface Preset      { id: string; name: string; l: string; w: string; h: string; wLbs: string; wOz: string }
interface Recipient   { name: string; addr1: string; addr2: string; city: string; state: string; zip: string; country: string }
interface ShipRate    {
  rateId: string; carrierId: string; carrierName: string
  serviceCode: string; serviceName: string
  totalPrice: number; currency: string
  deliveryDays: number | null; deliveryLabel: string
  tags: Array<'cheapest' | 'fastest' | 'suggested'>
  includedInsurance: number
}
interface LabelResult {
  shipmentId: string; trackingNumber: string
  labelDownloadUrl: string | null; source: 'ebay' | 'mock'
}

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

// Common eBay shipping destinations — shaped as DropdownOption for ProDropdown
const COUNTRIES: DropdownOption[] = [
  { val: 'US', label: 'United States',  enabled: true, flagCode: 'us' },
  { val: 'CA', label: 'Canada',         enabled: true, flagCode: 'ca' },
  { val: 'GB', label: 'United Kingdom', enabled: true, flagCode: 'gb' },
  { val: 'AU', label: 'Australia',      enabled: true, flagCode: 'au' },
  { val: 'DE', label: 'Germany',        enabled: true, flagCode: 'de' },
  { val: 'FR', label: 'France',         enabled: true, flagCode: 'fr' },
  { val: 'IT', label: 'Italy',          enabled: true, flagCode: 'it' },
  { val: 'ES', label: 'Spain',          enabled: true, flagCode: 'es' },
  { val: 'NL', label: 'Netherlands',    enabled: true, flagCode: 'nl' },
  { val: 'JP', label: 'Japan',          enabled: true, flagCode: 'jp' },
  { val: 'KR', label: 'South Korea',    enabled: true, flagCode: 'kr' },
  { val: 'CN', label: 'China',          enabled: true, flagCode: 'cn' },
  { val: 'SG', label: 'Singapore',      enabled: true, flagCode: 'sg' },
  { val: 'HK', label: 'Hong Kong',      enabled: true, flagCode: 'hk' },
  { val: 'TW', label: 'Taiwan',         enabled: true, flagCode: 'tw' },
  { val: 'MX', label: 'Mexico',         enabled: true, flagCode: 'mx' },
  { val: 'BR', label: 'Brazil',         enabled: true, flagCode: 'br' },
  { val: 'IN', label: 'India',          enabled: true, flagCode: 'in' },
  { val: 'AE', label: 'UAE',            enabled: true, flagCode: 'ae' },
  { val: 'SA', label: 'Saudi Arabia',   enabled: true, flagCode: 'sa' },
  { val: 'PH', label: 'Philippines',    enabled: true, flagCode: 'ph' },
  { val: 'MY', label: 'Malaysia',       enabled: true, flagCode: 'my' },
  { val: 'NZ', label: 'New Zealand',    enabled: true, flagCode: 'nz' },
  { val: 'SE', label: 'Sweden',         enabled: true, flagCode: 'se' },
  { val: 'CH', label: 'Switzerland',    enabled: true, flagCode: 'ch' },
  { val: 'PL', label: 'Poland',         enabled: true, flagCode: 'pl' },
  { val: 'NO', label: 'Norway',         enabled: true, flagCode: 'no' },
  { val: 'DK', label: 'Denmark',        enabled: true, flagCode: 'dk' },
  { val: 'BE', label: 'Belgium',        enabled: true, flagCode: 'be' },
  { val: 'AT', label: 'Austria',        enabled: true, flagCode: 'at' },
  { val: 'IL', label: 'Israel',         enabled: true, flagCode: 'il' },
  { val: 'ZA', label: 'South Africa',   enabled: true, flagCode: 'za' },
]

const DEFAULT_PRESETS: Preset[] = [
  { id: 'poly',   name: 'Poly Mailer', l: '12', w: '15', h: '0',  wLbs: '0', wOz: '4'  },
  { id: 'small',  name: 'Small Box',   l: '8',  w: '6',  h: '4',  wLbs: '1', wOz: '0'  },
  { id: 'medium', name: 'Medium Box',  l: '12', w: '10', h: '8',  wLbs: '3', wOz: '0'  },
  { id: 'large',  name: 'Large Box',   l: '18', w: '16', h: '12', wLbs: '8', wOz: '0'  },
]

// ── Carrier badge ──────────────────────────────────────────────────────────────
function CarrierBadge({ carrierId, size = 36 }: { carrierId: string; size?: number }) {
  const map: Record<string, { bg: string; color: string; text: string }> = {
    USPS:  { bg: '#004B87', color: '#fff',    text: 'USPS'  },
    UPS:   { bg: '#351C15', color: '#FFB500', text: 'UPS'   },
    FEDEX: { bg: '#4D148C', color: '#FF6600', text: 'FedEx' },
  }
  const cfg = map[carrierId] ?? { bg: C.primary, color: '#fff', text: carrierId }
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.27, fontWeight: 900, color: cfg.color, fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.5px' }}>{cfg.text}</span>
    </div>
  )
}

// ── Tag chip ──────────────────────────────────────────────────────────────────
function TagChip({ tag }: { tag: 'cheapest' | 'fastest' | 'suggested' }) {
  const cfg = {
    cheapest:  { label: '$ Cheapest',  bg: C.successBg,    color: C.success },
    fastest:   { label: '⚡ Fastest',   bg: C.warningBg,    color: C.warning },
    suggested: { label: '★ Suggested', bg: C.primaryLight, color: C.primary },
  }[tag]
  return <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, backgroundColor: cfg.bg, color: cfg.color, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>{cfg.label}</span>
}

// ── Rate skeleton ──────────────────────────────────────────────────────────────
function RateSkeleton() {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px', backgroundColor: C.surface, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[70, 45, 55].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 18 : 11, width: `${w}%`, borderRadius: 6, backgroundColor: '#f0eeff', animation: 'shimmer 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

// ── Barcode SVG (visual, not scannable) ──────────────────────────────────────
function MockBarcode({ value }: { value: string }) {
  const bars = value.split('').map((c, i) => ({
    w: ((c.charCodeAt(0) % 3) + 1) * 2,
    x: i * 6,
  }))
  const totalW = bars.length * 6 + 10
  return (
    <svg width={Math.min(totalW, 220)} height={48} viewBox={`0 0 ${totalW} 48`} style={{ display: 'block' }}>
      {bars.map((b, i) => (
        <rect key={i} x={b.x + 5} y={0} width={b.w} height={40} fill="#1e1535" />
      ))}
      <text x={totalW / 2} y={47} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="#1e1535">
        {value.slice(0, 22)}
      </text>
    </svg>
  )
}

// ── Visual mock label (shown when no real PDF) ────────────────────────────────
function MockLabel({ result, rate, recipient, from }: {
  result: LabelResult
  rate: ShipRate
  recipient: Recipient
  from: { name: string; city: string; state: string; zip: string }
}) {
  return (
    <div style={{
      width: '100%', maxWidth: 420, margin: '0 auto',
      backgroundColor: '#fff', border: '2px solid #1e1535', borderRadius: 4,
      fontFamily: 'monospace', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    }}>
      {/* Header bar */}
      <div style={{ backgroundColor: '#1e1535', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CarrierBadge carrierId={rate.carrierId} size={28} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '1px', fontFamily: 'DM Sans, sans-serif' }}>
          {rate.serviceName.toUpperCase()}
        </span>
        <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>eBay Label</span>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* From / To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ fontSize: 8, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif' }}>FROM</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#1e1535', margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif' }}>{from.name}</p>
            <p style={{ fontSize: 10, color: '#374151', margin: 0, lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif' }}>{from.city}, {from.state} {from.zip}</p>
          </div>
          <div>
            <p style={{ fontSize: 8, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif' }}>SHIP TO</p>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#1e1535', margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif' }}>{recipient.name}</p>
            <p style={{ fontSize: 11, color: '#374151', margin: 0, lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif' }}>
              {recipient.addr1}{recipient.addr2 ? `, ${recipient.addr2}` : ''}<br />
              {recipient.city}{recipient.state ? `, ${recipient.state}` : ''} {recipient.zip}<br />
              {recipient.country !== 'US' && (() => { const cc = COUNTRIES.find(c=>c.val===recipient.country); return cc ? <><span className={`fi fi-${cc.flagCode}`} style={{ borderRadius: 2, marginRight: 4 }} /><strong style={{ fontSize: 10, letterSpacing: '0.5px' }}>{cc.label}</strong></> : null })()}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: '#e5e7eb' }} />

        {/* Barcode */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <MockBarcode value={result.trackingNumber} />
          <p style={{ fontSize: 9, letterSpacing: '2px', color: '#374151', margin: 0, fontFamily: 'monospace' }}>
            {result.trackingNumber}
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #d1d5db', paddingTop: 8 }}>
          <span style={{ fontSize: 9, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Powered by eBay Logistics</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>${rate.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Shared input styles ────────────────────────────────────────────────────────
const inp: React.CSSProperties = { border: `1px solid ${C.borderInput}`, borderRadius: 10, padding: '9px 12px', width: '100%', backgroundColor: C.surface, color: C.body, fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }
const lbl: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: C.secondary, fontFamily: 'DM Sans, sans-serif', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.6px' }
const sel: React.CSSProperties = { ...inp, cursor: 'pointer', appearance: 'none' as any }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column' }}><label style={lbl}>{label}</label>{children}</div>
}
function focusOn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px ${C.primaryLight}` }
function blurOn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>)  { e.target.style.borderColor = C.borderInput; e.target.style.boxShadow = 'none' }

// ── Step header component ──────────────────────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [{ n: 1, label: 'Package' }, { n: 2, label: 'Choose Rate' }, { n: 3, label: 'Confirm' }]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {steps.map(({ n, label }, i) => (
        <React.Fragment key={n}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: current >= n ? C.primary : C.border, transition: 'background-color 0.25s' }}>
              {current > n ? <Check size={11} style={{ color: '#fff' }} /> : <span style={{ fontSize: 11, fontWeight: 700, color: current === n ? '#fff' : C.muted }}>{n}</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: current === n ? C.primary : current > n ? C.success : C.muted, whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{label}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 24, height: 1, backgroundColor: current > n ? C.primary : C.border, flexShrink: 0, transition: 'background-color 0.3s' }} />}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ShippingPage() {
  const [step,         setStep]         = useState<1 | 2 | 3>(1)
  const [recipient,    setRecipient]    = useState<Recipient>({ name: '', addr1: '', addr2: '', city: '', state: 'NY', zip: '', country: 'US' })
  const [dimUnit,      setDimUnit]      = useState<'in' | 'cm'>('in')
  const [pkgType,      setPkgType]      = useState<'box' | 'mailer'>('box')
  const [length,       setLength]       = useState('')
  const [width,        setWidth]        = useState('')
  const [height,       setHeight]       = useState('')
  const [wLbs,         setWLbs]         = useState('')
  const [wOz,          setWOz]          = useState('')
  const [presets,      setPresets]      = useState<Preset[]>(DEFAULT_PRESETS)
  const [addingPreset, setAddingPreset] = useState(false)
  const [presetName,   setPresetName]   = useState('')
  const [rates,        setRates]        = useState<ShipRate[]>([])
  const [loadingRates, setLoadingRates] = useState(false)
  const [selectedRate, setSelectedRate] = useState<string | null>(null)
  const [isMock,       setIsMock]       = useState(false)
  const [formErr,      setFormErr]      = useState<string | null>(null)
  const [rateErr,      setRateErr]      = useState<string | null>(null)
  // Step 3 add-ons
  const [addInsurance,    setAddInsurance]    = useState(false)
  const [insuranceValue,  setInsuranceValue]  = useState('100')
  const [addSignature,    setAddSignature]    = useState(false)
  // Purchase
  const [buying,       setBuying]       = useState(false)
  const [buyErr,       setBuyErr]       = useState<string | null>(null)
  const [labelResult,  setLabelResult]  = useState<LabelResult | null>(null)
  const [copied,       setCopied]       = useState(false)

  const totalOz = Math.round((parseFloat(wLbs || '0') * 16) + parseFloat(wOz || '0'))
  const weightDisplay = totalOz > 0 ? (totalOz >= 16 ? `${Math.floor(totalOz / 16)} lb ${totalOz % 16} oz` : `${totalOz} oz`) : null
  const selectedRateObj = rates.find(r => r.rateId === selectedRate) ?? null
  const finalPrice = selectedRateObj ? (selectedRateObj.totalPrice + (addInsurance ? 1.65 : 0) + (addSignature ? 2.90 : 0)) : 0

  function applyPreset(p: Preset) {
    setLength(p.l); setWidth(p.w); setHeight(p.h); setWLbs(p.wLbs); setWOz(p.wOz)
    setPkgType(p.h === '0' ? 'mailer' : 'box')
  }
  function savePreset() {
    if (!presetName.trim()) return
    setPresets(p => [...p, { id: Date.now().toString(), name: presetName.trim(), l: length, w: width, h: pkgType === 'mailer' ? '0' : height, wLbs, wOz }])
    setPresetName(''); setAddingPreset(false)
  }

  async function handleGetRates() {
    setFormErr(null)
    if (!recipient.name.trim())  return setFormErr('Recipient name is required')
    if (!recipient.addr1.trim()) return setFormErr('Street address is required')
    if (!recipient.city.trim())  return setFormErr('City is required')
    if (!recipient.zip.trim())   return setFormErr('ZIP code is required')
    if (!length || !width)       return setFormErr('Package dimensions are required')
    if (totalOz === 0)           return setFormErr('Package weight is required')
    setLoadingRates(true); setRateErr(null); setRates([])
    try {
      const res  = await fetch('/api/ebay/shipping/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toPostalCode: recipient.zip, toCountryCode: recipient.country, weightLbs: parseFloat(wLbs || '0'), weightOz: parseFloat(wOz || '0'), lengthIn: parseFloat(length), widthIn: parseFloat(width), heightIn: pkgType === 'mailer' ? 0 : parseFloat(height || '0') }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not get rates')
      setRates(json.rates ?? [])
      setIsMock(json.source === 'mock')
      if (json.rates?.length > 0) setSelectedRate(json.rates[0].rateId)
      setStep(2)
    } catch (e: any) { setRateErr(e.message) }
    setLoadingRates(false)
  }

  async function handleBuy() {
    if (!selectedRateObj) return
    setBuying(true); setBuyErr(null)
    try {
      const res  = await fetch('/api/ebay/shipping/labels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rateId: selectedRateObj.rateId, carrierId: selectedRateObj.carrierId, serviceCode: selectedRateObj.serviceCode, toName: recipient.name, toAddr1: recipient.addr1, toAddr2: recipient.addr2, toCity: recipient.city, toState: recipient.state, toZip: recipient.zip, toCountry: recipient.country, weightLbs: parseFloat(wLbs || '0'), weightOz: parseFloat(wOz || '0'), lengthIn: parseFloat(length), widthIn: parseFloat(width), heightIn: pkgType === 'mailer' ? 0 : parseFloat(height || '0'), addInsurance, insuranceValue: parseFloat(insuranceValue), addSignature }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Purchase failed')
      setLabelResult(json)
    } catch (e: any) { setBuyErr(e.message) }
    setBuying(false)
  }

  async function copyTracking() {
    if (!labelResult) return
    try { await navigator.clipboard.writeText(labelResult.trackingNumber) } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function reset() { setStep(1); setLabelResult(null); setRates([]); setSelectedRate(null); setBuyErr(null); setFormErr(null); setRateErr(null) }

  // ── Success state ────────────────────────────────────────────────────────────
  if (labelResult) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'auto' }}>
        <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, #a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={16} style={{ color: '#fff' }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.dark, fontFamily: 'Syne, sans-serif', margin: 0 }}>Shipping Labels</p>
          <button onClick={reset} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            <RotateCcw size={12} /> New Label
          </button>
        </div>

        <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

          {/* Success banner */}
          <div style={{ width: '100%', maxWidth: 520, padding: '22px 28px', borderRadius: 20, background: `linear-gradient(135deg, ${C.successBg}, #f0fdf4)`, border: `1.5px solid #86efac`, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${C.success}40` }}>
              <Check size={26} style={{ color: '#fff', strokeWidth: 3 }} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.success, margin: '0 0 2px', fontFamily: 'Syne, sans-serif' }}>Label Created!</p>
              <p style={{ fontSize: 12, color: '#15803d', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                {selectedRateObj?.carrierName} {selectedRateObj?.serviceName} · ${finalPrice.toFixed(2)} charged
                {isMock && <span style={{ marginLeft: 6, opacity: 0.6 }}>(demo)</span>}
              </p>
            </div>
          </div>

          {/* Tracking number */}
          <div style={{ width: '100%', maxWidth: 520, padding: '18px 22px', borderRadius: 16, backgroundColor: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.7px', margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif' }}>Tracking Number</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.dark, margin: 0, fontFamily: 'monospace', letterSpacing: '1px', wordBreak: 'break-all' }}>{labelResult.trackingNumber}</p>
            </div>
            <button onClick={copyTracking}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: `1.5px solid ${copied ? C.success : C.border}`, backgroundColor: copied ? C.successBg : C.bg, color: copied ? C.success : C.secondary, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          {/* Label preview */}
          <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Shipping Label</p>
              {labelResult.labelDownloadUrl && (
                <a href={labelResult.labelDownloadUrl} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: C.primary, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                  <Download size={11} /> Download PDF
                </a>
              )}
            </div>

            {labelResult.labelDownloadUrl ? (
              <iframe src={labelResult.labelDownloadUrl} title="Shipping Label"
                style={{ width: '100%', height: 480, borderRadius: 16, border: `1px solid ${C.border}`, backgroundColor: C.bg }} />
            ) : (
              <MockLabel result={labelResult} rate={selectedRateObj!} recipient={recipient} from={{ name: 'Your Store', city: 'New York', state: 'NY', zip: '10001' }} />
            )}

            {isMock && (
              <p style={{ fontSize: 10, color: C.muted, textAlign: 'center', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                Demo label — connect eBay to generate real printable PDFs
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ width: '100%', maxWidth: 520, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={reset}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 20px', borderRadius: 12, border: `1.5px solid ${C.border}`, backgroundColor: C.surface, color: C.secondary, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              <RotateCcw size={13} /> Create Another
            </button>
            {labelResult.labelDownloadUrl && (
              <a href={labelResult.labelDownloadUrl} target="_blank" rel="noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 20px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.primary}, #a855f7)`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textDecoration: 'none', boxShadow: `0 4px 14px ${C.primary}40` }}>
                <Download size={13} /> Download Label
              </a>
            )}
          </div>
        </div>
        <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      </div>
    )
  }

  // ── Normal wizard ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.bg, fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, #a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Truck size={16} style={{ color: '#fff' }} />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.dark, fontFamily: 'Syne, sans-serif', margin: 0, lineHeight: 1.2 }}>Shipping Labels</p>
          <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Create & print eBay-discounted labels</p>
        </div>
        <div style={{ marginLeft: 'auto' }}><StepIndicator current={step} /></div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

            {/* Ship To */}
            <div style={{ backgroundColor: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={14} style={{ color: C.primary }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif' }}>Ship To</p>
                  <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Recipient's delivery address</p>
                </div>
              </div>
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>

                {/* Country selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={lbl}>Country</label>
                  <ProDropdown
                    prefix=""
                    currentValue={recipient.country}
                    options={COUNTRIES}
                    onChanged={code => setRecipient(r => ({ ...r, country: code, state: code === 'US' ? 'NY' : '' }))}
                    width="full"
                    maxItems={8}
                  />
                </div>

                {/* International shipping notice */}
                {recipient.country !== 'US' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderRadius: 10, backgroundColor: C.warningBg, border: `1px solid #fcd34d` }}>
                    <Info size={13} style={{ color: C.warning, flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: C.warning, margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                      <strong>International shipment</strong> — eBay discounted rates apply for US-origin packages. Customs forms may be required.
                    </p>
                  </div>
                )}

                <Field label="Full Name">
                  <input value={recipient.name} placeholder="e.g. John Smith" onChange={e => setRecipient(r => ({ ...r, name: e.target.value }))} style={inp} onFocus={focusOn} onBlur={blurOn} />
                </Field>
                <Field label="Street Address">
                  <input value={recipient.addr1} placeholder="123 Main Street" onChange={e => setRecipient(r => ({ ...r, addr1: e.target.value }))} style={inp} onFocus={focusOn} onBlur={blurOn} />
                </Field>
                <Field label="Apt, Suite, Unit (optional)">
                  <input value={recipient.addr2} placeholder="Apt 4B" onChange={e => setRecipient(r => ({ ...r, addr2: e.target.value }))} style={inp} onFocus={focusOn} onBlur={blurOn} />
                </Field>

                {/* City / State / ZIP — adapts for US vs international */}
                {recipient.country === 'US' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 96px', gap: 10 }}>
                    <Field label="City">
                      <input value={recipient.city} placeholder="New York" onChange={e => setRecipient(r => ({ ...r, city: e.target.value }))} style={inp} onFocus={focusOn} onBlur={blurOn} />
                    </Field>
                    <Field label="State">
                      <div style={{ position: 'relative' }}>
                        <select value={recipient.state} onChange={e => setRecipient(r => ({ ...r, state: e.target.value }))} style={sel} onFocus={focusOn} onBlur={blurOn}>
                          {US_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={11} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
                      </div>
                    </Field>
                    <Field label="ZIP Code">
                      <input value={recipient.zip} placeholder="10001" maxLength={10} onChange={e => setRecipient(r => ({ ...r, zip: e.target.value }))} style={inp} onFocus={focusOn} onBlur={blurOn} />
                    </Field>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="City">
                      <input value={recipient.city} placeholder="London" onChange={e => setRecipient(r => ({ ...r, city: e.target.value }))} style={inp} onFocus={focusOn} onBlur={blurOn} />
                    </Field>
                    <Field label="Province / Region">
                      <input value={recipient.state} placeholder="e.g. Ontario" onChange={e => setRecipient(r => ({ ...r, state: e.target.value }))} style={inp} onFocus={focusOn} onBlur={blurOn} />
                    </Field>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Postal Code">
                        <input value={recipient.zip} placeholder="e.g. SW1A 1AA" maxLength={12} onChange={e => setRecipient(r => ({ ...r, zip: e.target.value }))} style={inp} onFocus={focusOn} onBlur={blurOn} />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Package */}
            <div style={{ backgroundColor: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box size={14} style={{ color: C.warning }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif' }}>Package</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Dimensions & weight</p>
                  </div>
                </div>
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                  {(['in', 'cm'] as const).map(u => (
                    <button key={u} onClick={() => setDimUnit(u)} style={{ padding: '4px 11px', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', backgroundColor: dimUnit === u ? C.primary : C.surface, color: dimUnit === u ? '#fff' : C.secondary, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>{u}</button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Presets */}
                <div>
                  <label style={lbl}>Quick Presets</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {presets.map(p => (
                      <button key={p.id} onClick={() => applyPreset(p)}
                        onMouseEnter={e => { const el = e.currentTarget; el.style.backgroundColor = C.primaryLight; el.style.borderColor = C.primary; el.style.color = C.primary }}
                        onMouseLeave={e => { const el = e.currentTarget; el.style.backgroundColor = C.bg; el.style.borderColor = C.border; el.style.color = C.secondary }}
                        style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.secondary, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                        {p.name}
                      </button>
                    ))}
                    {!addingPreset ? (
                      <button onClick={() => setAddingPreset(true)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1.5px dashed ${C.border}`, backgroundColor: 'transparent', color: C.muted, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Plus size={10} /> Save current
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name…" autoFocus onKeyDown={e => { if (e.key === 'Enter') savePreset(); if (e.key === 'Escape') setAddingPreset(false) }} style={{ ...inp, width: 120, padding: '4px 9px', fontSize: 11 }} />
                        <button onClick={savePreset} style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: C.primary, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Check size={12} /></button>
                        <button onClick={() => setAddingPreset(false)} style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Package type */}
                <div>
                  <label style={lbl}>Package Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([{ val: 'box', icon: Box, label: 'Box / Rigid' }, { val: 'mailer', icon: Package, label: 'Poly Mailer' }] as const).map(({ val, icon: Icon, label }) => (
                      <button key={val} onClick={() => setPkgType(val)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 11, cursor: 'pointer', border: `1.5px solid ${pkgType === val ? C.primary : C.border}`, backgroundColor: pkgType === val ? C.primaryLight : C.surface, transition: 'all 0.15s' }}>
                        <Icon size={13} style={{ color: pkgType === val ? C.primary : C.muted, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: pkgType === val ? C.primary : C.body, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label style={lbl}>Dimensions ({dimUnit})</label>
                  <div style={{ display: 'grid', gridTemplateColumns: pkgType === 'box' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
                    <Field label={`L (${dimUnit})`}><input value={length} onChange={e => setLength(e.target.value)} type="number" min="0" step="0.1" placeholder="0" style={inp} onFocus={focusOn} onBlur={blurOn} /></Field>
                    <Field label={`W (${dimUnit})`}><input value={width}  onChange={e => setWidth(e.target.value)}  type="number" min="0" step="0.1" placeholder="0" style={inp} onFocus={focusOn} onBlur={blurOn} /></Field>
                    {pkgType === 'box' && <Field label={`H (${dimUnit})`}><input value={height} onChange={e => setHeight(e.target.value)} type="number" min="0" step="0.1" placeholder="0" style={inp} onFocus={focusOn} onBlur={blurOn} /></Field>}
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Weight</label>
                    {weightDisplay && <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>= {weightDisplay}</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Field label="Pounds (lb)"><input value={wLbs} onChange={e => setWLbs(e.target.value)} type="number" min="0" step="1"   placeholder="0" style={inp} onFocus={focusOn} onBlur={blurOn} /></Field>
                    <Field label="Ounces (oz)"><input value={wOz}  onChange={e => setWOz(e.target.value)}  type="number" min="0" max="15.9" step="0.1" placeholder="0" style={inp} onFocus={focusOn} onBlur={blurOn} /></Field>
                  </div>
                </div>

                {(formErr || rateErr) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 10, backgroundColor: C.dangerBg, border: `1px solid #fca5a5` }}>
                    <AlertCircle size={13} style={{ color: C.danger, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{formErr || rateErr}</span>
                  </div>
                )}

                <button onClick={handleGetRates} disabled={loadingRates}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none', cursor: loadingRates ? 'not-allowed' : 'pointer', background: loadingRates ? C.border : `linear-gradient(135deg, ${C.primary}, #a855f7)`, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Syne, sans-serif', opacity: loadingRates ? 0.7 : 1, boxShadow: loadingRates ? 'none' : `0 4px 14px ${C.primary}40` }}>
                  {loadingRates ? <><Loader2 size={14} className="animate-spin" /> Getting rates…</> : <><Truck size={14} /> Get Shipping Rates</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.secondary, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <ArrowLeft size={11} /> Edit
              </button>
              <div style={{ width: 1, height: 18, backgroundColor: C.border, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                <strong style={{ color: C.dark }}>To:</strong> {recipient.name} · {recipient.city}{recipient.state ? `, ${recipient.state}` : ''} {recipient.zip}
                {recipient.country !== 'US' && (() => { const cc = COUNTRIES.find(c => c.val === recipient.country); return cc ? <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}><span className={`fi fi-${cc.flagCode}`} style={{ borderRadius: 2 }} /> {cc.label}</span> : null })()}
              </span>
              <span style={{ fontSize: 11, color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}><strong style={{ color: C.dark }}>Pkg:</strong> {pkgType === 'box' ? `${length}×${width}×${height}${dimUnit}` : `${length}×${width}${dimUnit} mailer`} · {weightDisplay}</span>
              <button onClick={handleGetRates} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
                <RefreshCw size={10} /> Refresh
              </button>
            </div>

            {isMock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 11, backgroundColor: C.warningBg, border: `1px solid #fcd34d` }}>
                <Info size={13} style={{ color: C.warning, flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: C.warning, margin: 0, fontFamily: 'DM Sans, sans-serif' }}><strong>Demo rates</strong> — realistic estimates. Connect your eBay account for live carrier pricing.</p>
              </div>
            )}

            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, margin: 0, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{rates.length} rates available</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {loadingRates
                ? Array.from({ length: 4 }).map((_, i) => <RateSkeleton key={i} />)
                : rates.map(rate => {
                    const isSelected = selectedRate === rate.rateId
                    return (
                      <button key={rate.rateId} onClick={() => setSelectedRate(rate.rateId)}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, cursor: 'pointer', textAlign: 'left', border: `2px solid ${isSelected ? C.primary : C.border}`, backgroundColor: isSelected ? C.primaryLight : C.surface, transition: 'all 0.15s', boxShadow: isSelected ? `0 0 0 4px ${C.primaryLight}` : 'none' }}>
                        <CarrierBadge carrierId={rate.carrierId} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif' }}>{rate.serviceName}</p>
                            {rate.tags.map(t => <TagChip key={t} tag={t} />)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: C.secondary, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'DM Sans, sans-serif' }}><Clock size={10} style={{ color: C.muted }} /> {rate.deliveryLabel}</span>
                            {rate.includedInsurance > 0 && <span style={{ fontSize: 11, color: C.secondary, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'DM Sans, sans-serif' }}><Shield size={10} style={{ color: C.muted }} /> ${rate.includedInsurance} insurance</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 22, fontWeight: 800, color: isSelected ? C.primary : C.dark, margin: 0, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>${rate.totalPrice.toFixed(2)}</p>
                          <p style={{ fontSize: 9, color: C.muted, margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{rate.currency}</p>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `2px solid ${isSelected ? C.primary : C.border}`, backgroundColor: isSelected ? C.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                          {isSelected && <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#fff' }} />}
                        </div>
                      </button>
                    )
                  })
              }
            </div>

            {!loadingRates && rates.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button disabled={!selectedRate} onClick={() => selectedRate && setStep(3)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 13, border: 'none', cursor: selectedRate ? 'pointer' : 'not-allowed', background: selectedRate ? `linear-gradient(135deg, ${C.primary}, #a855f7)` : C.border, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Syne, sans-serif', boxShadow: selectedRate ? `0 4px 14px ${C.primary}40` : 'none', transition: 'all 0.2s', opacity: selectedRate ? 1 : 0.6 }}>
                  Continue to Confirm <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && selectedRateObj && (
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Back */}
            <button onClick={() => setStep(2)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 9, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              <ArrowLeft size={12} /> Back to Rates
            </button>

            {/* Order summary */}
            <div style={{ backgroundColor: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif' }}>Order Summary</p>
              </div>

              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Carrier & Service', value: `${selectedRateObj.carrierName} ${selectedRateObj.serviceName}`, accent: true },
                  { label: 'Estimated Delivery', value: selectedRateObj.deliveryLabel },
                  { label: 'Ship To', value: `${recipient.name} · ${recipient.addr1}${recipient.addr2 ? `, ${recipient.addr2}` : ''}, ${recipient.city}${recipient.state ? `, ${recipient.state}` : ''} ${recipient.zip}${recipient.country !== 'US' ? ` · ${COUNTRIES.find(c=>c.val===recipient.country)?.label ?? recipient.country}` : ''}` },
                  { label: 'Package', value: pkgType === 'box' ? `${length}×${width}×${height} ${dimUnit} box · ${weightDisplay}` : `${length}×${width} ${dimUnit} mailer · ${weightDisplay}` },
                ].map(({ label, value, accent }, i, arr) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: accent ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div style={{ backgroundColor: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif' }}>Add-ons</p>
              </div>
              <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Insurance */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', cursor: 'pointer', borderBottom: `1px solid ${C.border}` }}>
                  <div onClick={() => setAddInsurance(v => !v)} style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: addInsurance ? C.primary : C.border, position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: addInsurance ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <Shield size={14} style={{ color: addInsurance ? C.primary : C.muted }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.dark, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Shipping Insurance</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Coverage for loss or damage</p>
                  </div>
                  {addInsurance && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Value $</span>
                      <input value={insuranceValue} onChange={e => setInsuranceValue(e.target.value)} type="number" min="1" style={{ ...inp, width: 80, padding: '4px 8px', fontSize: 12 }} onClick={e => e.stopPropagation()} onFocus={focusOn} onBlur={blurOn} />
                      <span style={{ fontSize: 11, color: C.primary, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>+$1.65</span>
                    </div>
                  )}
                </label>

                {/* Signature */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', cursor: 'pointer' }}>
                  <div onClick={() => setAddSignature(v => !v)} style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: addSignature ? C.primary : C.border, position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: addSignature ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <CheckCircle2 size={14} style={{ color: addSignature ? C.primary : C.muted }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.dark, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Signature Required</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Recipient must sign for delivery</p>
                  </div>
                  <span style={{ fontSize: 11, color: addSignature ? C.primary : C.muted, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>+$2.90</span>
                </label>
              </div>
            </div>

            {/* Price breakdown + buy */}
            <div style={{ backgroundColor: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Shipping Rate', value: `$${selectedRateObj.totalPrice.toFixed(2)}` },
                  ...(addInsurance ? [{ label: 'Insurance', value: '+$1.65' }] : []),
                  ...(addSignature ? [{ label: 'Signature Required', value: '+$2.90' }] : []),
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 12, color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '14px 22px', borderTop: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Total Charge</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif', lineHeight: 1.1 }}>${finalPrice.toFixed(2)}</p>
                </div>
                <button onClick={handleBuy} disabled={buying}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 32px', borderRadius: 14, border: 'none', cursor: buying ? 'not-allowed' : 'pointer', background: buying ? C.border : `linear-gradient(135deg, ${C.primary}, #a855f7)`, color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif', boxShadow: buying ? 'none' : `0 6px 20px ${C.primary}50`, transition: 'all 0.2s', opacity: buying ? 0.7 : 1 }}>
                  {buying ? <><Loader2 size={14} className="animate-spin" /> Purchasing…</> : <><FileText size={14} /> Buy Label — ${finalPrice.toFixed(2)}</>}
                </button>
              </div>
              {buyErr && (
                <div style={{ margin: '0 22px 14px', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 10, backgroundColor: C.dangerBg, border: `1px solid #fca5a5` }}>
                  <AlertCircle size={13} style={{ color: C.danger, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{buyErr}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0 }
        input[type=number] { -moz-appearance:textfield }
      `}</style>
    </div>
  )
}
