'use client'
// app/dashboard/promotions/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Promotion Manager v2
// Features: notes, date range, ad-rate strategy, perf metrics, search,
//           ROAS color coding, campaign clone, auto-enroll toggle, health score
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, Plus, Megaphone, Loader2, X, ChevronRight,
  TrendingUp, Zap, Play, Pause, Square, AlertCircle,
  CheckCircle2, Package, BarChart2, DollarSign, Tag,
  ExternalLink, Info, Search, Copy, Eye, MousePointerClick,
  ShoppingBag, Percent, Calendar, StickyNote, Sparkles,
  ToggleLeft, ToggleRight, ArrowUpRight, ArrowDownRight,
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

type TabFilter = 'all' | 'RUNNING' | 'PAUSED' | 'ENDED'
type AdRateStrategy = 'FIXED' | 'DYNAMIC_NO_ADJUST' | 'DYNAMIC_HIGHER' | 'DYNAMIC_LOWER'

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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

// Campaign health: 0-100 score based on ROAS + CTR
function healthScore(c: Campaign): { score: number; label: string; color: string } {
  if (c.impressions === 0) return { score: 0, label: 'No data', color: C.muted }
  const ctr  = c.clicks / c.impressions
  const roas = c.roas ?? 0
  const raw  = Math.min(100, (ctr * 1000 * 20) + (roas * 15))
  const score = Math.round(raw)
  if (score >= 70) return { score, label: 'Excellent', color: C.success }
  if (score >= 40) return { score, label: 'Good',      color: C.warning }
  return { score, label: 'Needs work', color: C.danger }
}

const STATUS_CONFIG = {
  RUNNING: { color: C.success,  bg: C.successBg,  icon: Play,   label: 'Running'  },
  PAUSED:  { color: C.warning,  bg: C.warningBg,  icon: Pause,  label: 'Paused'   },
  ENDED:   { color: C.muted,    bg: '#f3f4f6',    icon: Square, label: 'Ended'    },
}

const TYPE_CONFIG = {
  PROMOTED_LISTINGS:          { label: 'Standard',  icon: TrendingUp, color: C.primary,  bg: C.primaryLight },
  PROMOTED_LISTINGS_PRIORITY: { label: 'Priority',  icon: Zap,        color: C.warning,  bg: C.warningBg   },
}

const STRATEGY_LABELS: Record<string, string> = {
  FIXED:              'Fixed rate',
  DYNAMIC_NO_ADJUST:  'Dynamic — no adjustment',
  DYNAMIC_HIGHER:     'Dynamic — bid higher',
  DYNAMIC_LOWER:      'Dynamic — bid lower',
}

// ── Campaign row (left list) ───────────────────────────────────────────────────
function CampaignRow({ campaign, selected, onClick }: {
  campaign: Campaign; selected: boolean; onClick: () => void
}) {
  const sc    = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.ENDED
  const tc    = TYPE_CONFIG[campaign.campaign_type] ?? TYPE_CONFIG.PROMOTED_LISTINGS
  const ScIcon = sc.icon
  const TcIcon = tc.icon
  const rc    = roasColor(campaign.roas)
  const ctr   = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : null

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-stretch transition-all"
      style={{
        backgroundColor: selected ? C.primaryLight : 'transparent',
        borderBottom: `1px solid ${C.border}`,
        outline: 'none',
      }}
    >
      {/* Type stripe */}
      <div style={{ width: 3, backgroundColor: tc.color, flexShrink: 0 }} />

      {/* Icon badge */}
      <div className="flex items-center px-3 py-3 shrink-0">
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          backgroundColor: tc.bg, color: tc.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${tc.color}33`, flexShrink: 0,
        }}>
          <TcIcon size={15} />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 pr-3 py-3 min-w-0">
        {/* Name + status icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-bold truncate"
            style={{ color: selected ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif' }}>
            {campaign.campaign_name}
          </span>
          <ScIcon size={11} style={{ color: sc.color, flexShrink: 0 }} />
        </div>

        {/* Channel + bid/budget */}
        <p className="text-[10px] truncate" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
          {campaign.marketplace_id.replace('EBAY_', '')}
          {campaign.bid_percentage  ? ` · ${campaign.bid_percentage}% rate` : ''}
          {campaign.daily_budget    ? ` · $${campaign.daily_budget}/day`    : ''}
        </p>

        {/* Metrics + badges */}
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
            style={{ backgroundColor: sc.bg, color: sc.color }}>
            {sc.label}
          </span>
          {campaign.impressions > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
              style={{ backgroundColor: C.infoBg, color: C.info }}>
              <Eye size={7} /> {fmtNum(campaign.impressions)}
            </span>
          )}
          {campaign.roas != null && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ backgroundColor: rc.bg, color: rc.color }}>
              {campaign.roas.toFixed(1)}x ROAS
            </span>
          )}
          {campaign.auto_enroll && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ backgroundColor: C.primaryLight, color: C.primary }}>
              <Sparkles size={7} /> Auto
            </span>
          )}
        </div>
      </div>

      {selected && (
        <div className="flex items-center pr-2">
          <ChevronRight size={12} style={{ color: C.primary }} />
        </div>
      )}
    </button>
  )
}

// ── Create Campaign Form ───────────────────────────────────────────────────────
function CreateCampaignForm({ onCreated, onCancel }: {
  onCreated: (c: Campaign) => void
  onCancel:  () => void
}) {
  const [name,            setName]            = useState('')
  const [type,            setType]            = useState<'PROMOTED_LISTINGS' | 'PROMOTED_LISTINGS_PRIORITY'>('PROMOTED_LISTINGS')
  const [bidPct,          setBidPct]          = useState('5')
  const [dailyBudget,     setDailyBudget]     = useState('10')
  const [notes,           setNotes]           = useState('')
  const [endDate,         setEndDate]         = useState('')
  const [strategy,        setStrategy]        = useState<AdRateStrategy>('FIXED')
  const [adjustPct,       setAdjustPct]       = useState('10')
  const [maxRate,         setMaxRate]         = useState('')
  const [autoEnroll,      setAutoEnroll]      = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [err,             setErr]             = useState<string | null>(null)

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
          bidPercentage:    type === 'PROMOTED_LISTINGS' ? bidPct : undefined,
          dailyBudget:      type === 'PROMOTED_LISTINGS_PRIORITY' ? dailyBudget : undefined,
          endDate:          endDate || undefined,
          notes:            notes.trim() || undefined,
          adRateStrategy:   strategy,
          bidAdjustmentPct: (strategy === 'DYNAMIC_HIGHER' || strategy === 'DYNAMIC_LOWER') ? adjustPct : undefined,
          maxAdRate:        maxRate ? maxRate : undefined,
          autoEnroll,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create campaign')
      onCreated(json.campaign)
    } catch (e: any) {
      setErr(e.message)
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${C.borderInput}`, borderRadius: 10,
    padding: '8px 12px', width: '100%',
    backgroundColor: C.surface, color: C.body,
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: C.dark,
    fontFamily: 'DM Sans, sans-serif', marginBottom: 4, display: 'block',
  }
  const radioStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.body,
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: C.surface }}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}>
        <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
          New Campaign
        </p>
        <button onClick={onCancel}><X size={16} style={{ color: C.muted }} /></button>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5">

        {/* Campaign Type */}
        <div>
          <label style={labelStyle}>Campaign Type</label>
          <div className="flex gap-2">
            {(['PROMOTED_LISTINGS', 'PROMOTED_LISTINGS_PRIORITY'] as const).map(t => {
              const tc = TYPE_CONFIG[t]
              const TcIcon = tc.icon
              return (
                <button key={t} onClick={() => setType(t)}
                  className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    border: `1.5px solid ${type === t ? tc.color : C.border}`,
                    backgroundColor: type === t ? tc.bg : C.surface,
                  }}>
                  <TcIcon size={13} style={{ color: tc.color }} />
                  <div className="text-left">
                    <p className="text-[11px] font-bold" style={{ color: type === t ? tc.color : C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                      {tc.label}
                    </p>
                    <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                      {t === 'PROMOTED_LISTINGS' ? 'Pay per sale' : 'Pay per click'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Campaign Name */}
        <div>
          <label style={labelStyle}>Campaign Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Summer Electronics PLS"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e => (e.target.style.borderColor = C.borderInput)}
          />
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Add internal notes about this campaign..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e => (e.target.style.borderColor = C.borderInput)}
          />
        </div>

        {/* Campaign Duration */}
        <div>
          <label style={labelStyle}>Campaign Duration</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-[9px] mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Start (today)</p>
              <input type="date" disabled
                value={new Date().toISOString().slice(0, 10)}
                style={{ ...inputStyle, color: C.muted, cursor: 'not-allowed', width: '100%' }}
              />
            </div>
            <div className="flex-1">
              <p className="text-[9px] mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>End date (optional)</p>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                style={{ ...inputStyle, width: '100%' }}
                onFocus={e => (e.target.style.borderColor = C.primary)}
                onBlur={e => (e.target.style.borderColor = C.borderInput)}
              />
            </div>
          </div>
        </div>

        {/* Ad Rate Strategy — Standard only */}
        {type === 'PROMOTED_LISTINGS' ? (
          <div>
            <label style={labelStyle}>Ad Rate Strategy</label>
            <div className="flex flex-col gap-1 rounded-xl overflow-hidden"
              style={{ border: `1px solid ${C.borderInput}` }}>

              {/* Fixed */}
              <label style={{
                ...radioStyle,
                backgroundColor: strategy === 'FIXED' ? C.primaryLight : C.surface,
              }}>
                <input type="radio" name="strategy" value="FIXED"
                  checked={strategy === 'FIXED'}
                  onChange={() => setStrategy('FIXED')}
                  style={{ accentColor: C.primary }} />
                <span style={{ fontWeight: strategy === 'FIXED' ? 600 : 400 }}>Apply fixed ad rate of</span>
                {strategy === 'FIXED' && (
                  <div className="flex items-center gap-1 ml-auto">
                    <input type="number" value={bidPct} onChange={e => setBidPct(e.target.value)}
                      min="1" max="20" step="0.1"
                      style={{ border: `1px solid ${C.borderInput}`, borderRadius: 7, padding: '3px 8px',
                        width: 60, fontFamily: 'DM Sans, sans-serif', fontSize: 12, outline: 'none',
                        backgroundColor: C.surface, color: C.body }}
                    />
                    <span className="text-[11px]" style={{ color: C.muted }}>%</span>
                  </div>
                )}
              </label>

              {/* Dynamic */}
              <div style={{ borderTop: `1px solid ${C.borderInput}` }}>
                <label style={{
                  ...radioStyle,
                  backgroundColor: strategy !== 'FIXED' ? C.primaryLight : C.surface,
                }}>
                  <input type="radio" name="strategy" value="DYNAMIC"
                    checked={strategy !== 'FIXED'}
                    onChange={() => setStrategy('DYNAMIC_NO_ADJUST')}
                    style={{ accentColor: C.primary }} />
                  <span style={{ fontWeight: strategy !== 'FIXED' ? 600 : 400 }}>Dynamic ad rate (eBay suggested)</span>
                </label>

                {strategy !== 'FIXED' && (
                  <div className="flex flex-col gap-0.5 px-4 pb-2"
                    style={{ backgroundColor: C.primaryLight }}>
                    {([
                      ['DYNAMIC_NO_ADJUST',  "Don't adjust eBay ad rate"],
                      ['DYNAMIC_HIGHER',     'Bid higher than eBay suggested'],
                      ['DYNAMIC_LOWER',      'Bid lower than eBay suggested'],
                    ] as [AdRateStrategy, string][]).map(([val, lbl]) => (
                      <label key={val} style={{ ...radioStyle, backgroundColor: 'transparent', padding: '4px 8px' }}>
                        <input type="radio" name="substrategy" value={val}
                          checked={strategy === val}
                          onChange={() => setStrategy(val)}
                          style={{ accentColor: C.primary }} />
                        <span style={{ fontSize: 11 }}>{lbl}</span>
                        {(val === 'DYNAMIC_HIGHER' || val === 'DYNAMIC_LOWER') && strategy === val && (
                          <div className="flex items-center gap-1 ml-auto">
                            <input type="number" value={adjustPct} onChange={e => setAdjustPct(e.target.value)}
                              min="0" max="100" step="1"
                              style={{ border: `1px solid ${C.borderInput}`, borderRadius: 7, padding: '3px 8px',
                                width: 55, fontFamily: 'DM Sans, sans-serif', fontSize: 11, outline: 'none',
                                backgroundColor: C.surface, color: C.body }}
                            />
                            <span style={{ fontSize: 10, color: C.muted }}>%</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Max ad rate cap */}
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="maxcap"
                checked={!!maxRate}
                onChange={e => setMaxRate(e.target.checked ? '15' : '')}
                style={{ accentColor: C.primary }} />
              <label htmlFor="maxcap" className="text-[11px]" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>
                Maximum ad rate cap
              </label>
              {maxRate && (
                <div className="flex items-center gap-1 ml-auto">
                  <input type="number" value={maxRate} onChange={e => setMaxRate(e.target.value)}
                    min="1" max="20" step="0.1"
                    style={{ border: `1px solid ${C.borderInput}`, borderRadius: 7, padding: '3px 8px',
                      width: 60, fontFamily: 'DM Sans, sans-serif', fontSize: 12, outline: 'none',
                      backgroundColor: C.surface, color: C.body }}
                  />
                  <span className="text-[11px]" style={{ color: C.muted }}>%</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Priority: daily budget */
          <div>
            <label style={labelStyle}>Daily Budget (USD)</label>
            <div className="flex items-center gap-2">
              <input value={dailyBudget} onChange={e => setDailyBudget(e.target.value)}
                type="number" min="1" step="1"
                style={{ ...inputStyle, width: 120 }}
                onFocus={e => (e.target.style.borderColor = C.primary)}
                onBlur={e => (e.target.style.borderColor = C.borderInput)}
              />
              <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>USD / day</span>
            </div>
          </div>
        )}

        {/* ─── OUR EXTRA: Auto-enroll toggle ─────────────────────────────── */}
        <div className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: autoEnroll ? C.primaryLight : C.bg, border: `1.5px solid ${autoEnroll ? C.primary : C.border}`, transition: 'all 0.2s' }}>
          <Sparkles size={16} style={{ color: autoEnroll ? C.primary : C.muted, marginTop: 1, flexShrink: 0 }} />
          <div className="flex-1">
            <p className="text-[12px] font-bold" style={{ color: autoEnroll ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif' }}>
              Auto-enroll new listings
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
              Automatically promote every new listing you publish into this campaign
            </p>
          </div>
          <button onClick={() => setAutoEnroll(v => !v)}
            style={{ color: autoEnroll ? C.primary : C.muted, flexShrink: 0 }}>
            {autoEnroll ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
          style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
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

// ── Enroll Listing Form ────────────────────────────────────────────────────────
function EnrollForm({ campaign, onEnrolled }: {
  campaign: Campaign
  onEnrolled: (ad: Ad) => void
}) {
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId:    campaign.campaign_id,
          listingId:     listingId.trim(),
          listingTitle:  listingTitle.trim() || undefined,
          bidPercentage: campaign.bid_percentage ?? undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      onEnrolled(json.ad)
      setListingId(''); setListingTitle('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) { setErr(e.message) }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${C.borderInput}`, borderRadius: 10,
    padding: '7px 10px', backgroundColor: C.surface, color: C.body,
    fontFamily: 'DM Sans, sans-serif', fontSize: 12, outline: 'none', flex: 1,
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Enroll a Listing</p>
      <div className="flex gap-2">
        <input value={listingId} onChange={e => setListingId(e.target.value)}
          placeholder="eBay Item ID"
          style={{ ...inputStyle, width: 130, flex: 'none' }}
          onFocus={e => (e.target.style.borderColor = C.primary)}
          onBlur={e => (e.target.style.borderColor = C.borderInput)}
        />
        <input value={listingTitle} onChange={e => setListingTitle(e.target.value)}
          placeholder="Title (optional)"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = C.primary)}
          onBlur={e => (e.target.style.borderColor = C.borderInput)}
        />
        <button onClick={enroll} disabled={saving || !listingId.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
          {saving ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
          Add
        </button>
      </div>
      {err     && <p className="text-[10px]" style={{ color: C.danger,  fontFamily: 'DM Sans, sans-serif' }}>{err}</p>}
      {success && (
        <p className="text-[10px] flex items-center gap-1" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
          <CheckCircle2 size={9} /> Listing enrolled in campaign!
        </p>
      )}
    </div>
  )
}

// ── Detail panel ───────────────────────────────────────────────────────────────
function DetailPanel({ campaign, onUpdate, onClone }: {
  campaign:  Campaign
  onUpdate:  (id: string, updates: Partial<Campaign>) => void
  onClone:   (c: Campaign) => void
}) {
  const [ads,        setAds]        = useState<Ad[]>([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [acting,     setActing]     = useState(false)
  const [actErr,     setActErr]     = useState<string | null>(null)
  const [actSuccess, setActSuccess] = useState<string | null>(null)

  const sc     = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.ENDED
  const tc     = TYPE_CONFIG[campaign.campaign_type] ?? TYPE_CONFIG.PROMOTED_LISTINGS
  const TcIcon = tc.icon
  const rc     = roasColor(campaign.roas)
  const hs     = healthScore(campaign)
  const ctr    = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100).toFixed(2) : '—'

  async function loadAds() {
    setLoadingAds(true)
    try {
      const res = await fetch(`/api/ebay/promotions/ads?campaignId=${campaign.campaign_id}`)
      if (res.ok) { const json = await res.json(); setAds(json.ads ?? []) }
    } catch { /* ignore */ }
    setLoadingAds(false)
  }

  useEffect(() => { loadAds() }, [campaign.campaign_id])

  async function doAction(action: 'end' | 'pause' | 'resume') {
    setActing(true); setActErr(null); setActSuccess(null)
    try {
      const res = await fetch('/api/ebay/promotions/campaigns/end', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaign_id, listingId: ad.listing_id }),
      })
      if (res.ok) setAds(prev => prev.filter(a => a.listing_id !== ad.listing_id))
    } catch { /* ignore */ }
  }

  async function toggleAutoEnroll() {
    const next = !campaign.auto_enroll
    try {
      await fetch('/api/ebay/promotions/campaigns', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaign_id, autoEnroll: next }),
      })
      onUpdate(campaign.campaign_id, { auto_enroll: next })
    } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.surface }}>

      {/* Header */}
      <div className="shrink-0 px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: tc.bg, color: tc.color }}>
            <TcIcon size={9} /> {tc.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: sc.bg, color: sc.color }}>
            {campaign.status}
          </span>
          {campaign.impressions > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
              style={{ backgroundColor: hs.color + '15', color: hs.color }}>
              {hs.label}
            </span>
          )}
          <a href={`https://www.ebay.com/sh/mkt/promotions`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 ml-auto"
            style={{ color: C.primary, textDecoration: 'none' }}>
            <ExternalLink size={10} />
            <span className="text-[10px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>eBay Ads</span>
          </a>
        </div>

        <p className="text-[16px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
          {campaign.campaign_name}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
          {campaign.marketplace_id.replace('EBAY_', '')} ·&nbsp;
          {fmtDate(campaign.start_date)}{campaign.end_date ? ` → ${fmtDate(campaign.end_date)}` : ' · No end date'}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        {/* ── Performance Grid ── */}
        <div>
          <p className="text-[11px] font-bold mb-2" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Performance</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {/* Impressions */}
            <div className="flex flex-col gap-1 p-3 rounded-xl"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-1">
                <Eye size={10} style={{ color: C.info }} />
                <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Impressions</span>
              </div>
              <p className="text-[18px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                {fmtNum(campaign.impressions)}
              </p>
            </div>

            {/* Clicks + CTR */}
            <div className="flex flex-col gap-1 p-3 rounded-xl"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-1">
                <MousePointerClick size={10} style={{ color: C.primary }} />
                <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Clicks</span>
              </div>
              <p className="text-[18px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                {fmtNum(campaign.clicks)}
              </p>
              <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>CTR: {ctr}{ctr !== '—' ? '%' : ''}</p>
            </div>

            {/* Items Sold + Sales */}
            <div className="flex flex-col gap-1 p-3 rounded-xl"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-1">
                <ShoppingBag size={10} style={{ color: C.success }} />
                <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Items Sold</span>
              </div>
              <p className="text-[18px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                {campaign.items_sold}
              </p>
              {campaign.sales_amount > 0 && (
                <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{fmtUSD(campaign.sales_amount)} revenue</p>
              )}
            </div>

            {/* ROAS */}
            <div className="flex flex-col gap-1 p-3 rounded-xl"
              style={{ backgroundColor: campaign.roas != null ? rc.bg : C.bg, border: `1px solid ${campaign.roas != null ? rc.color + '44' : C.border}` }}>
              <div className="flex items-center gap-1">
                <BarChart2 size={10} style={{ color: campaign.roas != null ? rc.color : C.muted }} />
                <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>ROAS</span>
              </div>
              <p className="text-[18px] font-bold" style={{ color: campaign.roas != null ? rc.color : C.muted, fontFamily: 'Syne, sans-serif' }}>
                {campaign.roas != null ? `${campaign.roas.toFixed(2)}x` : '—'}
              </p>
              {campaign.ad_fees_amount > 0 && (
                <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{fmtUSD(campaign.ad_fees_amount)} ad fees</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Campaign Info ── */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
          <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Campaign Details</p>

          <div className="flex flex-col gap-1.5">
            {/* Ad rate */}
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
                <span className="text-[11px] leading-snug" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                  {campaign.notes}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Auto-enroll toggle ── */}
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            backgroundColor: campaign.auto_enroll ? C.primaryLight : C.bg,
            border: `1.5px solid ${campaign.auto_enroll ? C.primary : C.border}`,
            transition: 'all 0.2s',
          }}>
          <Sparkles size={14} style={{ color: campaign.auto_enroll ? C.primary : C.muted }} />
          <div className="flex-1">
            <p className="text-[11px] font-bold" style={{ color: campaign.auto_enroll ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif' }}>
              Auto-enroll new listings
            </p>
            <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
              {campaign.auto_enroll ? 'New listings will be automatically promoted' : 'Tap to enable automatic enrollment'}
            </p>
          </div>
          <button onClick={toggleAutoEnroll} style={{ color: campaign.auto_enroll ? C.primary : C.muted }}>
            {campaign.auto_enroll ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          </button>
        </div>

        {/* ── Actions ── */}
        {campaign.status !== 'ENDED' && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Actions</p>
            <div className="flex gap-2 flex-wrap">
              {campaign.status === 'RUNNING' && (
                <button onClick={() => doAction('pause')} disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: C.warningBg, color: C.warning, border: `1px solid #fcd34d`, fontFamily: 'DM Sans, sans-serif' }}>
                  {acting ? <Loader2 size={10} className="animate-spin" /> : <Pause size={10} />}
                  Pause
                </button>
              )}
              {campaign.status === 'PAUSED' && (
                <button onClick={() => doAction('resume')} disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: C.successBg, color: C.success, border: `1px solid #86efac`, fontFamily: 'DM Sans, sans-serif' }}>
                  {acting ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                  Resume
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
                {acting ? <Loader2 size={10} className="animate-spin" /> : <Square size={10} />}
                End Campaign
              </button>
            </div>
            {actErr     && <p className="text-[10px]" style={{ color: C.danger,  fontFamily: 'DM Sans, sans-serif' }}>{actErr}</p>}
            {actSuccess && <p className="text-[10px]" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>✓ {actSuccess}</p>}
          </div>
        )}

        {/* ── Enroll Form ── */}
        {campaign.status !== 'ENDED' && campaign.campaign_type === 'PROMOTED_LISTINGS' && (
          <div className="flex flex-col gap-2 p-4 rounded-2xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
            <EnrollForm
              campaign={campaign}
              onEnrolled={ad => {
                setAds(prev => {
                  const exists = prev.find(a => a.listing_id === ad.listing_id)
                  return exists ? prev.map(a => a.listing_id === ad.listing_id ? ad : a) : [ad, ...prev]
                })
                onUpdate(campaign.campaign_id, { ad_count: (campaign.ad_count ?? 0) + 1 })
              }}
            />
          </div>
        )}

        {/* ── Enrolled Listings ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
            Enrolled Listings ({ads.length})
          </p>
          {loadingAds ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin" style={{ color: C.primary }} />
              <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Loading…</span>
            </div>
          ) : ads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 rounded-2xl"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <Tag size={18} style={{ color: C.muted }} />
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
                      {ad.bid_percentage && (
                        <span className="text-[9px] font-semibold" style={{ color: C.primary }}>{ad.bid_percentage}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a href={`https://www.ebay.com/itm/${ad.listing_id}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: C.primary }}>
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

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyDetail({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4" style={{ backgroundColor: C.surface }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.primaryLight }}>
        <Megaphone size={28} style={{ color: C.primary }} />
      </div>
      <div className="text-center px-8">
        <p className="text-[15px] font-bold mb-1" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Manage Promoted Listings</p>
        <p className="text-[12px] mb-4" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
          Create campaigns and enroll listings to boost your visibility on eBay search results.
        </p>
        <button onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold mx-auto transition-all hover:opacity-90"
          style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
          <Plus size={13} /> New Campaign
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PromotionsPage() {
  const [campaigns,   setCampaigns]   = useState<Campaign[]>([])
  const [loading,     setLoading]     = useState(true)
  const [syncing,     setSyncing]     = useState(false)
  const [syncMsg,     setSyncMsg]     = useState<string | null>(null)
  const [activeTab,   setActiveTab]   = useState<TabFilter>('all')
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [cloneSeed,   setCloneSeed]   = useState<Campaign | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ebay/promotions/campaigns')
      const json = await res.json()
      if (json.campaigns) setCampaigns(json.campaigns)
    } catch { /* ignore */ }
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
        setSyncMsg(`✅ Synced ${json.campaigns} campaign${json.campaigns !== 1 ? 's' : ''}, ${json.ads} ad${json.ads !== 1 ? 's' : ''}`)
        await load()
      }
    } catch (e: any) { setSyncMsg(`❌ ${e.message}`) }
    setSyncing(false)
    setTimeout(() => setSyncMsg(null), 6000)
  }

  function patchCampaign(campaignId: string, updates: Partial<Campaign>) {
    setCampaigns(prev => prev.map(c => c.campaign_id === campaignId ? { ...c, ...updates } : c))
  }

  // Stats
  const running = campaigns.filter(c => c.status === 'RUNNING').length
  const paused  = campaigns.filter(c => c.status === 'PAUSED').length
  const ended   = campaigns.filter(c => c.status === 'ENDED').length

  // Total spend + sold across all campaigns
  const totalAdFees = campaigns.reduce((s, c) => s + (c.ad_fees_amount ?? 0), 0)
  const totalSold   = campaigns.reduce((s, c) => s + (c.items_sold ?? 0), 0)
  const avgRoas     = (() => {
    const withRoas = campaigns.filter(c => c.roas != null && c.status === 'RUNNING')
    if (!withRoas.length) return null
    return withRoas.reduce((s, c) => s + (c.roas ?? 0), 0) / withRoas.length
  })()

  // Filter + search
  const filtered = campaigns.filter(c => {
    const matchTab    = activeTab === 'all' || c.status === activeTab
    const matchSearch = !search.trim() ||
      c.campaign_name.toLowerCase().includes(search.toLowerCase()) ||
      c.campaign_id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const selectedCampaign = campaigns.find(c => c.campaign_id === selectedId) ?? null

  // Auto-select first
  useEffect(() => {
    if (!selectedId && filtered.length > 0 && !showCreate) {
      setSelectedId(filtered[0].campaign_id)
    }
  }, [filtered.length, showCreate])

  const TABS: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: campaigns.length },
    { key: 'RUNNING', label: 'Running', count: running },
    { key: 'PAUSED',  label: 'Paused',  count: paused  },
    { key: 'ENDED',   label: 'Ended',   count: ended   },
  ]

  function handleClone(src: Campaign) {
    setCloneSeed(src)
    setShowCreate(true)
    setSelectedId(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.bg }}>

      {/* ── Top header ── */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3 flex-wrap"
        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Megaphone size={16} style={{ color: C.primary, flexShrink: 0 }} />
          <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
            Promotion Manager
          </p>
        </div>

        {/* Global stats */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { label: 'Running', count: running, color: C.success, bg: C.successBg },
            { label: 'Paused',  count: paused,  color: C.warning, bg: C.warningBg },
            { label: 'Ended',   count: ended,   color: C.muted,   bg: '#f3f4f6'   },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: bg, border: `1px solid ${color}22` }}>
              <span className="text-[12px] font-bold" style={{ color, fontFamily: 'DM Sans, sans-serif' }}>
                {count} {label}
              </span>
            </div>
          ))}
          {totalSold > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: C.successBg, border: `1px solid ${C.success}22` }}>
              <ShoppingBag size={11} style={{ color: C.success }} />
              <span className="text-[12px] font-bold" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                {totalSold} sold
              </span>
            </div>
          )}
          {avgRoas != null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ ...roasColor(avgRoas), border: `1px solid ${roasColor(avgRoas).color}22` }}>
              <BarChart2 size={11} style={{ color: roasColor(avgRoas).color }} />
              <span className="text-[12px] font-bold" style={{ color: roasColor(avgRoas).color, fontFamily: 'DM Sans, sans-serif' }}>
                {avgRoas.toFixed(1)}x ROAS
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={syncNow} disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-85 disabled:opacity-60"
            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Sync
          </button>
          <button onClick={() => { setShowCreate(true); setSelectedId(null); setCloneSeed(null) }}
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

      {/* ── Split pane ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT: campaign list */}
        <div className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: 340, borderRight: `1px solid ${C.border}`, backgroundColor: C.surface }}>

          {/* Search */}
          <div className="shrink-0 px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.borderInput}` }}>
              <Search size={12} style={{ color: C.muted }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or ID…"
                className="flex-1 bg-transparent outline-none text-[12px]"
                style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
              />
              {search && <button onClick={() => setSearch('')}><X size={10} style={{ color: C.muted }} /></button>}
            </div>
          </div>

          {/* Tabs */}
          <div className="shrink-0 flex items-center gap-1 flex-wrap px-3 pb-2"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            {TABS.map(({ key, label, count }) => (
              <button key={key} onClick={() => { setActiveTab(key); setSelectedId(null) }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: activeTab === key ? C.primary : C.bg,
                  color:            activeTab === key ? '#fff'     : C.secondary,
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                {label} {count}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin" style={{ color: C.primary }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
                <Megaphone size={22} style={{ color: C.muted }} />
                <p className="text-[12px] font-semibold" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                  {campaigns.length === 0 ? 'No campaigns yet' : 'No results'}
                </p>
                {campaigns.length === 0 && (
                  <button onClick={() => setShowCreate(true)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 mt-1"
                    style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                    + New Campaign
                  </button>
                )}
              </div>
            ) : (
              filtered.map(c => (
                <CampaignRow
                  key={c.id}
                  campaign={c}
                  selected={c.campaign_id === selectedId}
                  onClick={() => { setSelectedId(c.campaign_id); setShowCreate(false); setCloneSeed(null) }}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: detail or create form */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {showCreate ? (
            <CreateCampaignForm
              key={cloneSeed?.campaign_id ?? 'new'}
              onCreated={c => {
                setCampaigns(prev => [c, ...prev])
                setShowCreate(false)
                setCloneSeed(null)
                setSelectedId(c.campaign_id)
              }}
              onCancel={() => { setShowCreate(false); setCloneSeed(null) }}
            />
          ) : selectedCampaign ? (
            <DetailPanel
              key={selectedCampaign.campaign_id}
              campaign={selectedCampaign}
              onUpdate={patchCampaign}
              onClone={handleClone}
            />
          ) : (
            <EmptyDetail onCreate={() => setShowCreate(true)} />
          )}
        </div>
      </div>
    </div>
  )
}
