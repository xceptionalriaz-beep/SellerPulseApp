'use client'
// components/admin/settings-tabs/AffiliateVaultTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/affiliate_vault_tab.dart

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ShoppingCart, Store, Rocket, ShoppingBag,
  Network, Target, Home, Package, Zap,
  Eye, EyeOff, Copy, ShieldCheck,
} from 'lucide-react'

const C = {
  lime:   '#8FFF00',
  dark:   '#0F172A',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
  text:   '#0F172A',
  muted:  '#64748B',
  hint:   '#94A3B8',
}

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

// ── Affiliate card (matches Dart _buildAffiliateCard) ──────────
function AffiliateCard({ title, affiliateKey, icon: Icon, previewBase, subtitle, value, onChange }: {
  title: string; affiliateKey: string; icon: React.ElementType
  previewBase: string; subtitle?: string
  value: string; onChange: (v: string) => void
}) {
  const [obscure, setObscure] = useState(false)
  const [pulse,   setPulse]   = useState(true)

  // matches Dart TweenAnimationBuilder pulsing on filled key
  useEffect(() => {
    if (!value) return
    const t = setInterval(() => setPulse(p => !p), 1000)
    return () => clearInterval(t)
  }, [value])

  return (
    <div className="p-5 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div className="flex items-center gap-3 mb-4">
        {/* Icon box */}
        <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: C.dark }}>
          <Icon size={17} style={{ color: C.lime }} />
        </div>
        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold" style={{ color: '#1E293B' }}>{title}</p>
          {subtitle && <p className="text-[11px]" style={{ color: C.muted }}>{subtitle}</p>}
        </div>
        {/* Neon status pulse when key filled */}
        {value && (
          <div style={{ opacity: pulse ? 1 : 0.6, transition: 'opacity 1s ease-in-out' }}>
            <ShieldCheck size={17} style={{
              color: C.lime,
              filter: `drop-shadow(0 0 ${pulse ? '6px' : '3px'} ${C.lime})`,
            }} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          type={obscure ? 'password' : 'text'}
          placeholder="Paste Tag / ID..."
          className="w-full h-11 px-3.5 pr-20 rounded-xl border text-[13px] font-bold outline-none tracking-wider"
          style={{
            backgroundColor: C.bg,
            borderColor: C.border,
            color: C.text,
          }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button onClick={() => setObscure(s => !s)} className="p-1.5 hover:opacity-70">
            {obscure ? <EyeOff size={14} style={{ color: C.hint }} /> : <Eye size={14} style={{ color: C.hint }} />}
          </button>
          <button onClick={() => navigator.clipboard.writeText(value)} className="p-1.5 hover:opacity-70">
            <Copy size={14} style={{ color: C.hint }} />
          </button>
        </div>
      </div>

      {/* Live preview URL */}
      {value && (
        <p className="text-[9px] font-medium mt-2.5 truncate" style={{ color: C.hint }}>
          LIVE: {previewBase}{value}
        </p>
      )}
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────
export default function AffiliateVaultTab(_props: Props) {
  const supabase = createClient()

  const KEYS = ['amazon','ebay','aliexpress','walmart','cj','target','homedepot','temu','autods']
  const [values,       setValues]       = useState<Record<string, string>>(Object.fromEntries(KEYS.map(k => [k, ''])))
  const [isLoading,    setIsLoading]    = useState(true)
  const [isSaving,     setIsSaving]     = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState('Not Synced')

  useEffect(() => { initVault() }, [])

  async function initVault() {
    try {
      const newVals = { ...values }
      for (const key of KEYS) {
        const { data } = await supabase.from('api_fleet_config')
          .select('primary_key_1').eq('platform_name', `${key}_affiliate`).maybeSingle()
        if (data) newVals[key] = (data as any).primary_key_1 ?? ''
      }
      setValues(newVals)
      setLastSyncTime(new Date().toTimeString().slice(0, 8))
    } catch (e) { console.error('Vault Error:', e) }
    setIsLoading(false)
  }

  async function deployToProduction() {
    setIsSaving(true)
    try {
      for (const [key, val] of Object.entries(values)) {
        await (supabase.from('api_fleet_config') as any).upsert({
          platform_name: `${key}_affiliate`,
          primary_key_1: val.trim(),
        }, { onConflict: 'platform_name' })
      }
      setLastSyncTime(new Date().toTimeString().slice(0, 8))
    } catch (e) { console.error('Deploy error:', e) }
    setIsSaving(false)
  }

  function setValue(key: string, val: string) {
    setValues(v => ({ ...v, [key]: val }))
  }

  const MARKETPLACE_CARDS = [
    { title: 'Amazon Associates',    key: 'amazon',    icon: ShoppingCart, preview: 'https://amazon.com/s?tag='                   },
    { title: 'eBay Partner Network', key: 'ebay',      icon: Store,        preview: 'https://ebay.com?campid='                   },
    { title: 'AliExpress Portal',    key: 'aliexpress',icon: Rocket,       preview: 'https://s.click.aliexpress.com/e/'          },
    { title: 'Walmart Affiliates',   key: 'walmart',   icon: ShoppingBag,  preview: 'https://walmart.com?affid='                 },
    { title: 'CJ Dropshipping',      key: 'cj',        icon: Network,          preview: 'https://cjdropshipping.com?token='          },
    { title: 'Target Partners',      key: 'target',    icon: Target,       preview: 'https://target.com?ref='                    },
    { title: 'Home Depot',           key: 'homedepot', icon: Home,         preview: 'https://homedepot.com?tag='                 },
    { title: 'Temu Global',          key: 'temu',      icon: Package,      preview: 'https://temu.com/affid='                    },
  ]

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.lime }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-10 px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[34px] font-black tracking-tight mb-1" style={{ color: C.dark }}>
            Affiliate Vault
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full"
                 style={{ backgroundColor: C.lime, boxShadow: `0 0 8px ${C.lime}` }} />
            <p className="text-[13px] font-bold" style={{ color: C.muted }}>
              Monetization Pulse: Active
            </p>
          </div>
        </div>
        {/* Sync badge */}
        <div className="px-4 py-2.5 rounded-xl border flex flex-col items-end"
             style={{ backgroundColor: C.dark, borderColor: 'rgba(143,255,0,0.2)' }}>
          <p className="text-[9px] font-black tracking-[1.2px]"
             style={{ color: 'rgba(143,255,0,0.7)' }}>VAULT LAST SYNC</p>
          <p className="text-[14px] font-black text-white">{lastSyncTime}</p>
        </div>
      </div>

      {/* Safety protocol banner */}
      <div className="flex items-start gap-3.5 p-4 rounded-2xl border"
           style={{ backgroundColor: 'rgba(143,255,0,0.06)', borderColor: 'rgba(143,255,0,0.24)' }}>
        <ShieldCheck size={23} style={{ color: C.lime, flexShrink: 0, marginTop: 1 }} />
        <p className="text-[13px] font-bold leading-snug" style={{ color: '#1E293B' }}>
          Global Deployment Protocol: Changes saved here will instantly inject tracking IDs into every live search result. Use extreme caution.
        </p>
      </div>

      {/* Marketplace cards grid */}
      <div>
        <p className="text-[11px] font-black tracking-[1.8px] mb-5" style={{ color: C.hint }}>
          GLOBAL MARKETPLACE CHANNELS
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {MARKETPLACE_CARDS.map(c => (
            <AffiliateCard key={c.key} title={c.title} affiliateKey={c.key}
              icon={c.icon} previewBase={c.preview}
              value={values[c.key]} onChange={v => setValue(c.key, v)} />
          ))}
        </div>
      </div>

      {/* SaaS Partners */}
      <div>
        <p className="text-[11px] font-black tracking-[1.8px] mb-5" style={{ color: C.hint }}>
          SOFTWARE & SAAS PARTNERS
        </p>
        <AffiliateCard
          title="AutoDS Integration Link" affiliateKey="autods" icon={Zap}
          previewBase="https://autods.com/register?ref="
          subtitle="Monetize product imports via your personal referral tunnel."
          value={values['autods']} onChange={v => setValue('autods', v)}
        />
      </div>

      {/* Deploy button */}
      <div className="flex justify-end">
        <button onClick={deployToProduction} disabled={isSaving}
          className="flex items-center gap-2.5 h-14 px-8 rounded-2xl text-[13px] font-black tracking-[1.2px]"
          style={{
            backgroundColor: C.lime, color: '#000',
            boxShadow: `0 10px 20px -5px rgba(143,255,0,0.4)`,
            width: 320,
            justifyContent: 'center',
          }}>
          {isSaving ? (
            <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin"
                 style={{ borderTopColor: '#000' }} />
          ) : (
            <Zap size={21} />
          )}
          {isSaving ? 'SYNCHRONIZING...' : 'DEPLOY REVENUE ENGINE'}
        </button>
      </div>

    </div>
  )
}