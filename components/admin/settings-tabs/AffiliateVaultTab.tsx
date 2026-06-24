'use client'
// components/admin/settings-tabs/AffiliateVaultTab.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ShoppingCart, Store, Rocket, ShoppingBag,
  Network, Target, Home, Package, Zap,
  Eye, EyeOff, Copy, ShieldCheck,
  ExternalLink, Save, AlertTriangle, Check,
  RefreshCw, Info, Mouse, TrendingUp,
  ToggleLeft, ToggleRight, Globe,
} from 'lucide-react'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#0a0d08',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  bg:       '#f9fdf4',
}

interface NetworkConfig {
  key:         string
  title:       string
  icon:        React.ElementType
  previewBase: string
  apiKeyLabel: string
  signupUrl:   string
  idFormat:    string
}

interface VaultValues {
  trackingId: string
  apiKey:     string
}

const NETWORKS: NetworkConfig[] = [
  { key: 'amazon',    title: 'Amazon Associates',    icon: ShoppingCart, previewBase: 'https://amazon.com/s?tag=',              apiKeyLabel: 'PA API Key',    signupUrl: 'https://affiliate-program.amazon.com',      idFormat: 'Format: storename-20 (e.g. riazify-20)'               },
  { key: 'ebay',      title: 'eBay Partner Network', icon: Store,        previewBase: 'https://ebay.com?campid=',               apiKeyLabel: 'Campaign ID',   signupUrl: 'https://partnernetwork.ebay.com',            idFormat: 'Format: 10-digit numeric Campaign ID'                  },
  { key: 'aliexpress',title: 'AliExpress Portal',    icon: Rocket,       previewBase: 'https://s.click.aliexpress.com/e/',      apiKeyLabel: 'App Key',       signupUrl: 'https://portals.aliexpress.com',             idFormat: 'Format: alphanumeric App Key from portal'              },
  { key: 'walmart',   title: 'Walmart Affiliates',   icon: ShoppingBag,  previewBase: 'https://walmart.com?affid=',             apiKeyLabel: 'Publisher ID',  signupUrl: 'https://affiliates.walmart.com',             idFormat: 'Format: numeric Impact Publisher ID'                   },
  { key: 'cj',        title: 'CJ Dropshipping',      icon: Network,      previewBase: 'https://cjdropshipping.com?token=',      apiKeyLabel: 'API Token',     signupUrl: 'https://cjdropshipping.com',                 idFormat: 'Format: long alphanumeric token from CJ dashboard'     },
  { key: 'target',    title: 'Target Partners',      icon: Target,       previewBase: 'https://target.com?ref=',                apiKeyLabel: 'Partner ID',    signupUrl: 'https://partners.target.com',                idFormat: 'Format: numeric Impact partner ID'                     },
  { key: 'homedepot', title: 'Home Depot',           icon: Home,         previewBase: 'https://homedepot.com?tag=',             apiKeyLabel: 'Affiliate ID',  signupUrl: 'https://www.homedepot.com/c/SF_Affiliate',   idFormat: 'Format: AvantLink numeric affiliate ID'                },
  { key: 'temu',      title: 'Temu Global',          icon: Package,      previewBase: 'https://temu.com/affid=',                apiKeyLabel: 'Affiliate ID',  signupUrl: 'https://www.temu.com/affiliate',             idFormat: 'Format: numeric affiliate ID from Temu portal'         },
  { key: 'banggood',  title: 'Banggood',             icon: Globe,        previewBase: 'https://banggood.com?p=',                apiKeyLabel: 'Partner Code',  signupUrl: 'https://www.banggood.com/affiliate',         idFormat: 'Format: alphanumeric partner code from Banggood'       },
  { key: 'dhgate',    title: 'DHgate',               icon: Globe,        previewBase: 'https://dhgate.com?ref=',                apiKeyLabel: 'Affiliate ID',  signupUrl: 'https://www.dhgate.com/affiliate',           idFormat: 'Format: numeric affiliate ID from DHgate dashboard'    },
  { key: 'alibaba',   title: 'Alibaba Sourcing',     icon: Globe,        previewBase: 'https://alibaba.com?spm=',               apiKeyLabel: 'Partner ID',    signupUrl: 'https://portals.alibaba.com',                idFormat: 'Format: Alibaba partner/SPM tracking code'             },
  { key: 'etsy',      title: 'Etsy Affiliates',      icon: Globe,        previewBase: 'https://etsy.com?utm_source=',           apiKeyLabel: 'Publisher ID',  signupUrl: 'https://www.awin.com/us/advertiser/etsy',    idFormat: 'Format: AWIN numeric publisher ID'                     },
  { key: 'shein',     title: 'Shein / Sheglam',      icon: Globe,        previewBase: 'https://shein.com/?ref=',                apiKeyLabel: 'Referral ID',   signupUrl: 'https://affiliate.shein.com',                idFormat: 'Format: alphanumeric referral code from Shein portal'  },
  { key: 'autods',    title: 'AutoDS Integration',   icon: Zap,          previewBase: 'https://autods.com/register?ref=',       apiKeyLabel: 'Partner Key',   signupUrl: 'https://autods.com/partners',                idFormat: 'Format: alphanumeric partner key from AutoDS'          },
]

// ── Deployment banner ──────────────────────────────────────────
function DeploymentBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-xl flex items-center gap-3 px-4 py-3"
      style={{ backgroundColor: 'rgba(143,255,0,0.06)', border: '1px solid rgba(143,255,0,0.24)' }}
    >
      <AlertTriangle size={15} style={{ color: C.lime, flexShrink: 0 }} />
      <div className="overflow-hidden flex-1">
        <div className="whitespace-nowrap" style={{ animation: 'marquee 32s linear infinite', display: 'inline-block' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: '0.03em' }}>
            GLOBAL DEPLOYMENT PROTOCOL ACTIVE — Changes saved here instantly inject tracking IDs into every live search result across all user sessions. Verify all IDs before saving. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; GLOBAL DEPLOYMENT PROTOCOL ACTIVE — Changes saved here instantly inject tracking IDs into every live search result across all user sessions. Verify all IDs before saving.
          </span>
        </div>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } @keyframes rowSlideIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

// ── Tooltip ────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-flex items-center" style={{ marginLeft: 4 }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="flex items-center justify-center"
        style={{ color: C.muted, lineHeight: 1 }}
      >
        <Info size={12} />
      </button>
      {show && (
        <div
          className="absolute z-50 rounded-lg px-3 py-2 shadow-lg"
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 6,
            backgroundColor: C.dark,
            border: '1px solid rgba(143,255,0,0.2)',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.85)',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>
      )}
    </div>
  )
}

// ── Table row ──────────────────────────────────────────────────
function TableRow({
  network, index, trackingId, apiKey, onTrackingChange, onApiKeyChange, onSave, isSaving, saveSuccess, testMode, fallbackTag,
}: {
  network:          NetworkConfig
  index:            number
  trackingId:       string
  apiKey:           string
  onTrackingChange: (v: string) => void
  onApiKeyChange:   (v: string) => void
  onSave:           () => void
  isSaving:         boolean
  saveSuccess:      boolean
  testMode:         boolean
  fallbackTag:      string
}) {
  const [showApiKey,  setShowApiKey]  = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [testLoading, setTestLoading] = useState(false)

  const Icon           = network.icon
  const effectiveTag   = trackingId.trim() && trackingId.trim().toLowerCase() !== 'empty'
                          ? trackingId.trim()
                          : fallbackTag.trim() || null
  const isConnected    = !!effectiveTag
  const isUsingFallback = isConnected && (!trackingId.trim() || trackingId.trim().toLowerCase() === 'empty') && !!fallbackTag.trim()
  const livePreview    = effectiveTag
                          ? `${network.previewBase}${effectiveTag}${testMode ? '&rztest=1' : ''}`
                          : null

  function handleCopy() {
    if (!livePreview) return
    navigator.clipboard.writeText(livePreview)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleTest() {
    if (!livePreview) return
    setTestLoading(true)
    setTimeout(() => { window.open(livePreview, '_blank', 'noopener,noreferrer'); setTestLoading(false) }, 500)
  }

  const tdStyle: React.CSSProperties = {
    padding: '13px 16px',
    borderBottom: `1px solid ${C.border}`,
    verticalAlign: 'middle',
  }

  return (
    <tr
      className="group hover:bg-[#f9fdf4] transition-colors"
      style={{
        backgroundColor: C.surface,
        animation: 'rowSlideIn 0.35s ease both',
        animationDelay: `${index * 45}ms`,
        opacity: 0,
      }}
    >

      {/* Network */}
      <td style={tdStyle}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.dark }}>
            <Icon size={15} style={{ color: C.lime }} />
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, whiteSpace: 'nowrap' }}>
            {network.title}
          </span>
        </div>
      </td>

      {/* Status */}
      <td style={tdStyle}>
        <div className="flex flex-col gap-1">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: isConnected ? 'rgba(143,255,0,0.1)' : 'rgba(138,158,120,0.08)',
              border: `1px solid ${isConnected ? 'rgba(143,255,0,0.3)' : C.border}`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isConnected ? C.lime : C.muted, boxShadow: isConnected ? `0 0 5px ${C.lime}` : 'none' }}
            />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: isConnected ? C.limeDeep : C.muted, letterSpacing: '0.05em' }}>
              {isConnected ? 'LIVE' : 'NOT SET'}
            </span>
          </div>
          {isUsingFallback && (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, color: '#b07700' }}>
              using fallback
            </span>
          )}
          {testMode && isConnected && (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, color: '#6366f1' }}>
              test mode
            </span>
          )}
        </div>
      </td>

      {/* Tracking ID */}
      <td style={tdStyle}>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={trackingId}
            onChange={e => onTrackingChange(e.target.value)}
            placeholder={network.idFormat.split('(')[0].replace('Format: ', '').trim()}
            className="h-9 px-3 rounded-lg outline-none transition-all"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              color: C.dark, backgroundColor: C.bg, border: `1px solid ${C.border}`,
              minWidth: 140, width: '100%',
            }}
            onFocus={e => { e.target.style.borderColor = C.lime }}
            onBlur={e  => { e.target.style.borderColor = C.border }}
          />
          <Tooltip text={network.idFormat} />
        </div>
      </td>

      {/* API Key */}
      <td style={tdStyle}>
        <div className="relative" style={{ minWidth: 160 }}>
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => onApiKeyChange(e.target.value)}
            placeholder={network.apiKeyLabel}
            className="h-9 px-3 pr-9 rounded-lg outline-none transition-all w-full"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              color: C.dark, backgroundColor: C.bg, border: `1px solid ${C.border}`,
            }}
            onFocus={e => { e.target.style.borderColor = C.lime }}
            onBlur={e  => { e.target.style.borderColor = C.border }}
          />
          <button
            onClick={() => setShowApiKey(s => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          >
            {showApiKey
              ? <EyeOff size={13} style={{ color: C.muted }} />
              : <Eye    size={13} style={{ color: C.muted }} />
            }
          </button>
        </div>
      </td>

      {/* Live Preview */}
      <td style={tdStyle}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.15)', minWidth: 220 }}
        >
          <span
            className="flex-1 truncate"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, color: livePreview ? C.lime : 'rgba(255,255,255,0.25)' }}
          >
            {livePreview ?? `${network.previewBase}...`}
          </span>
          <button onClick={handleCopy} className="shrink-0 hover:opacity-70 transition-opacity">
            {copied
              ? <Check size={12} style={{ color: C.lime }} />
              : <Copy  size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
            }
          </button>
        </div>
      </td>

      {/* Actions */}
      <td style={tdStyle}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={!livePreview || testLoading}
            title="Test link"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, opacity: livePreview ? 1 : 0.4, cursor: livePreview ? 'pointer' : 'not-allowed' }}
          >
            {testLoading
              ? <RefreshCw size={13} className="animate-spin" style={{ color: C.muted }} />
              : <ExternalLink size={13} style={{ color: C.muted }} />
            }
          </button>

          <a
            href={network.signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Sign up"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
          >
            <Store size={13} style={{ color: C.muted }} />
          </a>

          <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg transition-all"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
              color: C.dark,
              backgroundColor: saveSuccess ? C.limeDeep : C.lime,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.8 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {isSaving ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : saveSuccess ? (
              <Check size={12} />
            ) : (
              <Save size={12} />
            )}
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save'}
          </button>
        </div>
      </td>

    </tr>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function AffiliateVaultTab() {
  const supabase = createClient()

  const [values,         setValues]         = useState<Record<string, VaultValues>>(
    Object.fromEntries(NETWORKS.map(n => [n.key, { trackingId: '', apiKey: '' }]))
  )
  const [saving,         setSaving]         = useState<Record<string, boolean>>({})
  const [saveSuccess,    setSaveSuccess]    = useState<Record<string, boolean>>({})
  const [lastSync,       setLastSync]       = useState('Not synced')
  const [connectedCount, setConnectedCount] = useState(0)
  const [fallbackTag,    setFallbackTag]    = useState('')
  const [testMode,       setTestMode]       = useState(false)
  const [savingFallback, setSavingFallback] = useState(false)
  const [fallbackSaved,  setFallbackSaved]  = useState(false)

  // Mock click stats — replace with real DB query when click tracking is built
  const totalClicks   = 1420
  const estRevenue    = 142.50

  useEffect(() => { loadVault() }, [])

  async function loadVault() {
    try {
      const affiliateKeys = [
        ...NETWORKS.map(n => `${n.key}_affiliate`),
        'affiliate_fallback',
      ]
      const { data: rows } = await (supabase.from('api_fleet_config') as any)
        .select('platform_name, primary_key_1, primary_key_2')
        .in('platform_name', affiliateKeys)

      if (rows && rows.length > 0) {
        const newVals: Record<string, VaultValues> = Object.fromEntries(NETWORKS.map(n => [n.key, { trackingId: '', apiKey: '' }]))
        for (const row of rows) {
          if (row.platform_name === 'affiliate_fallback') {
            setFallbackTag(row.primary_key_1 ?? '')
          } else {
            const key = row.platform_name.replace('_affiliate', '')
            if (newVals[key] !== undefined) {
              newVals[key] = { trackingId: row.primary_key_1 ?? '', apiKey: row.primary_key_2 ?? '' }
            }
          }
        }
        setValues(newVals)
        setConnectedCount(Object.values(newVals).filter(v => v.trackingId.trim().length > 0 && v.trackingId.trim().toLowerCase() !== 'empty').length)
      }
      setLastSync(new Date().toLocaleTimeString())
    } catch (e) { console.error('[AffiliateVault] Load error:', e) }
  }

  async function saveNetwork(key: string) {
    setSaving(s => ({ ...s, [key]: true }))
    try {
      await (supabase.from('api_fleet_config') as any).upsert({
        platform_name: `${key}_affiliate`,
        primary_key_1: values[key].trackingId.trim(),
        primary_key_2: values[key].apiKey.trim(),
        status:        values[key].trackingId.trim() ? 'connected' : 'disconnected',
      }, { onConflict: 'platform_name' })
      setLastSync(new Date().toLocaleTimeString())
      setConnectedCount(Object.values({ ...values, [key]: values[key] }).filter(v => v.trackingId.trim().length > 0 && v.trackingId.trim().toLowerCase() !== 'empty').length)
      setSaveSuccess(s => ({ ...s, [key]: true }))
      setTimeout(() => setSaveSuccess(s => ({ ...s, [key]: false })), 2500)
    } catch (e) { console.error('[AffiliateVault] Save error:', e) }
    setSaving(s => ({ ...s, [key]: false }))
  }

  async function saveFallbackTag() {
    setSavingFallback(true)
    try {
      await (supabase.from('api_fleet_config') as any).upsert({
        platform_name: 'affiliate_fallback',
        primary_key_1: fallbackTag.trim(),
        status:        fallbackTag.trim() ? 'connected' : 'disconnected',
      }, { onConflict: 'platform_name' })
      setFallbackSaved(true)
      setTimeout(() => setFallbackSaved(false), 2500)
    } catch (e) { console.error('[AffiliateVault] Fallback save error:', e) }
    setSavingFallback(false)
  }

  function setTrackingId(key: string, val: string) { setValues(v => ({ ...v, [key]: { ...v[key], trackingId: val } })) }
  function setApiKey(key: string, val: string)     { setValues(v => ({ ...v, [key]: { ...v[key], apiKey: val } })) }

  // Table renders immediately — data fills in after single fetch

  const missingCount = NETWORKS.length - connectedCount
  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    color: C.muted,
    letterSpacing: '0.08em',
    textAlign: 'left',
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: C.bg,
    whiteSpace: 'nowrap',
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-8 w-full" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime, boxShadow: `0 0 8px ${C.lime}` }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>
              {connectedCount} of {NETWORKS.length} networks live
            </span>
            {missingCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#b07700', backgroundColor: '#fefce8', border: '1px solid #fbbf24', borderRadius: 6, padding: '1px 8px' }}>
                {missingCount} missing — revenue at risk
              </span>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Test mode toggle */}
          <button
            onClick={() => setTestMode(t => !t)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
              backgroundColor: testMode ? 'rgba(99,102,241,0.1)' : C.bg,
              border: `1px solid ${testMode ? '#6366f1' : C.border}`,
              color: testMode ? '#6366f1' : C.muted,
            }}
          >
            {testMode
              ? <ToggleRight size={16} style={{ color: '#6366f1' }} />
              : <ToggleLeft  size={16} style={{ color: C.muted }} />
            }
            Test Links Mode
          </button>

          {/* Vault last sync badge */}
          <div className="flex flex-col items-end px-4 py-2.5 rounded-xl" style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.2)' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(143,255,0,0.6)', letterSpacing: '0.12em' }}>VAULT LAST SYNC</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>{lastSync}</span>
          </div>
        </div>
      </div>

      {/* ── Deployment banner ── */}
      <DeploymentBanner />

      {/* ── Stats row — 4 cards ── */}
      <div className="grid grid-cols-4 gap-4">

        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', marginBottom: 4 }}>NETWORKS CONFIGURED</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{connectedCount}</p>
        </div>

        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', marginBottom: 4 }}>TOTAL PLATFORMS</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{NETWORKS.length}</p>
        </div>

        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', marginBottom: 4 }}>REVENUE CHANNELS</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{connectedCount > 0 ? 'LIVE' : 'IDLE'}</p>
        </div>

        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Mouse size={13} style={{ color: C.lime }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.08em' }}>MONETIZED CLICKS</p>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{totalClicks.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={11} style={{ color: C.limeDeep }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.limeDeep }}>+${estRevenue.toFixed(2)} Est. Bounty</span>
          </div>
        </div>

      </div>

      {/* ── Global Fallback Tag ── */}
      <div
        className="rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <ShieldCheck size={16} style={{ color: C.lime }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: C.dark }}>
            Global Fallback Tag
          </span>
          <Tooltip text="Used automatically when a network has no tracking ID set. Prevents lost commissions." />
        </div>
        <div className="flex-1" style={{ minWidth: 200 }}>
          <input
            type="text"
            value={fallbackTag}
            onChange={e => setFallbackTag(e.target.value)}
            placeholder="e.g. riazify-20 (Amazon/eBay fallback tag)"
            className="w-full h-9 px-3 rounded-lg outline-none transition-all"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              color: C.dark, backgroundColor: C.bg, border: `1px solid ${C.border}`,
            }}
            onFocus={e => { e.target.style.borderColor = C.lime }}
            onBlur={e  => { e.target.style.borderColor = C.border }}
          />
        </div>
        <button
          onClick={saveFallbackTag}
          disabled={savingFallback}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg transition-all shrink-0"
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
            color: C.dark,
            backgroundColor: fallbackSaved ? C.limeDeep : C.lime,
            cursor: savingFallback ? 'not-allowed' : 'pointer',
          }}
        >
          {savingFallback ? <RefreshCw size={13} className="animate-spin" /> : fallbackSaved ? <Check size={13} /> : <Save size={13} />}
          {savingFallback ? 'Saving...' : fallbackSaved ? 'Saved' : 'Save Fallback'}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        <div className="overflow-x-auto w-full">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>NETWORK</th>
                <th style={thStyle}>STATUS</th>
                <th style={thStyle}>
                  <div className="flex items-center gap-1">
                    TRACKING ID / TAG
                    <Tooltip text="Hover the info icon on each row for the exact format required by that network." />
                  </div>
                </th>
                <th style={thStyle}>API KEY</th>
                <th style={thStyle}>LIVE PREVIEW URL</th>
                <th style={thStyle}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {NETWORKS.map((network, index) => (
                <TableRow
                  key={network.key}
                  network={network}
                  index={index}
                  trackingId={values[network.key].trackingId}
                  apiKey={values[network.key].apiKey}
                  onTrackingChange={v => setTrackingId(network.key, v)}
                  onApiKeyChange={v => setApiKey(network.key, v)}
                  onSave={() => saveNetwork(network.key)}
                  isSaving={saving[network.key] ?? false}
                  saveSuccess={saveSuccess[network.key] ?? false}
                  testMode={testMode}
                  fallbackTag={fallbackTag}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Live summary ── */}
      {connectedCount > 0 && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ backgroundColor: 'rgba(143,255,0,0.06)', border: '1px solid rgba(143,255,0,0.2)' }}>
          <ShieldCheck size={18} style={{ color: C.lime, flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>
            {connectedCount} affiliate network{connectedCount > 1 ? 's are' : ' is'} live. Tracking IDs are being injected into product search results in real time.
            {testMode && <span style={{ color: '#6366f1', marginLeft: 8 }}>{'Test mode active — all links include &rztest=1 parameter.'}</span>}
          </p>
        </div>
      )}

    </div>
  )
}