'use client'
// app/dashboard/shipping/page.tsx
// Shipping Label Generator — Step 1 (Package) + Step 2 (Rate Selection)

import React, { useState, useEffect, useRef } from 'react'
import {
  Package, Truck, MapPin, Weight, Ruler, ChevronRight,
  Plus, Trash2, Check, Loader2, AlertCircle, RefreshCw,
  ArrowLeft, Zap, Tag, Shield, Star, Clock, X,
  ChevronDown, Info, Sparkles, Box,
} from 'lucide-react'

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
  info:         '#0284c7',
  infoBg:       '#e0f2fe',
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface Preset {
  id:     string
  name:   string
  l:      string
  w:      string
  h:      string
  wLbs:   string
  wOz:    string
}

interface Recipient {
  name:    string
  addr1:   string
  addr2:   string
  city:    string
  state:   string
  zip:     string
  country: string
}

interface ShipRate {
  rateId:            string
  carrierId:         string
  carrierName:       string
  serviceCode:       string
  serviceName:       string
  totalPrice:        number
  currency:          string
  deliveryDays:      number | null
  deliveryLabel:     string
  tags:              Array<'cheapest' | 'fastest' | 'suggested'>
  includedInsurance: number
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const DEFAULT_PRESETS: Preset[] = [
  { id: 'poly',   name: 'Poly Mailer',  l: '12', w: '15', h: '0',  wLbs: '0', wOz: '4'  },
  { id: 'small',  name: 'Small Box',    l: '8',  w: '6',  h: '4',  wLbs: '1', wOz: '0'  },
  { id: 'medium', name: 'Medium Box',   l: '12', w: '10', h: '8',  wLbs: '3', wOz: '0'  },
  { id: 'large',  name: 'Large Box',    l: '18', w: '16', h: '12', wLbs: '8', wOz: '0'  },
]

// ── Carrier logo SVGs ──────────────────────────────────────────────────────────
function CarrierBadge({ carrierId, size = 32 }: { carrierId: string; size?: number }) {
  const configs: Record<string, { bg: string; color: string; text: string }> = {
    USPS:  { bg: '#004B87', color: '#fff',    text: 'USPS'  },
    UPS:   { bg: '#351C15', color: '#FFB500', text: 'UPS'   },
    FEDEX: { bg: '#4D148C', color: '#FF6600', text: 'FedEx' },
  }
  const cfg = configs[carrierId] ?? { bg: C.primary, color: '#fff', text: carrierId }
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: size * 0.28, fontWeight: 900, color: cfg.color,
        fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.5px',
      }}>{cfg.text}</span>
    </div>
  )
}

// ── Tag chip ──────────────────────────────────────────────────────────────────
function TagChip({ tag }: { tag: 'cheapest' | 'fastest' | 'suggested' }) {
  const cfg = {
    cheapest:  { label: '$ Cheapest',  bg: C.successBg, color: C.success  },
    fastest:   { label: '⚡ Fastest',   bg: C.warningBg, color: C.warning  },
    suggested: { label: '★ Suggested', bg: C.primaryLight, color: C.primary },
  }[tag]
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
      backgroundColor: cfg.bg, color: cfg.color, fontFamily: 'DM Sans, sans-serif',
      letterSpacing: '0.2px', whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  )
}

// ── Input styles ──────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  border: `1px solid ${C.borderInput}`, borderRadius: 10, padding: '9px 12px',
  width: '100%', backgroundColor: C.surface, color: C.body,
  fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
  transition: 'border-color 0.15s',
}
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: C.secondary,
  fontFamily: 'DM Sans, sans-serif', marginBottom: 5, display: 'block',
  textTransform: 'uppercase', letterSpacing: '0.5px',
}
const sel: React.CSSProperties = { ...inp, cursor: 'pointer', appearance: 'none' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  )
}

// ── Rate card skeleton ────────────────────────────────────────────────────────
function RateSkeleton() {
  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 20px',
      backgroundColor: C.surface, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {[80, 50, 60].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 20 : 13, width: `${w}%`, borderRadius: 6,
          backgroundColor: '#f0eeff',
          animation: 'pulse 1.4s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ShippingPage() {
  const [step,          setStep]          = useState<1 | 2>(1)
  const [recipient,     setRecipient]     = useState<Recipient>({
    name: '', addr1: '', addr2: '', city: '', state: 'NY', zip: '', country: 'US',
  })
  const [dimUnit,       setDimUnit]       = useState<'in' | 'cm'>('in')
  const [pkgType,       setPkgType]       = useState<'box' | 'mailer'>('box')
  const [length,        setLength]        = useState('')
  const [width,         setWidth]         = useState('')
  const [height,        setHeight]        = useState('')
  const [wLbs,          setWLbs]          = useState('')
  const [wOz,           setWOz]           = useState('')
  const [presets,       setPresets]       = useState<Preset[]>(DEFAULT_PRESETS)
  const [addingPreset,  setAddingPreset]  = useState(false)
  const [presetName,    setPresetName]    = useState('')
  const [rates,         setRates]         = useState<ShipRate[]>([])
  const [loading,       setLoading]       = useState(false)
  const [selectedRate,  setSelectedRate]  = useState<string | null>(null)
  const [rateErr,       setRateErr]       = useState<string | null>(null)
  const [formErr,       setFormErr]       = useState<string | null>(null)
  const [isMock,        setIsMock]        = useState(false)

  // Focus helpers
  function focusOn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = C.primary
    e.target.style.boxShadow = `0 0 0 3px ${C.primaryLight}`
  }
  function blurOn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = C.borderInput
    e.target.style.boxShadow = 'none'
  }

  // Apply a preset
  function applyPreset(p: Preset) {
    setLength(p.l); setWidth(p.w); setHeight(p.h)
    setWLbs(p.wLbs); setWOz(p.wOz)
    if (p.h === '0') setPkgType('mailer')
    else setPkgType('box')
  }

  // Save current dims as a preset
  function savePreset() {
    if (!presetName.trim()) return
    setPresets(prev => [...prev, {
      id:   Date.now().toString(),
      name: presetName.trim(),
      l: length, w: width, h: pkgType === 'mailer' ? '0' : height,
      wLbs, wOz,
    }])
    setPresetName(''); setAddingPreset(false)
  }

  // Weight in oz total for display
  const totalOz = Math.round((parseFloat(wLbs || '0') * 16) + parseFloat(wOz || '0'))
  const weightDisplay = totalOz > 0
    ? totalOz >= 16
      ? `${Math.floor(totalOz / 16)} lb ${totalOz % 16} oz`
      : `${totalOz} oz`
    : null

  // Validate step 1 and get rates
  async function handleGetRates() {
    setFormErr(null)
    if (!recipient.name.trim())  return setFormErr('Recipient name is required')
    if (!recipient.addr1.trim()) return setFormErr('Street address is required')
    if (!recipient.city.trim())  return setFormErr('City is required')
    if (!recipient.zip.trim())   return setFormErr('ZIP code is required')
    if (!length || !width)       return setFormErr('Package dimensions are required')
    if (totalOz === 0)           return setFormErr('Package weight is required')

    setLoading(true); setRateErr(null); setRates([])
    try {
      const res = await fetch('/api/ebay/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPostalCode:  recipient.zip,
          toCountryCode: recipient.country,
          weightLbs:     parseFloat(wLbs || '0'),
          weightOz:      parseFloat(wOz  || '0'),
          lengthIn:      parseFloat(length),
          widthIn:       parseFloat(width),
          heightIn:      pkgType === 'mailer' ? 0 : parseFloat(height || '0'),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not get rates')
      setRates(json.rates ?? [])
      setIsMock(json.source === 'mock')
      if (json.rates?.length > 0) setSelectedRate(json.rates[0].rateId)
      setStep(2)
    } catch (e: any) {
      setRateErr(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.bg, fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: '0 28px', height: 60, display: 'flex', alignItems: 'center',
        gap: 16, flexShrink: 0,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `linear-gradient(135deg, ${C.primary}, #a855f7)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Truck size={16} style={{ color: '#fff' }} />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.dark, fontFamily: 'Syne, sans-serif', margin: 0, lineHeight: 1.2 }}>
            Shipping Labels
          </p>
          <p style={{ fontSize: 11, color: C.muted, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            Create & print eBay-discounted labels
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { n: 1, label: 'Package' },
            { n: 2, label: 'Choose Rate' },
            { n: 3, label: 'Confirm' },
          ].map(({ n, label }, i, arr) => (
            <React.Fragment key={n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: step >= n ? C.primary : C.border,
                  transition: 'background-color 0.2s',
                }}>
                  {step > n
                    ? <Check size={12} style={{ color: '#fff' }} />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: step === n ? '#fff' : C.muted }}>{n}</span>
                  }
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: step === n ? C.primary : C.muted, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 24, height: 1, backgroundColor: step > n ? C.primary : C.border, flexShrink: 0, transition: 'background-color 0.2s' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

        {/* ───────── STEP 1 ───────── */}
        {step === 1 && (
          <div style={{ maxWidth: 920, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

            {/* LEFT — Ship To */}
            <div style={{ backgroundColor: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9, backgroundColor: C.primaryLight,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MapPin size={14} style={{ color: C.primary }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif' }}>Ship To</p>
                  <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Recipient's delivery address</p>
                </div>
              </div>

              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Full Name">
                  <input value={recipient.name} placeholder="e.g. John Smith"
                    onChange={e => setRecipient(r => ({ ...r, name: e.target.value }))}
                    style={inp} onFocus={focusOn} onBlur={blurOn} />
                </Field>

                <Field label="Street Address">
                  <input value={recipient.addr1} placeholder="123 Main Street"
                    onChange={e => setRecipient(r => ({ ...r, addr1: e.target.value }))}
                    style={inp} onFocus={focusOn} onBlur={blurOn} />
                </Field>

                <Field label="Apt, Suite, Unit (optional)">
                  <input value={recipient.addr2} placeholder="Apt 4B"
                    onChange={e => setRecipient(r => ({ ...r, addr2: e.target.value }))}
                    style={inp} onFocus={focusOn} onBlur={blurOn} />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: 10 }}>
                  <Field label="City">
                    <input value={recipient.city} placeholder="New York"
                      onChange={e => setRecipient(r => ({ ...r, city: e.target.value }))}
                      style={inp} onFocus={focusOn} onBlur={blurOn} />
                  </Field>
                  <Field label="State">
                    <div style={{ position: 'relative' }}>
                      <select value={recipient.state}
                        onChange={e => setRecipient(r => ({ ...r, state: e.target.value }))}
                        style={sel} onFocus={focusOn} onBlur={blurOn}>
                        {US_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
                    </div>
                  </Field>
                  <Field label="ZIP Code">
                    <input value={recipient.zip} placeholder="10001" maxLength={10}
                      onChange={e => setRecipient(r => ({ ...r, zip: e.target.value }))}
                      style={inp} onFocus={focusOn} onBlur={blurOn} />
                  </Field>
                </div>
              </div>
            </div>

            {/* RIGHT — Package */}
            <div style={{ backgroundColor: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, backgroundColor: '#fef3c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Box size={14} style={{ color: C.warning }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif' }}>Package</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Dimensions & weight</p>
                  </div>
                </div>
                {/* Unit toggle */}
                <div style={{
                  display: 'flex', borderRadius: 8, overflow: 'hidden',
                  border: `1px solid ${C.border}`, flexShrink: 0,
                }}>
                  {(['in', 'cm'] as const).map(u => (
                    <button key={u} onClick={() => setDimUnit(u)}
                      style={{
                        padding: '4px 11px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                        backgroundColor: dimUnit === u ? C.primary : C.surface,
                        color: dimUnit === u ? '#fff' : C.secondary,
                        fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                      }}>{u}</button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Presets */}
                <div>
                  <label style={lbl}>Package Presets</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {presets.map(p => (
                      <button key={p.id} onClick={() => applyPreset(p)}
                        style={{
                          padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          border: `1px solid ${C.border}`, backgroundColor: C.bg,
                          color: C.secondary, fontFamily: 'DM Sans, sans-serif',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = C.primaryLight; (e.target as HTMLElement).style.borderColor = C.primary; (e.target as HTMLElement).style.color = C.primary }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = C.bg; (e.target as HTMLElement).style.borderColor = C.border; (e.target as HTMLElement).style.color = C.secondary }}
                      >
                        {p.name}
                      </button>
                    ))}
                    {!addingPreset ? (
                      <button onClick={() => setAddingPreset(true)}
                        style={{
                          padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          border: `1.5px dashed ${C.border}`, backgroundColor: 'transparent',
                          color: C.muted, fontFamily: 'DM Sans, sans-serif',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                        <Plus size={10} /> Save current
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <input value={presetName} onChange={e => setPresetName(e.target.value)}
                          placeholder="Preset name…" autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') savePreset(); if (e.key === 'Escape') setAddingPreset(false) }}
                          style={{ ...inp, width: 130, padding: '4px 9px', fontSize: 11 }} />
                        <button onClick={savePreset} style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: C.primary, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Check size={12} />
                        </button>
                        <button onClick={() => setAddingPreset(false)} style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Package type */}
                <div>
                  <label style={lbl}>Package Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([
                      { val: 'box',    icon: Box,     label: 'Box / Rigid' },
                      { val: 'mailer', icon: Package,  label: 'Poly Mailer' },
                    ] as const).map(({ val, icon: Icon, label }) => (
                      <button key={val} onClick={() => setPkgType(val)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                          padding: '9px 14px', borderRadius: 11, cursor: 'pointer',
                          border: `1.5px solid ${pkgType === val ? C.primary : C.border}`,
                          backgroundColor: pkgType === val ? C.primaryLight : C.surface,
                          transition: 'all 0.15s',
                        }}>
                        <Icon size={13} style={{ color: pkgType === val ? C.primary : C.muted, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: pkgType === val ? C.primary : C.body, fontFamily: 'DM Sans, sans-serif' }}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label style={lbl}>Dimensions ({dimUnit})</label>
                  <div style={{ display: 'grid', gridTemplateColumns: pkgType === 'box' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
                    <Field label={`Length (${dimUnit})`}>
                      <input value={length} onChange={e => setLength(e.target.value)}
                        type="number" min="0" step="0.1" placeholder="0"
                        style={inp} onFocus={focusOn} onBlur={blurOn} />
                    </Field>
                    <Field label={`Width (${dimUnit})`}>
                      <input value={width} onChange={e => setWidth(e.target.value)}
                        type="number" min="0" step="0.1" placeholder="0"
                        style={inp} onFocus={focusOn} onBlur={blurOn} />
                    </Field>
                    {pkgType === 'box' && (
                      <Field label={`Height (${dimUnit})`}>
                        <input value={height} onChange={e => setHeight(e.target.value)}
                          type="number" min="0" step="0.1" placeholder="0"
                          style={inp} onFocus={focusOn} onBlur={blurOn} />
                      </Field>
                    )}
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Weight</label>
                    {weightDisplay && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                        = {weightDisplay}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Field label="Pounds (lb)">
                      <input value={wLbs} onChange={e => setWLbs(e.target.value)}
                        type="number" min="0" step="1" placeholder="0"
                        style={inp} onFocus={focusOn} onBlur={blurOn} />
                    </Field>
                    <Field label="Ounces (oz)">
                      <input value={wOz} onChange={e => setWOz(e.target.value)}
                        type="number" min="0" max="15.9" step="0.1" placeholder="0"
                        style={inp} onFocus={focusOn} onBlur={blurOn} />
                    </Field>
                  </div>
                </div>

                {/* Validation error */}
                {formErr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 10, backgroundColor: C.dangerBg, border: `1px solid #fca5a5` }}>
                    <AlertCircle size={13} style={{ color: C.danger, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{formErr}</span>
                  </div>
                )}

                {rateErr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 10, backgroundColor: C.dangerBg, border: `1px solid #fca5a5` }}>
                    <AlertCircle size={13} style={{ color: C.danger, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{rateErr}</span>
                  </div>
                )}

                {/* CTA */}
                <button onClick={handleGetRates} disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 20px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? C.border : `linear-gradient(135deg, ${C.primary}, #a855f7)`,
                    color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Syne, sans-serif',
                    transition: 'opacity 0.15s', opacity: loading ? 0.7 : 1,
                    boxShadow: loading ? 'none' : `0 4px 14px ${C.primary}40`,
                  }}>
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> Getting rates…</>
                    : <><Truck size={14} /> Get Shipping Rates</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ───────── STEP 2 ───────── */}
        {step === 2 && (
          <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Back + summary bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px', borderRadius: 14,
              backgroundColor: C.surface, border: `1px solid ${C.border}`,
            }}>
              <button onClick={() => setStep(1)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <ArrowLeft size={12} /> Edit Package
              </button>
              <div style={{ width: 1, height: 20, backgroundColor: C.border }} />
              <div style={{ display: 'flex', flex: 1, gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                  <strong style={{ color: C.dark }}>To:</strong> {recipient.name}, {recipient.city}, {recipient.state} {recipient.zip}
                </span>
                <span style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                  <strong style={{ color: C.dark }}>Package:</strong> {pkgType === 'box' ? `${length}×${width}×${height} ${dimUnit}` : `${length}×${width} ${dimUnit} mailer`} · {weightDisplay ?? '—'}
                </span>
              </div>
              <button onClick={() => { setLoading(true); handleGetRates() }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.secondary, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <RefreshCw size={10} /> Refresh
              </button>
            </div>

            {/* Mock notice */}
            {isMock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 11, backgroundColor: C.warningBg, border: `1px solid #fcd34d` }}>
                <Info size={13} style={{ color: C.warning, flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: C.warning, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                  <strong>Demo mode</strong> — rates shown are realistic estimates. Connect your eBay account to see live carrier pricing.
                </p>
              </div>
            )}

            <p style={{ fontSize: 12, fontWeight: 600, color: C.secondary, margin: 0, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {rates.length} rates available
            </p>

            {/* Rate cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <RateSkeleton key={i} />)
                : rates.map(rate => {
                    const isSelected = selectedRate === rate.rateId
                    return (
                      <button key={rate.rateId}
                        onClick={() => setSelectedRate(rate.rateId)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '16px 20px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                          border: `2px solid ${isSelected ? C.primary : C.border}`,
                          backgroundColor: isSelected ? C.primaryLight : C.surface,
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? `0 0 0 4px ${C.primaryLight}` : 'none',
                        }}>

                        {/* Carrier badge */}
                        <CarrierBadge carrierId={rate.carrierId} size={40} />

                        {/* Service info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'Syne, sans-serif' }}>
                              {rate.serviceName}
                            </p>
                            {rate.tags.map(t => <TagChip key={t} tag={t} />)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: C.secondary, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'DM Sans, sans-serif' }}>
                              <Clock size={10} style={{ color: C.muted }} /> {rate.deliveryLabel}
                            </span>
                            {rate.includedInsurance > 0 && (
                              <span style={{ fontSize: 11, color: C.secondary, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'DM Sans, sans-serif' }}>
                                <Shield size={10} style={{ color: C.muted }} /> ${rate.includedInsurance} insurance included
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 22, fontWeight: 800, color: isSelected ? C.primary : C.dark, margin: 0, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>
                            ${rate.totalPrice.toFixed(2)}
                          </p>
                          <p style={{ fontSize: 9, color: C.muted, margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {rate.currency}
                          </p>
                        </div>

                        {/* Radio dot */}
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${isSelected ? C.primary : C.border}`,
                          backgroundColor: isSelected ? C.primary : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {isSelected && <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#fff' }} />}
                        </div>
                      </button>
                    )
                  })
              }
            </div>

            {/* Proceed CTA */}
            {!loading && rates.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                <button
                  disabled={!selectedRate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '13px 28px', borderRadius: 13, border: 'none', cursor: selectedRate ? 'pointer' : 'not-allowed',
                    background: selectedRate ? `linear-gradient(135deg, ${C.primary}, #a855f7)` : C.border,
                    color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Syne, sans-serif',
                    boxShadow: selectedRate ? `0 4px 14px ${C.primary}40` : 'none',
                    transition: 'all 0.2s', opacity: selectedRate ? 1 : 0.6,
                  }}>
                  {(() => {
                    const r = rates.find(r => r.rateId === selectedRate)
                    return r ? `Buy Label — $${r.totalPrice.toFixed(2)}` : 'Select a Rate'
                  })()}
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50%       { opacity: 0.4 }
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0 }
        input[type=number] { -moz-appearance: textfield }
      `}</style>
    </div>
  )
}
