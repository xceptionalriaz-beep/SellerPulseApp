'use client'
// app/dashboard/profile/tabs/EbayManagerTab.tsx
// Converted from: lib/user_profile/tabs/ebay_manager_tab.dart
//
// Sections (same as Dart):
//   - NOT CONNECTED: marketplace pills, feature grid, locked stats, connect CTA
//   - CONNECTED: dark gradient card, stats, sync button, sync history
//   - Coming Soon: Amazon, Shopify, Walmart, Etsy

import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingBag, Link, Link2Off, RefreshCw,
  Shield, Bell, TrendingUp, Key, History,
  CheckCircle, AlertTriangle, Clock, Lock,
  ShoppingCart, Store, Warehouse, Scissors,
} from 'lucide-react'
import Spinner, { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'

// â”€â”€ Color tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  lime:    '#8fff00',
  limeD:   '#4a8f00',
  limeTint:'#f4ffe6',
  dark:    '#0a0d08',
  border:  '#e8ede2',
  muted:   '#8a9e78',
  surface: '#ffffff',
  bg:      '#f9fdf4',
  navy:    '#0a0d08',
  accent:  '#8fff00',
  txt1:    '#0a0d08',
  txt2:    '#8a9e78',
  txt3:    '#8a9e78',
  green:   '#00C48C',
  orange:  '#FFB800',
  red:     '#FF4D6A',
  blue:    '#1D70F5',
}

// â”€â”€ Marketplaces (matches Dart kEbayMarketplaces) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MARKETPLACES = [
  { id: 'EBAY_US', code: 'us', label: 'United States',  currencyCode: 'USD', currencySymbol: '$',   signatureThreshold: 750,   siteId: 0   },
  { id: 'EBAY_UK', code: 'gb', label: 'United Kingdom', currencyCode: 'GBP', currencySymbol: 'Â£',   signatureThreshold: 450,   siteId: 3   },
  { id: 'EBAY_DE', code: 'de', label: 'Germany',        currencyCode: 'EUR', currencySymbol: 'â‚¬',   signatureThreshold: 600,   siteId: 77  },
  { id: 'EBAY_AU', code: 'au', label: 'Australia',      currencyCode: 'AUD', currencySymbol: 'A$',  signatureThreshold: 900,   siteId: 15  },
  { id: 'EBAY_CA', code: 'ca', label: 'Canada',         currencyCode: 'CAD', currencySymbol: 'C$',  signatureThreshold: 800,   siteId: 2   },
  { id: 'EBAY_FR', code: 'fr', label: 'France',         currencyCode: 'EUR', currencySymbol: 'â‚¬',   signatureThreshold: 600,   siteId: 71  },
  { id: 'EBAY_IT', code: 'it', label: 'Italy',          currencyCode: 'EUR', currencySymbol: 'â‚¬',   signatureThreshold: 600,   siteId: 101 },
  { id: 'EBAY_ES', code: 'es', label: 'Spain',          currencyCode: 'EUR', currencySymbol: 'â‚¬',   signatureThreshold: 600,   siteId: 186 },
  { id: 'EBAY_IE', code: 'ie', label: 'Ireland',        currencyCode: 'EUR', currencySymbol: 'â‚¬',   signatureThreshold: 600,   siteId: 205 },
  { id: 'EBAY_NL', code: 'nl', label: 'Netherlands',    currencyCode: 'EUR', currencySymbol: 'â‚¬',   signatureThreshold: 600,   siteId: 146 },
  { id: 'EBAY_AT', code: 'at', label: 'Austria',        currencyCode: 'EUR', currencySymbol: 'â‚¬',   signatureThreshold: 600,   siteId: 16  },
  { id: 'EBAY_BE', code: 'be', label: 'Belgium',        currencyCode: 'EUR', currencySymbol: 'â‚¬',   signatureThreshold: 600,   siteId: 123 },
  { id: 'EBAY_CH', code: 'ch', label: 'Switzerland',    currencyCode: 'CHF', currencySymbol: 'CHF', signatureThreshold: 600,   siteId: 193 },
  { id: 'EBAY_PL', code: 'pl', label: 'Poland',         currencyCode: 'PLN', currencySymbol: 'zÅ‚',  signatureThreshold: 2000,  siteId: 212 },
  { id: 'EBAY_HK', code: 'hk', label: 'Hong Kong',      currencyCode: 'HKD', currencySymbol: 'HK$', signatureThreshold: 5000,  siteId: 201 },
  { id: 'EBAY_SG', code: 'sg', label: 'Singapore',      currencyCode: 'SGD', currencySymbol: 'S$',  signatureThreshold: 1000,  siteId: 216 },
  { id: 'EBAY_MY', code: 'my', label: 'Malaysia',       currencyCode: 'MYR', currencySymbol: 'RM',  signatureThreshold: 3000,  siteId: 207 },
  { id: 'EBAY_PH', code: 'ph', label: 'Philippines',    currencyCode: 'PHP', currencySymbol: 'â‚±',   signatureThreshold: 40000, siteId: 211 },
  { id: 'EBAY_IN', code: 'in', label: 'India',          currencyCode: 'INR', currencySymbol: 'â‚¹',   signatureThreshold: 60000, siteId: 203 },
]

// Flag image component using flagcdn.com (works on all browsers including Windows)
function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w${size}/${code}.png`}
      width={size}
      height={size * 0.75}
      alt={code}
      className="rounded-sm object-cover inline-block"
      style={{ minWidth: size }}
    />
  )
}

type Marketplace = typeof MARKETPLACES[0]

// â”€â”€ Coming soon platforms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PLATFORMS = [
  { name: 'Amazon Seller', icon: ShoppingCart, color: '#FF9900', feature: 'FBA inventory sync'      },
  { name: 'Shopify',       icon: Store,        color: '#96BF48', feature: 'Multi-store management'  },
  { name: 'Walmart',       icon: Warehouse,    color: '#0071DC', feature: 'Marketplace analytics'   },
  { name: 'Etsy',          icon: Scissors,     color: '#F56400', feature: 'Handmade item tracking'  },
]

// â”€â”€ Info pill (matches Dart _infoPill) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function InfoPill({ icon: Icon, text, color }: { icon: React.ElementType; text: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border"
          style={{ backgroundColor: color + '14', borderColor: color + '33', color }}>
      <Icon size={10} />{text}
    </span>
  )
}

// â”€â”€ Feature row (matches Dart _featureRow) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FeatureRow({ icon: Icon, text, color }: { icon: React.ElementType; text: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '1A' }}>
        <Icon size={15} style={{ color }} />
      </div>
      <span className="text-[13px] font-medium" style={{ color: C.txt1 }}>{text}</span>
    </div>
  )
}

// â”€â”€ Dark stat card (matches Dart _darkStat) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DarkStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex-1 p-3 rounded-xl border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
      <Icon size={13} style={{ color }} />
      <p className="text-[14px] font-bold text-white mt-1.5 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{value}</p>
      <p className="text-[9px] text-gray-400 mt-0.5 truncate">{label}</p>
    </div>
  )
}

// â”€â”€ Warning banner (matches Dart _warningBanner) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function WarningBanner({ icon: Icon, color, message, action, onTap }: {
  icon: React.ElementType; color: string; message: string; action: string; onTap: () => void
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border mb-5"
         style={{ backgroundColor: color + '1F', borderColor: color + '4D' }}>
      <Icon size={15} style={{ color }} />
      <p className="flex-1 text-[12px] font-medium" style={{ color }}>{message}</p>
      <button onClick={onTap} className="text-[12px] font-bold shrink-0 hover:underline" style={{ color }}>{action}</button>
    </div>
  )
}

// â”€â”€ Coming soon card (matches Dart _comingSoonCard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ComingSoonCard({ name, icon: Icon, color, feature }: { name: string; icon: React.ElementType; color: string; feature: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white" style={{ borderColor: C.border }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '1A' }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate" style={{ color: C.txt1 }}>{name}</p>
        <p className="text-[10px] truncate" style={{ color: C.txt3 }}>{feature}</p>
      </div>
      <span className="px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0"
            style={{ backgroundColor: '#F1F5F9', color: C.txt3 }}>Soon</span>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function EbayManagerTab() {
  const supabase = createClient()
  const toast    = useToast()

  const [isLoading,    setIsLoading]    = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing,    setIsSyncing]    = useState(false)
  const [connected,    setConnected]    = useState(false)
  const [connData,     setConnData]     = useState<any>(null)
  const [syncHistory,  setSyncHistory]  = useState<any[]>([])
  const [safeBuyerPct, setSafeBuyerPct] = useState(0)
  const [selectedMp,   setSelectedMp]   = useState(MARKETPLACES[0])
  const [showDisconnect, setShowDisconnect] = useState(false)

  // â”€â”€ Load all data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('ebay_marketplace, ebay_username, ebay_access_token').eq('id', user.id).single() as any

      if (profile?.ebay_marketplace && profile?.ebay_access_token) {
        const mp = MARKETPLACES.find(m => m.id === profile.ebay_marketplace) || MARKETPLACES[0]
        setSelectedMp(mp)
        setConnected(true)
        setConnData({
          ebayUsername: profile.ebay_username || user.email?.split('@')[0] || 'eBay Seller',
          storeName: '', feedbackScore: '',
          ordersSynced: 0, lastSyncText: 'Never',
          expiryText: '18d', daysUntilExpiry: 18,
          syncStatus: 'ok', marketplace: profile.ebay_marketplace,
        })

        // Sync history
        const { data: history } = await supabase
          .from('order_sync_logs').select('*').eq('user_id', user.id)
          .order('started_at', { ascending: false }).limit(3)
        setSyncHistory(history || [])

        // Orders count
        const { count } = await supabase
          .from('protected_orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        setConnData((prev: any) => ({ ...prev, ordersSynced: count || 0 }))

        // Safe buyer %
        const { data: buyers } = await supabase.from('buyer_profiles').select('risk_level').eq('user_id', user.id)
        if (buyers && buyers.length > 0) {
          const low = buyers.filter((b: any) => (b.risk_level || '').toUpperCase() === 'LOW').length
          setSafeBuyerPct(Math.round(low / buyers.length * 100))
        }
      } else {
        setConnected(false)
        const savedMpId = profile?.ebay_marketplace
        if (savedMpId) setSelectedMp(MARKETPLACES.find(m => m.id === savedMpId) || MARKETPLACES[0])
      }
    } catch (e) { console.error('eBay load error:', e) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // â”€â”€ Connect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleConnect() {
    setIsConnecting(true)
    try {
      // Save selected marketplace to profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // Store marketplace selection temporarily in localStorage
      // Only saved to DB after OAuth completes successfully
      localStorage.setItem('riazify_pending_marketplace', selectedMp.id)
      localStorage.setItem('riazify_pending_currency_code', selectedMp.currencyCode)
      localStorage.setItem('riazify_pending_currency_symbol', selectedMp.currencySymbol)

      // Build OAuth URL with user_id as state
      const clientId    = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID
      const redirectUri = encodeURIComponent(
        (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin) + '/auth/ebay/callback'
      )
      const scope = encodeURIComponent([
        'https://api.ebay.com/oauth/api_scope',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
      ].join(' '))
      const state = user.id

      const oauthUrl =
        `https://auth.ebay.com/oauth2/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&state=${state}`

      // Open OAuth popup
      const popup = window.open(oauthUrl, 'ebay_oauth', 'width=600,height=700')

      // Poll for popup close â†’ reload profile
      const pollTimer = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(pollTimer)
          await loadAll()
          setIsConnecting(false)
        }
      }, 1000)

    } catch (e: any) {
      toast.error(e.message || 'Connection failed')
      setIsConnecting(false)
    }
  }

  // â”€â”€ Sync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleSync() {
    setIsSyncing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/ebay/sync-orders', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      const json = await res.json()
      if (res.ok) {
        await loadAll()
        toast.info(`Synced! ${json.inserted} new, ${json.updated} updated`)
      } else {
        toast.error(json.error ?? 'Sync failed')
      }
    } catch (e: any) { toast.error(`Sync failed: ${e.message}`) }
    finally { setIsSyncing(false) }
  }

  // â”€â”€ Disconnect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleDisconnect() {
    setShowDisconnect(false); setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await (supabase.from('profiles') as any).update({ ebay_marketplace: null, ebay_username: null } as any).eq('id', user.id)
      await loadAll()
      toast.info('Disconnected from eBay')
    } catch (e: any) { toast.error(e.message) }
  }

  // â”€â”€ Time ago â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function fmtTimeAgo(iso?: string): string {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60)  return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24)  return `${h}h ago`
    return `${Math.floor(h/24)}d ago`
  }

  // â”€â”€ Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isLoading) return (
    <div>
      <h1 className="text-[24px] font-bold mb-1.5" style={{ color: C.txt1, fontFamily: 'Inter, sans-serif' }}>Marketplace Integrations</h1>
      <p className="text-[14px] mb-7" style={{ color: C.txt2 }}>Connect your eBay store and select your marketplace.</p>
      <div className="h-[420px] rounded-2xl border flex items-center justify-center" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <PageSpinner />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[24px] font-bold mb-1.5" style={{ color: C.txt1, fontFamily: 'Inter, sans-serif' }}>Marketplace Integrations</h1>
        <p className="text-[14px]" style={{ color: C.txt2 }}>Connect your eBay store and select your marketplace.</p>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          NOT CONNECTED CARD
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {!connected ? (
        <div className="rounded-2xl border bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden"
             style={{ borderColor: C.border }}>
          <div className="p-7">
            {/* Title row */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-[52px] h-[52px] rounded-[14px] border flex items-center justify-center shrink-0"
                   style={{ backgroundColor: '#F8FAFC', borderColor: C.border }}>
                <ShoppingBag size={24} style={{ color: C.txt1 }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[18px] font-bold mb-1" style={{ color: C.txt1, fontFamily: 'Inter, sans-serif' }}>eBay Seller Account</h2>
                <p className="text-[12px]" style={{ color: C.txt2 }}>
                  Connect your <FlagImg code={selectedMp.code} /> {selectedMp.label} eBay store to unlock full features
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
                    style={{ backgroundColor: '#F1F5F9', color: C.txt3 }}>Not Connected</span>
            </div>

            {/* Marketplace pills */}
            <p className="text-[10px] font-bold mb-2.5 tracking-[0.8px]" style={{ color: C.txt3 }}>SELECT YOUR MARKETPLACE</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {MARKETPLACES.map(mp => {
                const isSel = selectedMp.id === mp.id
                return (
                  <button key={mp.id} onClick={() => setSelectedMp(mp)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-all"
                    style={{
                      backgroundColor: isSel ? C.accent : '#F8FAFC',
                      borderColor: isSel ? C.accent : C.border,
                      borderWidth: isSel ? '2px' : '1px',
                      color: isSel ? '#000' : C.txt1,
                      fontWeight: isSel ? 800 : 500,
                      boxShadow: isSel ? `0 0 6px ${C.accent}40` : undefined,
                    }}>
                    <span className="text-[13px]"><FlagImg code={mp.code} /></span>
                    {mp.label}
                    <span style={{ color: isSel ? 'rgba(0,0,0,0.5)' : C.txt3 }}>{mp.currencySymbol}</span>
                  </button>
                )
              })}
            </div>

            {/* Info pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              <InfoPill icon={Key}    text={`${selectedMp.currencySymbol} ${selectedMp.currencyCode}`} color={C.green}  />
              <InfoPill icon={Shield} text={`Sig. > ${selectedMp.currencySymbol}${selectedMp.signatureThreshold}`}       color={C.orange} />
              <InfoPill icon={Link}   text={`Site ${selectedMp.siteId}`}                               color={C.blue}   />
            </div>

            {/* Features 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <FeatureRow icon={TrendingUp} text="Real-time AI velocity"  color={C.blue}   />
              <FeatureRow icon={RefreshCw}  text="Auto order sync"        color={C.orange}  />
              <FeatureRow icon={Shield}     text="Buyer risk scoring"     color={C.green}   />
              <FeatureRow icon={Bell}       text="Risk alerts"            color={C.red}     />
            </div>

            {/* Locked stats preview */}
            <div className="p-4 rounded-xl border mb-6" style={{ backgroundColor: '#F8FAFC', borderColor: C.border }}>
              <div className="flex items-center gap-1.5 mb-4">
                <Lock size={13} style={{ color: C.txt3 }} />
                <span className="text-[12px] font-semibold" style={{ color: C.txt3 }}>Connect to unlock your full dashboard</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  ['Orders Tracked', 'â€”'],
                  ['Active Listings', 'â€”'],
                  ['Safe Buyers', 'â€”'],
                  ['Revenue', `${selectedMp.currencySymbol}â€”`],
                ].map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="text-[18px] font-bold" style={{ color: C.txt3, fontFamily: 'Inter, sans-serif' }}>{value}</p>
                    <p className="text-[10px] mt-1" style={{ color: C.txt3 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect CTA */}
            <button onClick={handleConnect} disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[14px] text-black text-[15px] font-bold disabled:opacity-70 transition-all hover:opacity-90"
              style={{ backgroundColor: C.accent }}>
              {isConnecting ? (
                <>
                  <Spinner size={16} color="#000" />
                  Opening <FlagImg code={selectedMp.code} /> eBay...
                </>
              ) : (
                <>
                  <Link size={19} />
                  <span><FlagImg code={selectedMp.code} /></span> Connect {selectedMp.label} eBay Store
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            CONNECTED CARD â€” dark gradient (matches Dart exactly)
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
        <div className="rounded-2xl overflow-hidden"
             style={{
               background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
               boxShadow: `0 8px 24px ${C.accent}26`,
             }}>
          <div className="p-7">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-[24px] border-2 shrink-0"
                   style={{ borderColor: C.accent, backgroundColor: '#fff' }}>
                <FlagImg code={selectedMp.code} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[20px] font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {connData?.ebayUsername || 'eBay Seller'}
                  </h2>
                  <CheckCircle size={15} className="text-blue-400 shrink-0" />
                </div>
                {connData?.storeName && (
                  <p className="text-[12px] text-gray-400 mb-1">{connData.storeName}</p>
                )}
                <span className="inline-block px-2 py-1 rounded-md text-[11px] font-semibold border"
                      style={{ backgroundColor: C.accent + '26', borderColor: C.accent + '4D', color: C.accent }}>
                  <FlagImg code={selectedMp.code} />  {selectedMp.label}  â€¢  {selectedMp.currencySymbol} {selectedMp.currencyCode}
                </span>
              </div>
              {/* Live badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0"
                   style={{ backgroundColor: C.accent + '26', borderColor: C.accent + '66' }}>
                <div className={`w-2 h-2 rounded-full ${isSyncing ? 'animate-pulse' : ''}`}
                     style={{ backgroundColor: isSyncing ? C.orange : C.accent }} />
                <span className="text-[11px] font-bold" style={{ color: isSyncing ? C.orange : C.accent }}>
                  {isSyncing ? 'Syncing' : 'Live'}
                </span>
              </div>
            </div>

            {/* Warning banners */}
            {connData?.daysUntilExpiry < 7 && (
              <WarningBanner icon={AlertTriangle} color={C.orange}
                message={`Token expires in ${connData.daysUntilExpiry}d. Reconnect soon.`}
                action="Renew" onTap={handleConnect} />
            )}

            {/* Stats grid */}
            <div className="flex gap-3 mb-5">
              <DarkStat label="Orders Synced"  value={connData?.ordersSynced?.toString() || '0'} icon={ShoppingBag} color={C.blue}   />
              <DarkStat label="Safe Buyers"    value={safeBuyerPct > 0 ? `${safeBuyerPct}%` : 'â€”'}                 icon={Shield}     color={C.green}  />
              <DarkStat label="Last Sync"      value={connData?.lastSyncText || 'Never'}                           icon={RefreshCw}  color={C.accent} />
              <DarkStat label="Token"          value={connData?.expiryText || 'â€”'}                                 icon={Key}        color={connData?.daysUntilExpiry < 7 ? C.red : C.orange} />
            </div>

            <div className="border-t border-white/10 my-5" />

            {/* Progress bar */}
            <div className="flex justify-between text-[12px] mb-2">
              <span className="text-gray-400">Orders this month</span>
              <span className="font-bold" style={{ color: C.accent }}>{connData?.ordersSynced || 0} synced</span>
            </div>
            <div className="h-[5px] rounded-full bg-white/10 mb-1.5 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, ((connData?.ordersSynced || 0) / 500) * 100)}%`, backgroundColor: C.accent }} />
            </div>
            <p className="text-[10px] text-gray-500">{connData?.ordersSynced || 0}/500 order limit</p>

            <div className="mt-6 flex items-center gap-2.5">
              {/* Sync Now */}
              <button onClick={handleSync} disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-black text-[13px] font-bold disabled:opacity-60 transition-all hover:opacity-90"
                style={{ backgroundColor: C.accent }}>
                {isSyncing ? <Spinner size={14} color="#000" /> : <RefreshCw size={15} />}
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
              {/* Refresh */}
              <button onClick={loadAll}
                className="w-11 h-11 rounded-[10px] flex items-center justify-center border"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <RefreshCw size={17} className="text-white/60" />
              </button>
              {/* Disconnect */}
              <button onClick={() => setShowDisconnect(true)}
                className="w-11 h-11 rounded-[10px] flex items-center justify-center border"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <Link2Off size={17} style={{ color: C.red + 'B3' }} />
              </button>
            </div>
          </div>

          {/* Sync history */}
          {syncHistory.length > 0 && (
            <div className="px-7 pb-6 border-t border-white/10 pt-5">
              <div className="flex items-center gap-1.5 mb-3.5">
                <History size={12} className="text-gray-400" />
                <span className="text-[12px] font-semibold text-gray-400">Sync History</span>
              </div>
              <div className="space-y-2.5">
                {syncHistory.map((log, i) => {
                  const success  = log.status === 'success'
                  const found    = log.orders_found || 0
                  const newOrds  = log.orders_new   || 0
                  const timeAgo  = fmtTimeAgo(log.started_at)
                  const started  = log.started_at   ? new Date(log.started_at)   : null
                  const completed = log.completed_at ? new Date(log.completed_at) : null
                  let duration = ''
                  if (started && completed) {
                    const secs = Math.floor((completed.getTime() - started.getTime()) / 1000)
                    duration = secs < 60 ? `${secs}s` : `${Math.floor(secs/60)}m ${secs%60}s`
                  }
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      {success ? <CheckCircle size={13} style={{ color: C.green }} /> : <AlertTriangle size={13} style={{ color: C.red }} />}
                      <span className="flex-1 text-[12px]" style={{ color: success ? '#D1D5DB' : C.red }}>
                        {success
                          ? `${found} orders â€¢ ${newOrds} new${duration ? ` â€¢ ${duration}` : ''}`
                          : `Sync failed${log.error_msg ? `: ${log.error_msg}` : ''}`}
                      </span>
                      <span className="text-[10px] text-gray-500">{timeAgo}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* â”€â”€ COMING SOON SECTION â”€â”€ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[16px] font-bold" style={{ color: C.txt1, fontFamily: 'Inter, sans-serif' }}>Coming Soon</h2>
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold" style={{ backgroundColor: C.navy, color: C.accent }}>
            4 Platforms
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORMS.map((p, i) => (
            <ComingSoonCard key={i} name={p.name} icon={p.icon} color={p.color} feature={p.feature} />
          ))}
        </div>
      </div>

      {/* Disconnect dialog */}
      {showDisconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
             onClick={e => e.target === e.currentTarget && setShowDisconnect(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-[17px] font-bold mb-2" style={{ color: C.txt1, fontFamily: 'Inter, sans-serif' }}>Disconnect eBay?</h3>
            <p className="text-[13px] mb-5" style={{ color: C.txt2 }}>Your synced orders and data will remain. You can reconnect anytime.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDisconnect(false)}
                className="flex-1 h-10 rounded-lg border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.txt2 }}>
                Cancel
              </button>
              <button onClick={handleDisconnect}
                className="flex-1 h-10 rounded-lg text-white text-[13px] font-bold" style={{ backgroundColor: C.red }}>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
