'use client'
// app/dashboard/promotions/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Promotion Manager
// Split-pane layout: left = campaign list, right = campaign detail + create
// Supports: Promoted Listings Standard (CPS) and Priority (CPC)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, Plus, Megaphone, Loader2, X, ChevronRight,
  TrendingUp, Zap, Play, Pause, Square, AlertCircle,
  CheckCircle2, Package, BarChart2, DollarSign, Tag,
  ExternalLink, Info,
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
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface Campaign {
  id:             string
  campaign_id:    string
  campaign_name:  string
  campaign_type:  'PROMOTED_LISTINGS' | 'PROMOTED_LISTINGS_PRIORITY'
  funding_model:  'COST_PER_SALE' | 'COST_PER_CLICK'
  status:         'RUNNING' | 'PAUSED' | 'ENDED'
  bid_percentage: number | null
  daily_budget:   number | null
  marketplace_id: string
  start_date:     string | null
  end_date:       string | null
  ad_count:       number
  created_at:     string
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

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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

// ── Campaign row (left list) ───────────────────────────────────────────────────
function CampaignRow({ campaign, selected, onClick }: {
  campaign: Campaign
  selected: boolean
  onClick: () => void
}) {
  const sc  = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.ENDED
  const tc  = TYPE_CONFIG[campaign.campaign_type] ?? TYPE_CONFIG.PROMOTED_LISTINGS
  const ScIcon = sc.icon
  const TcIcon = tc.icon

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

        {/* Type + bid/budget */}
        <p className="text-[11px] truncate" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
          {tc.label}
          {campaign.bid_percentage  ? ` · ${campaign.bid_percentage}% ad rate` : ''}
          {campaign.daily_budget    ? ` · $${campaign.daily_budget}/day` : ''}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
            style={{ backgroundColor: sc.bg, color: sc.color }}>
            {sc.label}
          </span>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}` }}>
            <Package size={7} /> {campaign.ad_count} listing{campaign.ad_count !== 1 ? 's' : ''}
          </span>
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
  onCancel: () => void
}) {
  const [name,         setName]         = useState('')
  const [type,         setType]         = useState<'PROMOTED_LISTINGS' | 'PROMOTED_LISTINGS_PRIORITY'>('PROMOTED_LISTINGS')
  const [bidPct,       setBidPct]       = useState('5')
  const [dailyBudget,  setDailyBudget]  = useState('10')
  const [saving,       setSaving]       = useState(false)
  const [err,          setErr]          = useState<string | null>(null)

  async function submit() {
    if (!name.trim()) { setErr('Campaign name is required'); return }
    setSaving(true); setErr(null)
    try {
      const res = await fetch('/api/ebay/promotions/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          bidPercentage: type === 'PROMOTED_LISTINGS'          ? bidPct       : undefined,
          dailyBudget:   type === 'PROMOTED_LISTINGS_PRIORITY' ? dailyBudget  : undefined,
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

  return (
    <div className="flex flex-col gap-4 p-6" style={{ borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
          New Campaign
        </p>
        <button onClick={onCancel}><X size={14} style={{ color: C.muted }} /></button>
      </div>

      {/* Campaign type selector */}
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

      {/* Name */}
      <div>
        <label style={labelStyle}>Campaign Name</label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Summer Electronics PLS"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = C.primary)}
          onBlur={e => (e.target.style.borderColor = C.borderInput)}
        />
      </div>

      {/* Bid % or daily budget */}
      {type === 'PROMOTED_LISTINGS' ? (
        <div>
          <label style={labelStyle}>Ad Rate (% of sale price)</label>
          <div className="flex items-center gap-2">
            <input value={bidPct} onChange={e => setBidPct(e.target.value)}
              type="number" min="1" max="20" step="0.1"
              style={{ ...inputStyle, width: 100 }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.borderInput)}
            />
            <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
              % · eBay suggests trending rate
            </span>
          </div>
        </div>
      ) : (
        <div>
          <label style={labelStyle}>Daily Budget (USD)</label>
          <div className="flex items-center gap-2">
            <input value={dailyBudget} onChange={e => setDailyBudget(e.target.value)}
              type="number" min="1" step="1"
              style={{ ...inputStyle, width: 100 }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.borderInput)}
            />
            <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
              USD / day
            </span>
          </div>
        </div>
      )}

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

      <div className="flex gap-2">
        <button onClick={submit} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          {saving ? 'Creating…' : 'Create Campaign'}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
          style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
          Cancel
        </button>
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
        method: 'POST',
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
      setListingId('')
      setListingTitle('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      setErr(e.message)
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${C.borderInput}`, borderRadius: 10,
    padding: '7px 10px', backgroundColor: C.surface, color: C.body,
    fontFamily: 'DM Sans, sans-serif', fontSize: 12, outline: 'none',
    flex: 1,
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
        Enroll a Listing
      </p>
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
      {err && <p className="text-[10px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{err}</p>}
      {success && (
        <p className="text-[10px] flex items-center gap-1" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
          <CheckCircle2 size={9} /> Listing enrolled in campaign!
        </p>
      )}
    </div>
  )
}

// ── Right detail panel ─────────────────────────────────────────────────────────
function DetailPanel({ campaign, onUpdate }: {
  campaign: Campaign
  onUpdate: (id: string, updates: Partial<Campaign>) => void
}) {
  const [ads,          setAds]          = useState<Ad[]>([])
  const [loadingAds,   setLoadingAds]   = useState(true)
  const [acting,       setActing]       = useState(false)
  const [actErr,       setActErr]       = useState<string | null>(null)
  const [actSuccess,   setActSuccess]   = useState<string | null>(null)

  const sc  = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.ENDED
  const tc  = TYPE_CONFIG[campaign.campaign_type] ?? TYPE_CONFIG.PROMOTED_LISTINGS
  const TcIcon = tc.icon

  // Load ads for this campaign
  async function loadAds() {
    setLoadingAds(true)
    try {
      const res = await fetch(`/api/ebay/promotions/campaigns?refresh=0`)
      // load ads from local
      const res2 = await fetch(`/api/ebay/promotions/ads?campaignId=${campaign.campaign_id}`)
      if (res2.ok) {
        const json = await res2.json()
        setAds(json.ads ?? [])
      }
    } catch { /* ignore */ }
    setLoadingAds(false)
  }

  useEffect(() => { loadAds() }, [campaign.campaign_id])

  async function doAction(action: 'end' | 'pause' | 'resume') {
    setActing(true); setActErr(null); setActSuccess(null)
    try {
      const res = await fetch('/api/ebay/promotions/campaigns/end', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaign_id, action }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      onUpdate(campaign.campaign_id, { status: json.status })
      setActSuccess(`Campaign ${action === 'end' ? 'ended' : action === 'pause' ? 'paused' : 'resumed'}`)
      setTimeout(() => setActSuccess(null), 3000)
    } catch (e: any) {
      setActErr(e.message)
    }
    setActing(false)
  }

  async function unenroll(ad: Ad) {
    try {
      const res = await fetch('/api/ebay/promotions/enroll', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaign_id, listingId: ad.listing_id }),
      })
      if (res.ok) setAds(prev => prev.filter(a => a.listing_id !== ad.listing_id))
    } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.surface }}>

      {/* Header */}
      <div className="shrink-0 px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: tc.bg, color: tc.color }}>
            <TcIcon size={10} /> {tc.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: sc.bg, color: sc.color }}>
            {campaign.status}
          </span>
          <span className="ml-auto text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
            Started {fmtDate(campaign.start_date)}
          </span>
        </div>

        <p className="text-[16px] font-bold mb-1" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
          {campaign.campaign_name}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-2">
          {campaign.bid_percentage != null && (
            <div className="flex items-center gap-1">
              <BarChart2 size={11} style={{ color: C.primary }} />
              <span className="text-[11px] font-semibold" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                {campaign.bid_percentage}% ad rate
              </span>
            </div>
          )}
          {campaign.daily_budget != null && (
            <div className="flex items-center gap-1">
              <DollarSign size={11} style={{ color: C.warning }} />
              <span className="text-[11px] font-semibold" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                ${campaign.daily_budget}/day budget
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Package size={11} style={{ color: C.secondary }} />
            <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
              {campaign.ad_count} listing{campaign.ad_count !== 1 ? 's' : ''}
            </span>
          </div>
          <a href={`https://www.ebay.com/sh/mkt/promotions`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 ml-auto"
            style={{ color: C.primary, textDecoration: 'none' }}>
            <ExternalLink size={10} />
            <span className="text-[10px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>View on eBay</span>
          </a>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        {/* Actions */}
        {campaign.status !== 'ENDED' && (
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
              Campaign Actions
            </p>
            <div className="flex gap-2 flex-wrap">
              {campaign.status === 'RUNNING' && (
                <button onClick={() => doAction('pause')} disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: C.warningBg, color: C.warning, border: `1px solid #fcd34d`, fontFamily: 'DM Sans, sans-serif' }}>
                  {acting ? <Loader2 size={10} className="animate-spin" /> : <Pause size={10} />}
                  Pause Campaign
                </button>
              )}
              {campaign.status === 'PAUSED' && (
                <button onClick={() => doAction('resume')} disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: C.successBg, color: C.success, border: `1px solid #86efac`, fontFamily: 'DM Sans, sans-serif' }}>
                  {acting ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                  Resume Campaign
                </button>
              )}
              <button onClick={() => doAction('end')} disabled={acting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: C.dangerBg, color: C.danger, border: `1px solid #fca5a5`, fontFamily: 'DM Sans, sans-serif' }}>
                {acting ? <Loader2 size={10} className="animate-spin" /> : <Square size={10} />}
                End Campaign
              </button>
            </div>
            {actErr && <p className="text-[10px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{actErr}</p>}
            {actSuccess && <p className="text-[10px]" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>✓ {actSuccess}</p>}
          </div>
        )}

        {/* Enroll listing (only for active/paused CPS campaigns) */}
        {campaign.status !== 'ENDED' && campaign.campaign_type === 'PROMOTED_LISTINGS' && (
          <div className="flex flex-col gap-2 p-4 rounded-2xl"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
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

        {/* Enrolled listings */}
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
            Enrolled Listings ({ads.length})
          </p>

          {loadingAds ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin" style={{ color: C.primary }} />
              <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Loading ads…</span>
            </div>
          ) : ads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 rounded-2xl"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <Tag size={20} style={{ color: C.muted }} />
              <p className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                No listings enrolled yet
              </p>
              <p className="text-[10px] text-center px-4" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                Use the form above or sync from eBay to see enrolled listings
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {ads.map(ad => (
                <div key={ad.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate"
                      style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                      {ad.listing_title ?? `Item #${ad.listing_id}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        ID: {ad.listing_id}
                      </span>
                      {ad.bid_percentage && (
                        <span className="text-[9px] font-semibold" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                          {ad.bid_percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a href={`https://www.ebay.com/itm/${ad.listing_id}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: C.primary }}>
                      <ExternalLink size={10} />
                    </a>
                    {campaign.status !== 'ENDED' && (
                      <button onClick={() => unenroll(ad)}
                        className="transition-all hover:opacity-70"
                        title="Remove from campaign">
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
    <div className="flex flex-col items-center justify-center h-full gap-4"
      style={{ backgroundColor: C.surface }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: C.primaryLight }}>
        <Megaphone size={28} style={{ color: C.primary }} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold mb-1" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
          Manage Promoted Listings
        </p>
        <p className="text-[12px] mb-4 max-w-xs" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
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
      const res = await fetch('/api/ebay/promotions/sync', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        if (json.scopeError) {
          setSyncMsg('⚠️ Marketing scope not granted. Reconnect your eBay account in Settings → eBay Manager.')
        } else {
          throw new Error(json.error ?? 'Sync failed')
        }
      } else {
        setSyncMsg(`✅ Synced ${json.campaigns} campaign${json.campaigns !== 1 ? 's' : ''}, ${json.ads} ad${json.ads !== 1 ? 's' : ''}`)
        await load()
      }
    } catch (e: any) {
      setSyncMsg(`❌ ${e.message}`)
    }
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

  // Filter
  const filtered = campaigns.filter(c =>
    activeTab === 'all' ? true : c.status === activeTab
  )

  const selectedCampaign = campaigns.find(c => c.campaign_id === selectedId) ?? null

  // Auto-select first
  useEffect(() => {
    if (!selectedId && filtered.length > 0) {
      setSelectedId(filtered[0].campaign_id)
    }
  }, [filtered.length])

  const TABS: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: campaigns.length },
    { key: 'RUNNING', label: 'Running', count: running },
    { key: 'PAUSED',  label: 'Paused',  count: paused  },
    { key: 'ENDED',   label: 'Ended',   count: ended   },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.bg }}>

      {/* Top header */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3 flex-wrap"
        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Megaphone size={16} style={{ color: C.primary, flexShrink: 0 }} />
          <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
            Promotion Manager
          </p>
        </div>

        {/* KPI chips */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { label: 'Running', count: running, color: C.success, bg: C.successBg  },
            { label: 'Paused',  count: paused,  color: C.warning, bg: C.warningBg  },
            { label: 'Ended',   count: ended,   color: C.muted,   bg: '#f3f4f6'    },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: bg, border: `1px solid ${color}22` }}>
              <span className="text-[12px] font-bold" style={{ color, fontFamily: 'DM Sans, sans-serif' }}>
                {count} {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={syncNow} disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-85 disabled:opacity-60"
            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Sync
          </button>
          <button onClick={() => { setShowCreate(true); setSelectedId(null) }}
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

      {/* Split pane */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT: campaign list */}
        <div className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: 340, borderRight: `1px solid ${C.border}`, backgroundColor: C.surface }}>

          {/* Tabs */}
          <div className="shrink-0 flex items-center gap-1 flex-wrap px-3 pt-3 pb-2"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            {TABS.map(({ key, label, count }) => (
              <button key={key} onClick={() => { setActiveTab(key); setSelectedId(null) }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: activeTab === key ? C.primary : C.bg,
                  color: activeTab === key ? '#fff' : C.secondary,
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
                  onClick={() => { setSelectedId(c.campaign_id); setShowCreate(false) }}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: detail or create form */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {showCreate ? (
            <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: C.surface }}>
              <CreateCampaignForm
                onCreated={c => {
                  setCampaigns(prev => [c, ...prev])
                  setSelectedId(c.campaign_id)
                  setShowCreate(false)
                }}
                onCancel={() => setShowCreate(false)}
              />
            </div>
          ) : selectedCampaign ? (
            <DetailPanel
              key={selectedCampaign.campaign_id}
              campaign={selectedCampaign}
              onUpdate={patchCampaign}
            />
          ) : (
            <EmptyDetail onCreate={() => setShowCreate(true)} />
          )}
        </div>
      </div>
    </div>
  )
}
