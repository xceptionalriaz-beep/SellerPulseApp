'use client'
'use client'
// app/dashboard/profile/tabs/ToolUsageTab.tsx
// Converted from: lib/user_profile/tabs/tool_usage_tab.dart
//
// Sections (same as Dart):
//   - Header
//   - Plan Summary Card (dark gradient, plan badge, eBay connection status)
//   - Tool Cards (6 tools with progress bars, near-limit warnings)

import { useState, useEffect, useCallback } from 'react'
import {
  Search, Store, BarChart2, Type, Calculator,
  ShoppingBag, RefreshCw,
} from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase'

// ── Tool config (matches Dart _toolConfig exactly) ──────────────
const TOOL_CONFIG = [
  { key: 'product_research',    label: 'Product Research',   icon: Search,     color: '#1D70F5' },
  { key: 'competitor_research', label: 'Competitor Research', icon: Store,      color: '#FFB800' },
  { key: 'deep_dive_analysis',  label: 'Deep Dive Analysis', icon: BarChart2,  color: '#8B5CF6' },
  { key: 'title_builder',       label: 'Title Builder',      icon: Type,       color: '#00C48C' },
  { key: 'profit_calculator',   label: 'Profit Calculator',  icon: Calculator, color: '#EC4899' },
  { key: 'ebay_orders',         label: 'eBay Orders Sync',   icon: ShoppingBag,color: '#8FFF00' },
]

// ── Tool card (matches Dart _buildToolCard) ────────────────────
function ToolCard({ label, icon: Icon, color, used, limit, resetDate }: {
  label: string; icon: React.ElementType; color: string
  used: number; limit: number; resetDate?: string
}) {
  const isUnlimited = limit >= 999999
  const pct         = isUnlimited ? 0 : Math.min(1, used / (limit || 1))
  const isAtLimit   = pct >= 1.0
  const isNearLimit = pct > 0.8 && !isAtLimit

  const barColor = isAtLimit ? '#FF4D6A' : isNearLimit ? '#FFB800' : color

  let resetText = ''
  if (resetDate) {
    try {
      const days = Math.ceil((new Date(resetDate).getTime() - Date.now()) / 86400000)
      if (days > 0) resetText = `Resets in ${days} days`
    } catch {}
  }

  const borderColor = isAtLimit   ? '#FF4D6A4D'
                    : isNearLimit ? '#FFB8004D'
                    : '#E2E8F0'

  return (
    <div className="p-5 rounded-xl bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
         style={{ borderColor }}>
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
             style={{ backgroundColor: color + '1A' }}>
          <Icon size={22} style={{ color }} />
        </div>

        {/* Label + reset */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[#0F172A]">{label}</p>
          {resetText && (
            <p className="text-[11px] mt-0.5 text-[#94A3B8]">{resetText}</p>
          )}
        </div>

        {/* Usage count */}
        <div className="text-right shrink-0">
          <p className="text-[16px] font-bold" style={{ color: isAtLimit ? '#FF4D6A' : '#0F172A', fontFamily: 'var(--font-space-grotesk)' }}>
            {isUnlimited ? `${used}` : `${used} / ${limit}`}
          </p>
          <p className="text-[10px] text-[#94A3B8]">{isUnlimited ? 'unlimited' : 'uses'}</p>
        </div>
      </div>

      {/* Progress bar (hidden for unlimited) */}
      {!isUnlimited && (
        <div className="mt-3.5">
          <div className="h-[5px] rounded-full bg-[#F1F5F9] overflow-hidden mb-1.5">
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${pct * 100}%`, backgroundColor: barColor }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8]">{(pct * 100).toFixed(0)}% used</span>
            {isAtLimit && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                    style={{ backgroundColor: '#FF4D6A1A', color: '#FF4D6A' }}>
                Limit reached — upgrade plan
              </span>
            )}
            {isNearLimit && (
              <span className="text-[10px] font-semibold" style={{ color: '#FFB800' }}>Near limit</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function ToolUsageTab() {
  const supabase = createClient()

  const [isLoading,     setIsLoading]     = useState(true)
  const [toolUsage,     setToolUsage]     = useState<any[]>([])
  const [ebayConnected, setEbayConnected] = useState(false)
  const [ebayUsername,  setEbayUsername]  = useState('')
  const [planName,      setPlanName]      = useState('Pro')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const plan = user.user_metadata?.plan || 'Pro'
      setPlanName(plan)

      // Tool usage
      const { data: usage } = await supabase
        .from('user_tool_usage').select('*').eq('user_id', user.id)
      setToolUsage(usage || [])

      // eBay connection
      const { data: profile } = await supabase
        .from('profiles').select('ebay_marketplace, ebay_username').eq('id', user.id).single() as any
      if (profile?.ebay_marketplace) {
        setEbayConnected(true)
        setEbayUsername(profile.ebay_username || user.email?.split('@')[0] || '')
      }
    } catch (e) { console.error('Tool usage load error:', e) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (isLoading) return (
    <PageSpinner />
  )

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-[#0F172A]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Tool Usage &amp; Limits
        </h1>
        <p className="text-[14px] text-gray-400 mt-2">
          Track your usage across all SellerPulse tools.
        </p>
      </div>

      {/* ── Plan Summary Card (dark gradient, matches Dart) ── */}
      <div className="flex items-center gap-4 p-5 rounded-2xl"
           style={{
             background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
             boxShadow: '0 8px 20px rgba(143,255,0,0.1)',
           }}>
        {/* Plan badge */}
        <div className="px-4 py-2 rounded-full border shrink-0"
             style={{ backgroundColor: 'rgba(143,255,0,0.15)', borderColor: 'rgba(143,255,0,0.4)' }}>
          <span className="text-[13px] font-extrabold" style={{ color: '#8FFF00' }}>
            {planName.toUpperCase()}
          </span>
        </div>

        {/* Plan info */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-white">{planName} Plan Active</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Limits reset monthly. Upgrade for higher limits.</p>
        </div>

        {/* eBay status */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-2 h-2 rounded-full"
                 style={{ backgroundColor: ebayConnected ? '#8FFF00' : '#64748B' }} />
            <span className="text-[11px] font-semibold"
                  style={{ color: ebayConnected ? '#8FFF00' : '#64748B' }}>
              {ebayConnected ? 'eBay Connected' : 'eBay Not Connected'}
            </span>
          </div>
          {ebayConnected && ebayUsername && (
            <p className="text-[10px] text-gray-500 mt-1">{ebayUsername}</p>
          )}
        </div>
      </div>

      {/* ── Tool Cards ── */}
      {TOOL_CONFIG.map(({ key, label, icon, color }) => {
        const usage = toolUsage.find(t => t.tool_name === key) || { usage_count: 0, usage_limit: 100, reset_date: null }
        return (
          <ToolCard
            key={key}
            label={label}
            icon={icon}
            color={color}
            used={usage.usage_count || 0}
            limit={usage.usage_limit || 100}
            resetDate={usage.reset_date}
          />
        )
      })}

    </div>
  )
}