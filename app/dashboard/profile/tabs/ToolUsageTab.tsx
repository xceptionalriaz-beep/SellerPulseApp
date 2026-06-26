'use client'
// app/dashboard/profile/tabs/ToolUsageTab.tsx

import { useState, useEffect, useCallback } from 'react'
import { FileText, TrendingUp, ShoppingBag, RefreshCw, Infinity } from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase'

const C = {
  lime:    '#8fff00',
  limeD:   '#4a8f00',
  limeTint:'#f4ffe6',
  dark:    '#0a0d08',
  border:  '#e8ede2',
  muted:   '#8a9e78',
  surface: '#ffffff',
  bg:      '#f9fdf4',
  green:   '#00C48C',
  orange:  '#FFB800',
  red:     '#FF4D6A',
  blue:    '#1D70F5',
}

export default function ToolUsageTab() {
  const supabase = createClient()

  const [isLoading,     setIsLoading]     = useState(true)
  const [planName,      setPlanName]      = useState('Free')
  const [resetDate,     setResetDate]     = useState<string | null>(null)
  const [titlesUsed,    setTitlesUsed]    = useState(0)
  const [titlesLimit,   setTitlesLimit]   = useState(10)
  const [profitsUsed,   setProfitsUsed]   = useState(0)
  const [profitsLimit,  setProfitsLimit]  = useState(10)
  const [ordersCount,   setOrdersCount]   = useState(0)
  const [ebayConnected, setEbayConnected] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Profile
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('plan_name, ebay_marketplace, ebay_access_token')
        .eq('id', user.id).single()
      const pName = (profile as any)?.plan_name ?? 'Free'
      setPlanName(pName)
      setEbayConnected(!!(profile as any)?.ebay_marketplace && !!(profile as any)?.ebay_access_token)

      // Plan limits
      const { data: limits } = await (supabase.from('plan_limits') as any)
        .select('max_title_generations, max_profit_calcs')
        .eq('tier', pName.toLowerCase()).maybeSingle()
      if (limits) {
        setTitlesLimit((limits as any).max_title_generations ?? 10)
        setProfitsLimit((limits as any).max_profit_calcs ?? 10)
      }

      // Tool usage
      const { data: usage } = await (supabase.from('user_tool_usage') as any)
        .select('*').eq('user_id', user.id)
      for (const t of (usage || [])) {
        if (t.tool_name === 'title_builder')     { setTitlesUsed(t.usage_count || 0); if (t.reset_date) setResetDate(t.reset_date) }
        if (t.tool_name === 'profit_calculator') { setProfitsUsed(t.usage_count || 0) }
      }

      // Orders count
      const { count } = await supabase.from('protected_orders')
        .select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setOrdersCount(count || 0)

    } catch (e) { console.error('Tool usage load error:', e) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Reset date text
  const resetText = resetDate
    ? (() => {
        const days = Math.ceil((new Date(resetDate).getTime() - Date.now()) / 86400000)
        return days > 0 ? `Resets in ${days} days` : 'Resets soon'
      })()
    : null

  if (isLoading) return <PageSpinner />

  const tools = [
    {
      icon:    FileText,
      color:   C.green,
      iconBg:  'rgba(0,196,140,0.1)',
      label:   'Title Builder',
      desc:    'AI-powered eBay title generator',
      used:    titlesUsed,
      limit:   titlesLimit,
    },
    {
      icon:    TrendingUp,
      color:   C.orange,
      iconBg:  'rgba(255,184,0,0.1)',
      label:   'Profit Calculator',
      desc:    'eBay fee and profit calculator',
      used:    profitsUsed,
      limit:   profitsLimit,
    },
    {
      icon:    ShoppingBag,
      color:   C.blue,
      iconBg:  'rgba(29,112,245,0.1)',
      label:   'eBay Orders',
      desc:    ebayConnected ? 'Auto-syncing from your eBay store' : 'Connect eBay to start syncing',
      used:    ordersCount,
      limit:   -1,
    },
  ]

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily:'Inter,sans-serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily:'Inter,sans-serif', fontSize:20, fontWeight:700, color:C.dark }}>Tool Usage</h1>
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:13, color:C.muted, marginTop:3 }}>
            Your usage this month
            {resetText && <span style={{ marginLeft:6, fontSize:11, fontWeight:600, color:C.limeD, backgroundColor:C.limeTint, padding:'2px 8px', borderRadius:20 }}>{resetText}</span>}
          </p>
        </div>
        <button onClick={loadData} className="hover:opacity-70 transition-opacity">
          <RefreshCw size={15} style={{ color:C.muted }} />
        </button>
      </div>

      {/* Tool cards */}
      {tools.map((tool, i) => {
        const isUnlimited = tool.limit === -1
        const pct         = isUnlimited ? 0 : Math.min(1, tool.used / (tool.limit || 1))
        const isAtLimit   = !isUnlimited && pct >= 1
        const isNear      = !isUnlimited && pct > 0.8 && !isAtLimit
        const barColor    = isAtLimit ? C.red : isNear ? C.orange : tool.color

        return (
          <div
            key={i}
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${isAtLimit ? '#FF4D6A4D' : isNear ? '#FFB8004D' : C.border}`,
            }}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor:tool.iconBg }}>
                <tool.icon size={20} style={{ color:tool.color }} />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:700, color:C.dark }}>{tool.label}</p>
                <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:C.muted, marginTop:2 }}>{tool.desc}</p>
              </div>

              {/* Usage */}
              <div className="text-right shrink-0">
                {isUnlimited ? (
                  <>
                    <p style={{ fontFamily:'Inter,sans-serif', fontSize:18, fontWeight:800, color:C.dark }}>{tool.used}</p>
                    <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:C.limeD, backgroundColor:C.limeTint, padding:'1px 7px', borderRadius:20 }}>Unlimited</span>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily:'Inter,sans-serif', fontSize:18, fontWeight:800, color: isAtLimit ? C.red : C.dark }}>
                      {tool.used}<span style={{ fontSize:12, fontWeight:500, color:C.muted }}>/{tool.limit}</span>
                    </p>
                    <p style={{ fontFamily:'Inter,sans-serif', fontSize:10, color:C.muted }}>uses this month</p>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar — only for limited tools */}
            {!isUnlimited && (
              <div className="mt-4">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:C.border }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width:`${pct*100}%`, backgroundColor:barColor }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, color:C.muted }}>{(pct*100).toFixed(0)}% used</span>
                  {isAtLimit && (
                    <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:C.red, backgroundColor:'rgba(255,77,106,0.1)', padding:'1px 8px', borderRadius:20 }}>
                      Limit reached — upgrade plan
                    </span>
                  )}
                  {isNear && (
                    <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:600, color:C.orange }}>
                      Near limit
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

    </div>
  )
}