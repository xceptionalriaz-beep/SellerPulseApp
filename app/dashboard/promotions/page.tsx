'use client'
// app/dashboard/promotions/page.tsx — v3: Table Layout
// Promotion Manager with full sortable column table + right-side drawer

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  RefreshCw, Plus, Megaphone, Loader2, X,
  TrendingUp, Zap, Play, Pause, Square, AlertCircle,
  CheckCircle2, BarChart2, DollarSign, Tag,
  ExternalLink, Info, Search, Copy, Eye, MousePointerClick,
  ShoppingBag, Percent, StickyNote, Sparkles,
  ToggleLeft, ToggleRight, ArrowUpRight,
  ChevronUp, ChevronDown, ArrowUpDown, SlidersHorizontal,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
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
interface Campaign {
  id:                 string
  campaign_id:        string
  campaign_name:      string
  campaign_type:      'PROMOTED_LISTINGS' | 'PROMOTED_LISTINGS_PRIORITY'
  funding_model:      'COST_PER_SALE' | 'COST_PER_CLICK'
  status:             'RUNNING' | 'PAUSED' | 'ENDED'
  bid_percentage:     number | null
  daily_budget:       number | null
  marketplace_id:     string
  start_date:         string | null
  end_date:           string | null
  notes:              string | null
  ad_rate_strategy:   string | null
  bid_adjustment_pct: number | null
  max_ad_rate:        number | null
  impressions:        number
  clicks:             number
  items_sold:         number
  sales_amount:       number
  ad_fees_amount:     number
  roas:               number | null
  auto_enroll:        boolean
  ad_count:           number
  created_at:         string
}

interface Ad {
  id:             string
  campaign_id:    string
  ad_id:          string | null
  listing_id:     string
  listing_title:  string | null
  bid_percentage: number | null
  status:         string
  enrolled_at:    string
}

type TabFilter    = 'all' | 'RUNNING' | 'PAUSED' | 'ENDED'
type AdRateStrategy = 'FIXED' | 'DYNAMIC_NO_ADJUST' | 'DYNAMIC_HIGHER' | 'DYNAMIC_LOWER'
type DrawerMode   = 'none' | 'create' | 'detail'

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
}
function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}
function fmtUSD(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
function roasColor(roas: number | null) {
  if (roas == null) return { color: C.muted, bg: '#f3f4f6' }
  if (roas >= 3)    return { color: C.success, bg: C.successBg }
  if (roas >= 1.5)  return { color: C.warning, bg: C.warningBg }
  return { color: C.danger, bg: C.dangerBg }
}
function healthScore(c: Campaign) {
  if (c.impressions === 0) return { score: 0, label: 'No data', color: C.muted }
  const ctr   = c.clicks / c.impressions
  const roas  = c.roas ?? 0
  const raw   = Math.min(100, ctr * 1000 * 20 + roas * 15)
  const score = Math.round(raw)
  if (score >= 70) return { score, label: 'Excellent',   color: C.success }
  if (score >= 40) return { score, label: 'Good',        color: C.warning }
  return                  { score, label: 'Needs work',  color: C.danger  }
}
function getCtr(c: Campaign) {
  return c.impressions > 0 ? c.clicks / c.impressions : null
}

const STATUS_CONFIG = {
  RUNNING: { color: C.success, bg: C.successBg, label: 'Running' },
  PAUSED:  { color: C.warning, bg: C.warningBg, label: 'Paused'  },
  ENDED:   { color: C.muted,   bg: '#f3f4f6',   label: 'Ended'   },
}
const TYPE_CONFIG = {
  PROMOTED_LISTINGS:          { label: 'Standard', icon: TrendingUp, color: C.primary, bg: C.primaryLight },
  PROMOTED_LISTINGS_PRIORITY: { label: 'Priority', icon: Zap,        color: C.warning, bg: C.warningBg   },
}
const STRATEGY_LABELS: Record<string, string> = {
  FIXED:             'Fixed',
  DYNAMIC_NO_ADJUST: 'Dynamic',
  DYNAMIC_HIGHER:    'Dynamic ↑',
  DYNAMIC_LOWER:     'Dynamic ↓',
}

// ── Column definitions ─────────────────────────────────────────────────────────
interface ColDef {
  key:            string
  label:          string
  defaultVisible: boolean
  sortable:       boolean
  minW:           number
}

const COLUMNS: ColDef[] = [
  { key: 'campaign_name',    label: 'Campaign Name',   defaultVisible: true,  sortable: true,  minW: 220 },
  { key: 'campaign_id',      label: 'Campaign ID',     defaultVisible: true,  sortable: false, minW: 130 },
  { key: 'status',           label: 'Status',          defaultVisible: true,  sortable: true,  minW: 95  },
  { key: 'campaign_type',    label: 'Channel',         defaultVisible: true,  sortable: true,  minW: 100 },
  { key: 'impressions',      label: 'Impressions',     defaultVisible: true,  sortable: true,  minW: 105 },
  { key: 'clicks',           label: 'Clicks',          defaultVisible: true,  sortable: true,  minW: 75  },
  { key: 'ctr',              label: 'CTR %',           defaultVisible: true,  sortable: true,  minW: 72  },
  { key: 'items_sold',       label: 'Items Sold',      defaultVisible: true,  sortable: true,  minW: 90  },
  { key: 'sales_amount',     label: 'Sales',           defaultVisible: true,  sortable: true,  minW: 95  },
  { key: 'ad_fees_amount',   label: 'Ad Fees',         defaultVisible: true,  sortable: true,  minW: 90  },
  { key: 'roas',             label: 'ROAS',            defaultVisible: true,  sortable: true,  minW: 82  },
  { key: 'health_score',     label: 'Health',          defaultVisible: true,  sortable: true,  minW: 110 },
  { key: 'ad_rate_strategy', label: 'Ad Rate Strategy',defaultVisible: false, sortable: false, minW: 135 },
  { key: 'start_date',       label: 'Start Date',      defaultVisible: false, sortable: true,  minW: 100 },
  { key: 'end_date',         label: 'End Date',        defaultVisible: false, sortable: true,  minW: 100 },
  { key: 'auto_enroll',      label: 'Auto-Enroll',     defaultVisible: false, sortable: false, minW: 95  },
  { key: 'ad_count',         label: 'Ads',             defaultVisible: false, sortable: true,  minW: 60  },
  { key: 'notes',            label: 'Notes',           defaultVisible: false, sortable: false, minW: 160 },
]
const DEFAULT_VISIBLE = new Set(COLUMNS.filter(c => c.defaultVisible).map(c => c.key))

// ── Sort util ──────────────────────────────────────────────────────────────────
function sortCampaigns(list: Campaign[], key: string, dir: 'asc' | 'desc') {
  return [...list].sort((a, b) => {
    let av: any, bv: any
    if (key === 'ctr') {
      av = getCtr(a) ?? (dir === 'asc' ? Infinity : -Infinity)
      bv = getCtr(b) ?? (dir === 'asc' ? Infinity : -Infinity)
    } else if (key === 'health_score') {
      av = healthScore(a).score
      bv = healthScore(b).score
    } else {
      av = (a as any)[key]
      bv = (b as any)[key]
    }
    if (av == null) av = dir === 'asc' ? Infinity : -Infinity
    if (bv == null) bv = dir === 'asc' ? Infinity : -Infinity
    if (typeof av === 'string') return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return dir === 'asc' ? av - bv : bv - av
  })
}

// ── Cell renderers ─────────────────────────────────────────────────────────────
function CampaignNameCell({ c, onDetail }: { c: Campaign; onDetail: () => void }) {
  const tc   = TYPE_CONFIG[c.campaign_type] ?? TYPE_CONFIG.PROMOTED_LISTINGS
  const TcIcon = tc.icon
  return (
    <button onClick={onDetail}
      className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity min-w-0 w-full">
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        backgroundColor: tc.bg, color: tc.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${tc.color}44`,
      }}>
        <TcIcon size={11} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-bold truncate"
          style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
          {c.campaign_name}
        </p>
        {c.auto_enroll && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold" style={{ color: C.primary }}>
            <Sparkles size={7} /> Auto-enroll
          </span>
        )}
      </div>
    </button>
  )
}

function renderCell(col: ColDef, c: Campaign, onDetail: () => void): React.ReactNode {
  switch (col.key) {
    case 'campaign_name':
      return <CampaignNameCell c={c} onDetail={onDetail} />

    case 'campaign_id':
      return <span className="text-[10px] font-mono" style={{ color: C.muted }}>{c.campaign_id.slice(0, 14)}…</span>

    case 'status': {
      const sc = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.ENDED
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: sc.bg, color: sc.color }}>
          {sc.label}
        </span>
      )
    }

    case 'campaign_type': {
      const tc = TYPE_CONFIG[c.campaign_type] ?? TYPE_CONFIG.PROMOTED_LISTINGS
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: tc.bg, color: tc.color }}>
          {tc.label}
        </span>
      )
    }

    case 'impressions':
      return <span className="text-[12px] font-semibold tabular-nums" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>{fmtNum(c.impressions)}</span>

    case 'clicks':
      return <span className="text-[12px] font-semibold tabular-nums" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>{fmtNum(c.clicks)}</span>

    case 'ctr': {
      const ctr = getCtr(c)
      return (
        <span className="text-[12px] font-semibold tabular-nums"
          style={{ color: ctr != null ? C.primary : C.muted, fontFamily: 'DM Sans, sans-serif' }}>
          {ctr != null ? `${(ctr * 100).toFixed(2)}%` : '—'}
        </span>
      )
    }

    case 'items_sold':
      return <span className="text-[12px] font-semibold tabular-nums" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>{c.items_sold}</span>

    case 'sales_amount':
      return (
        <span className="text-[12px] font-semibold tabular-nums"
          style={{ color: c.sales_amount > 0 ? C.dark : C.muted, fontFamily: 'DM Sans, sans-serif' }}>
          {c.sales_amount > 0 ? fmtUSD(c.sales_amount) : '—'}
        </span>
      )

    case 'ad_fees_amount':
      return (
        <span className="text-[12px] font-semibold tabular-nums"
          style={{ color: c.ad_fees_amount > 0 ? C.danger : C.muted, fontFamily: 'DM Sans, sans-serif' }}>
          {c.ad_fees_amount > 0 ? fmtUSD(c.ad_fees_amount) : '—'}
        </span>
      )

    case 'roas': {
      const rc = roasColor(c.roas)
      return c.roas != null
        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
            style={{ backgroundColor: rc.bg, color: rc.color }}>{c.roas.toFixed(2)}x</span>
        : <span style={{ color: C.muted, fontSize: 11 }}>—</span>
    }

    case 'health_score': {
      const hs = healthScore(c)
      return (
        <div className="flex items-center gap-2">
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ width: `${hs.score}%`, height: '100%', backgroundColor: hs.color, borderRadius: 2 }} />
          </div>
          <span className="text-[10px] font-semibold whitespace-nowrap"
            style={{ color: hs.color, fontFamily: 'DM Sans, sans-serif' }}>
            {hs.score > 0 ? hs.label : '—'}
          </span>
        </div>
      )
    }

    case 'ad_rate_strategy':
      return (
        <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
          {c.bid_percentage ? `${c.bid_percentage}% · ` : ''}
          {c.ad_rate_strategy ? (STRATEGY_LABELS[c.ad_rate_strategy] ?? c.ad_rate_strategy) : '—'}
        </span>
      )

    case 'start_date':
      return <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>{fmtDate(c.start_date)}</span>

    case 'end_date':
      return <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>{fmtDate(c.end_date)}</span>

    case 'auto_enroll':
      return c.auto_enroll
        ? <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
            style={{ backgroundColor: C.primaryLight, color: C.primary }}><Sparkles size={7} /> On</span>
        : <span className="text-[10px]" style={{ color: C.muted }}>Off</span>

    case 'ad_count':
      return <span className="text-[12px] font-semibold tabular-nums" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>{c.ad_count ?? 0}</span>

    case 'notes':
      return c.notes
        ? <span className="text-[11px] truncate block max-w-[150px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>{c.notes}</span>
        : <span style={{ color: C.muted, fontSize: 11 }}>—</span>

    default:
      return null
  }
}

// ── Create Campaign Form ───────────────────────────────────────────────────────
function CreateCampaignForm({ onCreated, onCancel }: {
  onCreated: (c: Campaign) => void
  onCancel:  () => void
}) {
  const [name,       setName]       = useState('')
  const [type,       setType]       = useState<'PROMOTED_LISTINGS' | 'PROMOTED_LISTINGS_PRIORITY'>('PROMOTED_LISTINGS')
  const [bidPct,     setBidPct]     = useState('5')
  const [daily,      setDaily]      = useState('10')
  const [notes,      setNotes]      = useState('')
  const [endDate,    setEndDate]    = useState('')
  const [strategy,   setStrategy]   = useState<AdRateStrategy>('FIXED')
  const [adjustPct,  setAdjustPct]  = useState('10')
  const [maxRate,    setMaxRate]    = useState('')
  const [autoEnroll, setAutoEnroll] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState<string | null>(null)

  async function submit() {
    if (!name.trim()) { setErr('Campaign name is required'); return }
    setSaving(true); setErr(null)
    try {
      const res = await fetch('/api/ebay/promotions/campaigns', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:             name.trim(),
          type,
          bidPercentage:    type === 'PROMOTED_LISTINGS'          ? bidPct    : undefined,
          dailyBudget:      type === 'PROMOTED_LISTINGS_PRIORITY' ? daily     : undefined,
          endDate:          endDate || undefined,
          notes:            notes.trim() || undefined,
          adRateStrategy:   strategy,
          bidAdjustmentPct: (strategy === 'DYNAMIC_HIGHER' || strategy === 'DYNAMIC_LOWER') ? adjustPct : undefined,
          maxAdRate:        maxRate || undefined,
          autoEnroll,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create campaign')
      onCreated(json.campaign)
    } catch (e: any) { setErr(e.message) }
    setSaving(false)
  }

  const inp: React.CSSProperties = {
    border: `1px solid ${C.borderInput}`, borderRadius: 10, padding: '8px 12px', width: '100%',
    backgroundColor: C.surface, color: C.body, fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
  }
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: C.dark, fontFamily: 'DM Sans, sans-serif', marginBottom: 4, display: 'block' }
  const radioRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.body }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: C.surface }}>
      <div className="shrink-0 flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>New Campaign</p>
        <button onClick={onCancel}><X size={16} style={{ color: C.muted }} /></button>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5">

        {/* Type picker */}
        <div>
          <label style={lbl}>Campaign Type</label>
          <div className="flex gap-2">
            {(['PROMOTED_LISTINGS', 'PROMOTED_LISTINGS_PRIORITY'] as const).map(t => {
              const tc = TYPE_CONFIG[t]; const TcIcon = tc.icon
              return (
                <button key={t} onClick={() => setType(t)}
                  className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ border: `1.5px solid ${type === t ? tc.color : C.border}`, backgroundColor: type === t ? tc.bg : C.surface }}>
                  <TcIcon size={13} style={{ color: tc.color }} />
                  <div className="text-left">
                    <p className="text-[11px] font-bold" style={{ color: type === t ? tc.color : C.dark, fontFamily: 'DM Sans, sans-serif' }}>{tc.label}</p>
                    <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{t === 'PROMOTED_LISTINGS' ? 'Pay per sale' : 'Pay per click'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Name */}
        <div>
          <label style={lbl}>Campaign Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Electronics PLS" style={inp}
            onFocus={e => (e.target.style.borderColor = C.primary)} onBlur={e => (e.target.style.borderColor = C.borderInput)} />
        </div>

        {/* Notes */}
        <div>
          <label style={lbl}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes…" rows={2}
            style={{ ...inp, resize: 'vertical', lineHeight: '1.5' }}
            onFocus={e => (e.target.style.borderColor = C.primary)} onBlur={e => (e.target.style.borderColor = C.borderInput)} />
        </div>

        {/* Duration */}
        <div>
          <label style={lbl}>Campaign Duration</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-[9px] mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Start (today)</p>
              <input type="date" disabled value={new Date().toISOString().slice(0, 10)}
                style={{ ...inp, color: C.muted, cursor: 'not-allowed' }} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>End date (optional)</p>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)} style={inp}
                onFocus={e => (e.target.style.borderColor = C.primary)} onBlur={e => (e.target.style.borderColor = C.borderInput)} />
            </div>
          </div>
        </div>

        {/* Ad rate strategy — Standard only */}
        {type === 'PROMOTED_LISTINGS' ? (
          <div>
            <label style={lbl}>Ad Rate Strategy</label>
            <div className="flex flex-col gap-0 rounded-xl overflow-hidden" style={{ border: `1px solid ${C.borderInput}` }}>
              <label style={{ ...radioRow, backgroundColor: strategy === 'FIXED' ? C.primaryLight : C.surface }}>
                <input type="radio" name="strategy" value="FIXED" checked={strategy === 'FIXED'} onChange={() => setStrategy('FIXED')} style={{ accentColor: C.primary }} />
                <span style={{ fontWeight: strategy === 'FIXED' ? 600 : 400 }}>Apply fixed ad rate of</span>
                {strategy === 'FIXED' && (
                  <div className="flex items-center gap-1 ml-auto">
                    <input type="number" value={bidPct} onChange={e => setBidPct(e.target.value)} min="1" max="20" step="0.1"
                      style={{ border: `1px solid ${C.borderInput}`, borderRadius: 7, padding: '3px 8px', width: 60, fontFamily: 'DM Sans, sans-serif', fontSize: 12, outline: 'none', backgroundColor: C.surface, color: C.body }} />
                    <span className="text-[11px]" style={{ color: C.muted }}>%</span>
                  </div>
                )}
              </label>
              <div style={{ borderTop: `1px solid ${C.borderInput}` }}>
                <label style={{ ...radioRow, backgroundColor: strategy !== 'FIXED' ? C.primaryLight : C.surface }}>
                  <input type="radio" name="strategy" value="DYNAMIC" checked={strategy !== 'FIXED'} onChange={() => setStrategy('DYNAMIC_NO_ADJUST')} style={{ accentColor: C.primary }} />
                  <span style={{ fontWeight: strategy !== 'FIXED' ? 600 : 400 }}>Dynamic (eBay suggested)</span>
                </label>
                {strategy !== 'FIXED' && (
                  <div className="flex flex-col gap-0.5 px-4 pb-2" style={{ backgroundColor: C.primaryLight }}>
                    {(['DYNAMIC_NO_ADJUST', 'DYNAMIC_HIGHER', 'DYNAMIC_LOWER'] as AdRateStrategy[]).map(val => (
                      <label key={val} style={{ ...radioRow, backgroundColor: 'transparent', padding: '4px 8px' }}>
                        <input type="radio" name="sub" value={val} checked={strategy === val} onChange={() => setStrategy(val)} style={{ accentColor: C.primary }} />
                        <span style={{ fontSize: 11 }}>{val === 'DYNAMIC_NO_ADJUST' ? "Don't adjust" : val === 'DYNAMIC_HIGHER' ? 'Bid higher by' : 'Bid lower by'}</span>
                        {(val === 'DYNAMIC_HIGHER' || val === 'DYNAMIC_LOWER') && strategy === val && (
                          <div className="flex items-center gap-1 ml-auto">
                            <input type="number" value={adjustPct} onChange={e => setAdjustPct(e.target.value)} min="0" max="100"
                              style={{ border: `1px solid ${C.borderInput}`, borderRadius: 7, padding: '3px 8px', width: 55, fontFamily: 'DM Sans, sans-serif', fontSize: 11, outline: 'none', backgroundColor: C.surface, color: C.body }} />
                            <span style={{ fontSize: 10, color: C.muted }}>%</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Max rate cap */}
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="maxcap" checked={!!maxRate} onChange={e => setMaxRate(e.target.checked ? '15' : '')} style={{ accentColor: C.primary }} />
              <label htmlFor="maxcap" className="text-[11px]" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>Max ad rate cap</label>
              {maxRate && (
                <div className="flex items-center gap-1 ml-auto">
                  <input type="number" value={maxRate} onChange={e => setMaxRate(e.target.value)} min="1" max="20" step="0.1"
                    style={{ border: `1px solid ${C.borderInput}`, borderRadius: 7, padding: '3px 8px', width: 60, fontFamily: 'DM Sans, sans-serif', fontSize: 12, outline: 'none', backgroundColor: C.surface, color: C.body }} />
                  <span className="text-[11px]" style={{ color: C.muted }}>%</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label style={lbl}>Daily Budget (USD)</label>
            <div className="flex items-center gap-2">
              <input value={daily} onChange={e => setDaily(e.target.value)} type="number" min="1" step="1"
                style={{ ...inp, width: 120 }}
                onFocus={e => (e.target.style.borderColor = C.primary)} onBlur={e => (e.target.style.borderColor = C.borderInput)} />
              <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>USD / day</span>
            </div>
          </div>
        )}

        {/* Auto-enroll */}
        <div className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: autoEnroll ? C.primaryLight : C.bg, border: `1.5px solid ${autoEnroll ? C.primary : C.border}`, transition: 'all 0.2s' }}>
          <Sparkles size={15} style={{ color: autoEnroll ? C.primary : C.muted, marginTop: 1, flexShrink: 0 }} />
          <div className="flex-1">
            <p className="text-[12px] font-bold" style={{ color: autoEnroll ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif' }}>Auto-enroll new listings</p>
            <p className="text-[10px] mt-0.5" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Automatically promote every new listing into this campaign</p>
          </div>
          <button onClick={() => setAutoEnroll(v => !v)} style={{ color: autoEnroll ? C.primary : C.muted, flexShrink: 0 }}>
            {autoEnroll ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
          <Info size={11} style={{ color: C.primary, marginTop: 1.5, flexShrink: 0 }} />
          <p className="text-[10px] leading-snug" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
            {type === 'PROMOTED_LISTINGS'
              ? 'Standard (CPS) — you only pay the ad fee when a sale is made through the promoted placement.'
              : 'Priority (CPC) — pay per click like Google Ads. Requires keyword management in eBay Seller Hub.'}
          </p>
        </div>

        {err && (
          <p className="text-[11px] flex items-center gap-1" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
            <AlertCircle size={10} /> {err}
          </p>
        )}

        <div className="flex gap-2 pb-4">
          <button onClick={submit} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            {saving ? 'Creating…' : 'Create Campaign'}
          </button>
          <button onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Enroll Form ────────────────────────────────────────────────────────────────
function EnrollForm({ campaign, onEnrolled }: { campaign: Campaign; onEnrolled: (ad: Ad) => void }) {
  const [listingId,    setListingId]    = useState('')
  const [listingTitle, setListingTitle] = useState('')
  const [saving,       setSaving]       = useState(false)
  const [err,          setErr]          = useState<string | null>(null)
  const [success,      setSuccess]      = useState(false)

  async function enroll() {
    if (!listingId.trim()) { setErr('eBay listing ID is required'); return }
    setSaving(true); setErr(null)
    try {
      const res = await fetch('/api/ebay/promotions/enroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaign_id, listingId: listingId.trim(), listingTitle: listingTitle.trim() || undefined, bidPercentage: campaign.bid_percentage ?? undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      onEnrolled(json.ad); setListingId(''); setListingTitle('')
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) { setErr(e.message) }
    setSaving(false)
  }

  const inp2: React.CSSProperties = { border: `1px solid ${C.borderInput}`, borderRadius: 10, padding: '7px 10px', backgroundColor: C.surface, color: C.body, fontFamily: 'DM Sans, sans-serif', fontSize: 12, outline: 'none', flex: 1 }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Enroll a Listing</p>
      <div className="flex gap-2">
        <input value={listingId} onChange={e => setListingId(e.target.value)} placeholder="eBay Item ID"
          style={{ ...inp2, width: 130, flex: 'none' }}
          onFocus={e => (e.target.style.borderColor = C.primary)} onBlur={e => (e.target.style.borderColor = C.borderInput)} />
        <input value={listingTitle} onChange={e => setListingTitle(e.target.value)} placeholder="Title (optional)"
          style={inp2}
          onFocus={e => (e.target.style.borderColor = C.primary)} onBlur={e => (e.target.style.borderColor = C.borderInput)} />
        <button onClick={enroll} disabled={saving || !listingId.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
          {saving ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />} Add
        </button>
      </div>
      {err     && <p className="text-[10px]" style={{ color: C.danger,  fontFamily: 'DM Sans, sans-serif' }}>{err}</p>}
      {success && <p className="text-[10px] flex items-center gap-1" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}><CheckCircle2 size={9} /> Listing enrolled!</p>}
    </div>
  )
}

// ── Detail Panel ───────────────────────────────────────────────────────────────
function DetailPanel({ campaign, onUpdate, onClone, onClose }: {
  campaign: Campaign
  onUpdate: (id: string, u: Partial<Campaign>) => void
  onClone:  (c: Campaign) => void
  onClose:  () => void
}) {
  const [ads,        setAds]        = useState<Ad[]>([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [acting,     setActing]     = useState(false)
  const [actErr,     setActErr]     = useState<string | null>(null)
  const [actSuccess, setActSuccess] = useState<string | null>(null)

  const sc   = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.ENDED
  const tc   = TYPE_CONFIG[campaign.campaign_type] ?? TYPE_CONFIG.PROMOTED_LISTINGS
  const TcIcon = tc.icon
  const rc   = roasColor(campaign.roas)
  const hs   = healthScore(campaign)
  const ctr  = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100).toFixed(2) : '—'

  async function loadAds() {
    setLoadingAds(true)
    try {
      const res = await fetch(`/api/ebay/promotions/ads?campaignId=${campaign.campaign_id}`)
      if (res.ok) { const j = await res.json(); setAds(j.ads ?? []) }
    } catch { /**/ }
    setLoadingAds(false)
  }
  useEffect(() => { loadAds() }, [campaign.campaign_id])

  async function doAction(action: 'end' | 'pause' | 'resume') {
    setActing(true); setActErr(null); setActSuccess(null)
    try {
      const res = await fetch('/api/ebay/promotions/campaigns/end', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaign_id, action }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      onUpdate(campaign.campaign_id, { status: json.status })
      setActSuccess(`Campaign ${action === 'end' ? 'ended' : action === 'pause' ? 'paused' : 'resumed'}`)
      setTimeout(() => setActSuccess(null), 3000)
    } catch (e: any) { setActErr(e.message) }
    setActing(false)
  }

  async function unenroll(ad: Ad) {
    try {
      const res = await fetch('/api/ebay/promotions/enroll', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaign_id, listingId: ad.listing_id }),
      })
      if (res.ok) setAds(prev => prev.filter(a => a.listing_id !== ad.listing_id))
    } catch { /**/ }
  }

  async function toggleAutoEnroll() {
    const next = !campaign.auto_enroll
    try {
      await fetch('/api/ebay/promotions/campaigns', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaign_id, autoEnroll: next }),
      })
      onUpdate(campaign.campaign_id, { auto_enroll: next })
    } catch { /**/ }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.surface }}>
      {/* Header */}
      <div className="shrink-0 px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: tc.bg, color: tc.color }}>
              <TcIcon size={9} /> {tc.label}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: sc.bg, color: sc.color }}>
              {campaign.status}
            </span>
            {campaign.impressions > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ backgroundColor: hs.color + '15', color: hs.color }}>
                {hs.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href="https://www.ebay.com/sh/mkt/promotions" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1" style={{ color: C.primary, textDecoration: 'none' }}>
              <ExternalLink size={10} />
              <span className="text-[10px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>eBay Ads</span>
            </a>
            <button onClick={onClose}><X size={15} style={{ color: C.muted }} /></button>
          </div>
        </div>
        <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>{campaign.campaign_name}</p>
        <p className="text-[11px] mt-0.5" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
          {campaign.marketplace_id.replace('EBAY_', '')} · {fmtDate(campaign.start_date)}{campaign.end_date ? ` → ${fmtDate(campaign.end_date)}` : ' · No end date'}
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">

        {/* Performance grid */}
        <div>
          <p className="text-[11px] font-bold mb-2" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Performance</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: Eye, color: C.info, label: 'Impressions', value: fmtNum(campaign.impressions), sub: null },
              { icon: MousePointerClick, color: C.primary, label: 'Clicks', value: fmtNum(campaign.clicks), sub: `CTR: ${ctr}${ctr !== '—' ? '%' : ''}` },
              { icon: ShoppingBag, color: C.success, label: 'Items Sold', value: String(campaign.items_sold), sub: campaign.sales_amount > 0 ? `${fmtUSD(campaign.sales_amount)} revenue` : null },
              { icon: BarChart2, color: campaign.roas != null ? rc.color : C.muted, label: 'ROAS', value: campaign.roas != null ? `${campaign.roas.toFixed(2)}x` : '—', sub: campaign.ad_fees_amount > 0 ? `${fmtUSD(campaign.ad_fees_amount)} ad fees` : null, roasStyle: campaign.roas != null },
            ].map(({ icon: Icon, color, label, value, sub, roasStyle }) => (
              <div key={label} className="flex flex-col gap-1 p-3 rounded-xl"
                style={{ backgroundColor: (roasStyle && campaign.roas != null) ? rc.bg : C.bg, border: `1px solid ${(roasStyle && campaign.roas != null) ? rc.color + '44' : C.border}` }}>
                <div className="flex items-center gap-1">
                  <Icon size={10} style={{ color }} />
                  <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                </div>
                <p className="text-[18px] font-bold" style={{ color: roasStyle && campaign.roas != null ? rc.color : C.dark, fontFamily: 'Syne, sans-serif' }}>{value}</p>
                {sub && <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{sub}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Campaign details */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
          <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Campaign Details</p>
          <div className="flex flex-col gap-1.5">
            {campaign.bid_percentage != null && (
              <div className="flex items-center gap-2">
                <Percent size={10} style={{ color: C.primary }} />
                <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                  <strong>{campaign.bid_percentage}%</strong> ad rate
                  {campaign.ad_rate_strategy && campaign.ad_rate_strategy !== 'FIXED' && (
                    <span style={{ color: C.muted }}> · {STRATEGY_LABELS[campaign.ad_rate_strategy] ?? campaign.ad_rate_strategy}</span>
                  )}
                </span>
              </div>
            )}
            {campaign.daily_budget != null && (
              <div className="flex items-center gap-2">
                <DollarSign size={10} style={{ color: C.warning }} />
                <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                  <strong>${campaign.daily_budget}</strong>/day budget
                </span>
              </div>
            )}
            {campaign.max_ad_rate != null && (
              <div className="flex items-center gap-2">
                <ArrowUpRight size={10} style={{ color: C.danger }} />
                <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                  Max rate cap: <strong>{campaign.max_ad_rate}%</strong>
                </span>
              </div>
            )}
            {campaign.notes && (
              <div className="flex items-start gap-2 mt-1">
                <StickyNote size={10} style={{ color: C.muted, marginTop: 1 }} />
                <span className="text-[11px] leading-snug" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>{campaign.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Auto-enroll */}
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: campaign.auto_enroll ? C.primaryLight : C.bg, border: `1.5px solid ${campaign.auto_enroll ? C.primary : C.border}`, transition: 'all 0.2s' }}>
          <Sparkles size={14} style={{ color: campaign.auto_enroll ? C.primary : C.muted }} />
          <div className="flex-1">
            <p className="text-[11px] font-bold" style={{ color: campaign.auto_enroll ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif' }}>Auto-enroll new listings</p>
            <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{campaign.auto_enroll ? 'New listings will be automatically promoted' : 'Tap to enable'}</p>
          </div>
          <button onClick={toggleAutoEnroll} style={{ color: campaign.auto_enroll ? C.primary : C.muted }}>
            {campaign.auto_enroll ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          </button>
        </div>

        {/* Actions */}
        {campaign.status !== 'ENDED' && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Actions</p>
            <div className="flex gap-2 flex-wrap">
              {campaign.status === 'RUNNING' && (
                <button onClick={() => doAction('pause')} disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: C.warningBg, color: C.warning, border: `1px solid #fcd34d`, fontFamily: 'DM Sans, sans-serif' }}>
                  {acting ? <Loader2 size={10} className="animate-spin" /> : <Pause size={10} />} Pause
                </button>
              )}
              {campaign.status === 'PAUSED' && (
                <button onClick={() => doAction('resume')} disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: C.successBg, color: C.success, border: `1px solid #86efac`, fontFamily: 'DM Sans, sans-serif' }}>
                  {acting ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />} Resume
                </button>
              )}
              <button onClick={() => onClone(campaign)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80"
                style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                <Copy size={10} /> Clone
              </button>
              <button onClick={() => doAction('end')} disabled={acting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: C.dangerBg, color: C.danger, border: `1px solid #fca5a5`, fontFamily: 'DM Sans, sans-serif' }}>
                {acting ? <Loader2 size={10} className="animate-spin" /> : <Square size={10} />} End Campaign
              </button>
            </div>
            {actErr     && <p className="text-[10px]" style={{ color: C.danger,  fontFamily: 'DM Sans, sans-serif' }}>{actErr}</p>}
            {actSuccess && <p className="text-[10px]" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>✓ {actSuccess}</p>}
          </div>
        )}

        {/* Enroll form */}
        {campaign.status !== 'ENDED' && campaign.campaign_type === 'PROMOTED_LISTINGS' && (
          <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
            <EnrollForm campaign={campaign} onEnrolled={ad => {
              setAds(prev => {
                const exists = prev.find(a => a.listing_id === ad.listing_id)
                return exists ? prev.map(a => a.listing_id === ad.listing_id ? ad : a) : [ad, ...prev]
              })
              onUpdate(campaign.campaign_id, { ad_count: (campaign.ad_count ?? 0) + 1 })
            }} />
          </div>
        )}

        {/* Enrolled listings */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Enrolled Listings ({ads.length})</p>
          {loadingAds ? (
            <div className="flex items-center gap-2 py-4"><Loader2 size={14} className="animate-spin" style={{ color: C.primary }} /><span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Loading…</span></div>
          ) : ads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 rounded-2xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <Tag size={16} style={{ color: C.muted }} />
              <p className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>No listings enrolled yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {ads.map(ad => (
                <div key={ad.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                      {ad.listing_title ?? `Item #${ad.listing_id}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>ID: {ad.listing_id}</span>
                      {ad.bid_percentage && <span className="text-[9px] font-semibold" style={{ color: C.primary }}>{ad.bid_percentage}%</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a href={`https://www.ebay.com/itm/${ad.listing_id}`} target="_blank" rel="noopener noreferrer" style={{ color: C.primary }}>
                      <ExternalLink size={10} />
                    </a>
                    {campaign.status !== 'ENDED' && (
                      <button onClick={() => unenroll(ad)} className="transition-all hover:opacity-70" title="Remove">
                        <X size={10} style={{ color: C.muted }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PromotionsPage() {
  const [campaigns,    setCampaigns]    = useState<Campaign[]>([])
  const [loading,      setLoading]      = useState(true)
  const [syncing,      setSyncing]      = useState(false)
  const [syncMsg,      setSyncMsg]      = useState<string | null>(null)
  const [activeTab,    setActiveTab]    = useState<TabFilter>('all')
  const [search,       setSearch]       = useState('')
  const [sortKey,      setSortKey]      = useState('campaign_name')
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc')
  const [visibleCols,  setVisibleCols]  = useState<Set<string>>(new Set(DEFAULT_VISIBLE))
  const [showColMenu,  setShowColMenu]  = useState(false)
  const [drawerMode,   setDrawerMode]   = useState<DrawerMode>('none')
  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [cloneSeed,    setCloneSeed]    = useState<Campaign | null>(null)
  const colMenuRef = useRef<HTMLDivElement>(null)

  // Close column menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setShowColMenu(false)
    }
    if (showColMenu) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColMenu])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ebay/promotions/campaigns')
      const json = await res.json()
      if (json.campaigns) setCampaigns(json.campaigns)
    } catch { /**/ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function syncNow() {
    setSyncing(true); setSyncMsg(null)
    try {
      const res  = await fetch('/api/ebay/promotions/sync', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setSyncMsg(json.scopeError
          ? '⚠️ Marketing scope missing. Reconnect eBay in Settings → eBay Manager.'
          : `❌ ${json.error ?? 'Sync failed'}`)
      } else {
        setSyncMsg(`✅ Synced ${json.campaigns} campaigns, ${json.ads} ads`)
        await load()
      }
    } catch (e: any) { setSyncMsg(`❌ ${e.message}`) }
    setSyncing(false)
    setTimeout(() => setSyncMsg(null), 6000)
  }

  function patchCampaign(campaignId: string, updates: Partial<Campaign>) {
    setCampaigns(prev => prev.map(c => c.campaign_id === campaignId ? { ...c, ...updates } : c))
  }

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function openDetail(c: Campaign) { setSelectedId(c.campaign_id); setDrawerMode('detail') }
  function openCreate()            { setCloneSeed(null); setDrawerMode('create') }
  function closeDrawer()           { setDrawerMode('none'); setSelectedId(null) }
  function handleClone(src: Campaign) { setCloneSeed(src); setDrawerMode('create') }

  // Stats
  const running = campaigns.filter(c => c.status === 'RUNNING').length
  const paused  = campaigns.filter(c => c.status === 'PAUSED').length
  const ended   = campaigns.filter(c => c.status === 'ENDED').length
  const totalAdFees = campaigns.reduce((s, c) => s + (c.ad_fees_amount ?? 0), 0)
  const totalSold   = campaigns.reduce((s, c) => s + (c.items_sold ?? 0), 0)
  const avgRoas = (() => {
    const w = campaigns.filter(c => c.roas != null && c.status === 'RUNNING')
    return w.length ? w.reduce((s, c) => s + (c.roas ?? 0), 0) / w.length : null
  })()

  // Filter + sort
  const filtered = sortCampaigns(
    campaigns.filter(c => {
      const matchTab    = activeTab === 'all' || c.status === activeTab
      const matchSearch = !search.trim() ||
        c.campaign_name.toLowerCase().includes(search.toLowerCase()) ||
        c.campaign_id.toLowerCase().includes(search.toLowerCase())
      return matchTab && matchSearch
    }),
    sortKey, sortDir
  )

  const selectedCampaign = campaigns.find(c => c.campaign_id === selectedId) ?? null

  const TABS: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: campaigns.length },
    { key: 'RUNNING', label: 'Running', count: running },
    { key: 'PAUSED',  label: 'Paused',  count: paused  },
    { key: 'ENDED',   label: 'Ended',   count: ended   },
  ]

  const visColDefs = COLUMNS.filter(c => visibleCols.has(c.key))

  // ── Render ──
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.bg }}>

      {/* ── Top header ── */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3 flex-wrap"
        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <Megaphone size={16} style={{ color: C.primary }} />
          <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Promotion Manager</p>
        </div>

        {/* Stats chips */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          {[
            { label: `${running} Running`, color: C.success, bg: C.successBg },
            { label: `${paused} Paused`,   color: C.warning, bg: C.warningBg },
            { label: `${ended} Ended`,     color: C.muted,   bg: '#f3f4f6'   },
          ].map(({ label, color, bg }) => (
            <span key={label} className="inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ backgroundColor: bg, color, border: `1px solid ${color}22` }}>
              {label}
            </span>
          ))}
          {totalSold > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ backgroundColor: C.successBg, color: C.success, border: `1px solid ${C.success}22` }}>
              <ShoppingBag size={10} /> {totalSold} sold
            </span>
          )}
          {avgRoas != null && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ backgroundColor: roasColor(avgRoas).bg, color: roasColor(avgRoas).color, border: `1px solid ${roasColor(avgRoas).color}22` }}>
              <BarChart2 size={10} /> {avgRoas.toFixed(1)}x ROAS avg
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={syncNow} disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-85 disabled:opacity-60"
            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Sync
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-85"
            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
            <Plus size={12} /> New Campaign
          </button>
        </div>
      </div>

      {/* Sync message */}
      {syncMsg && (
        <div className="shrink-0 mx-6 mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{
            backgroundColor: syncMsg.startsWith('✅') ? C.successBg : syncMsg.startsWith('⚠️') ? C.warningBg : C.dangerBg,
            color: syncMsg.startsWith('✅') ? C.success : syncMsg.startsWith('⚠️') ? C.warning : C.danger,
            border: `1px solid ${syncMsg.startsWith('✅') ? '#86efac' : syncMsg.startsWith('⚠️') ? '#fcd34d' : '#fca5a5'}`,
          }}>
          <span className="flex-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{syncMsg}</span>
          <button onClick={() => setSyncMsg(null)}><X size={12} /></button>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 flex-wrap"
        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map(({ key, label, count }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                backgroundColor: activeTab === key ? C.primary : 'transparent',
                color:            activeTab === key ? '#fff'     : C.secondary,
                fontFamily: 'DM Sans, sans-serif',
              }}>
              {label} <span style={{ opacity: 0.7 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl ml-2"
          style={{ backgroundColor: C.bg, border: `1px solid ${C.borderInput}`, minWidth: 220 }}>
          <Search size={11} style={{ color: C.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="flex-1 bg-transparent outline-none text-[12px]"
            style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }} />
          {search && <button onClick={() => setSearch('')}><X size={10} style={{ color: C.muted }} /></button>}
        </div>

        {/* Column toggle */}
        <div className="relative ml-auto" ref={colMenuRef}>
          <button onClick={() => setShowColMenu(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:opacity-85"
            style={{
              backgroundColor: showColMenu ? C.primaryLight : C.bg,
              color: showColMenu ? C.primary : C.secondary,
              border: `1px solid ${showColMenu ? C.primary : C.borderInput}`,
              fontFamily: 'DM Sans, sans-serif',
            }}>
            <SlidersHorizontal size={12} /> Columns
          </button>

          {showColMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-2xl overflow-hidden shadow-xl"
              style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, width: 220, maxHeight: 380, overflowY: 'auto' }}>
              <div className="px-3 py-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Column Options</p>
              </div>
              {COLUMNS.map(col => (
                <label key={col.key} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox"
                    checked={visibleCols.has(col.key)}
                    onChange={e => {
                      setVisibleCols(prev => {
                        const next = new Set(prev)
                        e.target.checked ? next.add(col.key) : next.delete(col.key)
                        return next
                      })
                    }}
                    style={{ accentColor: C.primary }} />
                  <span className="text-[12px]" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>{col.label}</span>
                  {!col.defaultVisible && (
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: C.primaryLight, color: C.primary }}>Exclusive</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 min-h-0 overflow-auto" style={{ backgroundColor: C.surface }}>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={24} className="animate-spin" style={{ color: C.primary }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 h-64">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.primaryLight }}>
              <Megaphone size={24} style={{ color: C.primary }} />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold mb-1" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                {campaigns.length === 0 ? 'No campaigns yet' : 'No results'}
              </p>
              <p className="text-[12px] mb-3" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                {campaigns.length === 0
                  ? 'Create your first Promoted Listings campaign to boost visibility on eBay.'
                  : 'Try a different search or filter.'}
              </p>
              {campaigns.length === 0 && (
                <button onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold mx-auto transition-all hover:opacity-90"
                  style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                  <Plus size={13} /> New Campaign
                </button>
              )}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: visColDefs.reduce((s, c) => s + c.minW, 0) + 110 }}>
            <thead>
              <tr style={{ backgroundColor: C.bg, borderBottom: `2px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
                {visColDefs.map(col => (
                  <th key={col.key}
                    style={{
                      width: col.minW, minWidth: col.minW, padding: '10px 12px',
                      textAlign: 'left', userSelect: 'none',
                      cursor: col.sortable ? 'pointer' : 'default',
                    }}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: sortKey === col.key ? C.primary : C.secondary, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                        {col.label}
                      </span>
                      {col.sortable && (
                        sortKey === col.key
                          ? (sortDir === 'asc' ? <ChevronUp size={10} style={{ color: C.primary, flexShrink: 0 }} /> : <ChevronDown size={10} style={{ color: C.primary, flexShrink: 0 }} />)
                          : <ArrowUpDown size={9} style={{ color: C.muted, flexShrink: 0 }} />
                      )}
                    </div>
                  </th>
                ))}
                {/* Actions column */}
                <th style={{ width: 110, minWidth: 110, padding: '10px 12px', textAlign: 'left' }}>
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    backgroundColor: i % 2 === 0 ? C.surface : C.bg,
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.primaryLight)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? C.surface : C.bg)}
                >
                  {visColDefs.map(col => (
                    <td key={col.key} style={{ padding: '10px 12px', verticalAlign: 'middle', overflow: 'hidden' }}>
                      {renderCell(col, c, () => openDetail(c))}
                    </td>
                  ))}
                  {/* Inline action buttons */}
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openDetail(c)}
                        title="View details"
                        className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                        View
                      </button>
                      {c.status === 'RUNNING' && (
                        <button onClick={async () => {
                          const res = await fetch('/api/ebay/promotions/campaigns/end', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId: c.campaign_id, action: 'pause' }) })
                          if (res.ok) { const j = await res.json(); patchCampaign(c.campaign_id, { status: j.status }) }
                        }}
                          title="Pause" className="p-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ backgroundColor: C.warningBg, color: C.warning }}>
                          <Pause size={10} />
                        </button>
                      )}
                      {c.status === 'PAUSED' && (
                        <button onClick={async () => {
                          const res = await fetch('/api/ebay/promotions/campaigns/end', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId: c.campaign_id, action: 'resume' }) })
                          if (res.ok) { const j = await res.json(); patchCampaign(c.campaign_id, { status: j.status }) }
                        }}
                          title="Resume" className="p-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ backgroundColor: C.successBg, color: C.success }}>
                          <Play size={10} />
                        </button>
                      )}
                      <button onClick={() => handleClone(c)}
                        title="Clone" className="p-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}` }}>
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Row count footer */}
      {!loading && filtered.length > 0 && (
        <div className="shrink-0 px-5 py-2 flex items-center justify-between"
          style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
          <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
            {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
            {activeTab !== 'all' || search ? ` (filtered from ${campaigns.length})` : ''}
          </span>
          <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
            {visibleCols.size} of {COLUMNS.length} columns shown
          </span>
        </div>
      )}

      {/* ── Right-side Drawer ── */}
      {drawerMode !== 'none' && (
        <>
          {/* Backdrop */}
          <div onClick={closeDrawer}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30,21,53,0.35)', zIndex: 40, backdropFilter: 'blur(2px)' }} />

          {/* Drawer panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
            zIndex: 50, boxShadow: '-4px 0 32px rgba(117,48,251,0.15)',
            display: 'flex', flexDirection: 'column',
          }}>
            {drawerMode === 'create' ? (
              <CreateCampaignForm
                key={cloneSeed?.campaign_id ?? 'new'}
                onCreated={c => {
                  setCampaigns(prev => [c, ...prev])
                  setCloneSeed(null)
                  setDrawerMode('none')
                }}
                onCancel={closeDrawer}
              />
            ) : selectedCampaign ? (
              <DetailPanel
                key={selectedCampaign.campaign_id}
                campaign={selectedCampaign}
                onUpdate={patchCampaign}
                onClone={c => { setCloneSeed(c); setDrawerMode('create') }}
                onClose={closeDrawer}
              />
            ) : null}
          </div>
        </>
      )}

    </div>
  )
}
