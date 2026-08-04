'use client'
// app/dashboard/title-builder/page.tsx
// Converted 1:1 from lib/pages/title_builder/title_builder_main.dart

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import TbTopBar from './components/TbTopBar'
import TbStudio from './components/TbStudio'
import TbProHud from './components/TbProHud'
import TbKeywordTables from './components/TbKeywordTables'
import TbSettingsPanel from './components/TbSettingsPanel'
import KillSwitchGate from '@/components/KillSwitchGate'

const supabase = createClient()

export default function TitleBuilderPage() {

  // ── Title state ──────────────────────────────────────────────
  const [title, setTitle] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [flaggedDups, setFlaggedDups] = useState<string[]>([])
  // Richer VeRO type — carries risk_level + evidence_url so the UI
  // can show the seller exactly which brand fired and how serious it is
  interface VeroFlag { name: string; risk_level: string; evidence_url: string | null }
  const [veroDb, setVeroDb] = useState<any[]>([])
  const [flaggedVero, setFlaggedVero] = useState<VeroFlag[]>([])

  // ── Plan limits + usage (fix 3 + 4) ─────────────────────────
  const [planLimits, setPlanLimits] = useState<any>(null)
  const [usageCounts, setUsageCounts] = useState({ ai_optimize: 0, keyword_search: 0, competitor_extract: 0 })
  const limitRef = useRef({ ai_optimize: 0, keyword_search: 0, competitor_extract: 0 })

  // ── Master filters ───────────────────────────────────────────
  const [activeTimeframe, setActiveTimeframe] = useState('30D')
  const [activeMarket, setActiveMarket] = useState('eBay')
  const [activeLocation, setActiveLocation] = useState('US')

  // ── Settings ─────────────────────────────────────────────────
  const [autoCapitalize, setAutoCapitalize] = useState(true)
  const [autoCopy, setAutoCopy] = useState(false)
  const [veroMode, setVeroMode] = useState('Strict')
  const [showSettings, setShowSettings] = useState(false)

  // ── Keyword data ─────────────────────────────────────────────
  const [isFetching, setIsFetching] = useState(false)
  const [longTailKeywords, setLongTailKeywords] = useState<any[]>([])
  const [genericKeywords, setGenericKeywords] = useState<any[]>([])
  const [categoryName, setCategoryName] = useState('') // from eBay Extract — drives spin category awareness

  // ── MarketProvider data (replaces Dart Consumer<MarketProvider>) ──
  const [saturScore, setSaturScore] = useState(0)
  const [trendData, setTrendData] = useState<number[]>([])
  const [marketLoading, setMarketLoading] = useState(false)

  // ── Load VeRO DB + plan limits + current usage on mount ──────
  useEffect(() => {
    async function loadOnMount() {
      try {
        // Fix 1+2: fetch keywords + evidence_url alongside brand_name + risk_level
        const { data: brands } = await supabase
          .from('vero_brands')
          .select('brand_name, risk_level, keywords, evidence_url')
        if (brands) setVeroDb(brands as any[])
      } catch (e) { console.error('VeRO Load Error:', e) }

      try {
        // Fix 3: load plan limits for this user's tier
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('subscription_tier')
          .eq('id', user.id)
          .single()
        const tier = (profile as any)?.subscription_tier ?? 'free'
        const { data: limits } = await (supabase.from('plan_limits') as any)
          .select('max_ai_optimize, max_keyword_searches, max_competitor_extract, max_title_generations')
          .eq('tier', tier)
          .single()
        if (limits) setPlanLimits(limits as any)

        // Fix 4: load current month usage from user_tool_usage
        const now = new Date()
        const { data: usageRows } = await (supabase.from('user_tool_usage') as any)
          .select('tool_name, usage_count')
          .eq('user_id', user.id)
          .in('tool_name', ['title_builder_ai_optimize', 'title_builder_search', 'title_builder_extract'])
        if (usageRows) {
          const counts = { ai_optimize: 0, keyword_search: 0, competitor_extract: 0 }
          for (const row of usageRows as any[]) {
            if (row.tool_name === 'title_builder_ai_optimize') counts.ai_optimize = row.usage_count
            if (row.tool_name === 'title_builder_search') counts.keyword_search = row.usage_count
            if (row.tool_name === 'title_builder_extract') counts.competitor_extract = row.usage_count
          }
          setUsageCounts(counts)
          limitRef.current = counts
        }
      } catch (e) { console.error('Plan/usage load error:', e) }
    }
    loadOnMount()
  }, [])

  // ── Helper: increment a usage counter (fix 4) ────────────────
  async function trackUsage(toolName: 'title_builder_ai_optimize' | 'title_builder_search' | 'title_builder_extract') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // Upsert: increment if row exists, insert with count 1 if not
      await (supabase.from('user_tool_usage') as any).upsert({
        user_id: user.id,
        tool_name: toolName,
        usage_count: (toolName === 'title_builder_ai_optimize'
          ? limitRef.current.ai_optimize
          : toolName === 'title_builder_search'
            ? limitRef.current.keyword_search
            : limitRef.current.competitor_extract) + 1,
        last_used_at: new Date().toISOString(),
      }, { onConflict: 'user_id,tool_name' })
    } catch { /* non-critical */ }
  }

  // ── Helper: check if user has quota left (fix 3) ─────────────
  function isAtLimit(type: 'ai_optimize' | 'keyword_search' | 'competitor_extract'): boolean {
    if (!planLimits) return false // limits not loaded yet — allow through
    const limit = type === 'ai_optimize'
      ? planLimits.max_ai_optimize
      : type === 'keyword_search'
        ? planLimits.max_keyword_searches
        : planLimits.max_competitor_extract
    if (limit === -1) return false // -1 = unlimited (growth/custom tier)
    return limitRef.current[type] >= limit
  }

  // ── Analyze title on change (matches Dart _analyzeTitle) ─────
  // Fix 1: respect veroMode — Strict flags all 3 tiers, Relaxed skips Caution
  // Fix 2: also test brand.keywords (comma-separated) against the title
  useEffect(() => {
    const text = title
    const words = text.toLowerCase().split(/\s+/).filter(Boolean)

    const newDups: string[] = []
    const seen = new Set<string>()
    const skipWords = new Set(['for', 'with', 'and', 'the', 'in', 'on', 'a', 'to', 'of'])

    for (const word of words) {
      if (skipWords.has(word)) continue
      if (seen.has(word) && !newDups.includes(word)) newDups.push(word)
      seen.add(word)
    }

    const newVero: VeroFlag[] = []
    if (veroDb.length > 0) {
      for (const brand of veroDb) {
        const riskLevel = brand.risk_level ?? 'High Risk'

        // Fix 1: veroMode filter
        // Strict  → flag Critical Ban + High Risk + Caution (all)
        // Relaxed → flag Critical Ban + High Risk only, skip Caution
        if (veroMode === 'Relaxed' && riskLevel === 'Caution') continue

        const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        // Fix 2a: always check brand_name
        const nameHit = new RegExp(`\\b${escape(brand.brand_name ?? '')}\\b`, 'i').test(text)

        // Fix 2b: also check each comma-separated keyword in brand.keywords
        let keywordsHit = false
        if (brand.keywords) {
          const kws = (brand.keywords as string).split(',').map((k: string) => k.trim()).filter(Boolean)
          keywordsHit = kws.some((kw: string) => new RegExp(`\\b${escape(kw)}\\b`, 'i').test(text))
        }

        if ((nameHit || keywordsHit) && !newVero.find(f => f.name === brand.brand_name)) {
          newVero.push({
            name: brand.brand_name,
            risk_level: riskLevel,
            evidence_url: brand.evidence_url ?? null,
          })
        }
      }
    }

    setCharCount(text.length)
    setFlaggedVero(newVero)
    setFlaggedDups(newDups)

    if (autoCopy && text.length === 80) {
      navigator.clipboard.writeText(text)
    }
  }, [title, veroDb, autoCopy, veroMode])

  // ── Extract item ID — real eBay API ──────────────────────────
  async function handleExtract(itemId: string) {
    if (!itemId) return
    // Fix 3: enforce competitor_extract plan limit
    if (isAtLimit('competitor_extract')) {
      alert(`You've reached your plan limit for Competitor Extracts. Upgrade to get more.`)
      return
    }
    setIsFetching(true)
    try {
      const res = await fetch(`/api/ebay/item?id=${encodeURIComponent(itemId)}&purpose=title`)
      const data = await res.json()
      if (res.ok && data.title) {
        setTitle(data.title)
        if (data.categoryName) setCategoryName(data.categoryName) // for spin category awareness
        // Fix 4: track usage
        limitRef.current.competitor_extract += 1
        setUsageCounts(p => ({ ...p, competitor_extract: p.competitor_extract + 1 }))
        trackUsage('title_builder_extract')
      } else {
        console.error('[title-builder] Extract failed:', data.error)
      }
    } catch (e) { console.error('[title-builder] Extract error:', e) }
    setIsFetching(false)
  }

  // ── Search keyword — real eBay API ────────────────────────────
  async function handleSearch(keyword: string) {
    if (!keyword) return
    // Fix 3: enforce keyword_search plan limit
    if (isAtLimit('keyword_search')) {
      alert(`You've reached your plan limit for Keyword Searches. Upgrade to get more.`)
      return
    }
    setMarketLoading(true)
    setIsFetching(true)
    try {
      // Map the Location dropdown (US/UK/CA/AU/All) to eBay's marketplace IDs.
      // NOTE: activeMarket is a separate "platform" selector (eBay/Amazon/Walmart);
      // Amazon/Walmart are disabled placeholders, so eBay is the only live platform.
      // The country targeting actually comes from activeLocation, not activeMarket.
      const marketplace = activeLocation === 'UK' ? 'EBAY_GB'
        : activeLocation === 'CA' ? 'EBAY_CA'
          : activeLocation === 'AU' ? 'EBAY_AU'
            : 'EBAY_US' // covers 'US' and 'All' (Browse API has no true multi-marketplace query)

      const res = await fetch(
        `/api/ebay/search?keyword=${encodeURIComponent(keyword)}&marketplace=${marketplace}&limit=20`
      )
      const data = await res.json()

      if (res.ok) {
        setTrendData(data.trendData ?? [])
        setSaturScore(data.saturScore ?? 0)
        setLongTailKeywords(data.longTailKeywords ?? [])
        setGenericKeywords(data.genericKeywords ?? [])
        // Fix 4: track usage
        limitRef.current.keyword_search += 1
        setUsageCounts(p => ({ ...p, keyword_search: p.keyword_search + 1 }))
        trackUsage('title_builder_search')
      } else {
        console.error('[title-builder] Search failed:', data.error)
      }
    } catch (e) { console.error('[title-builder] Search error:', e) }
    setMarketLoading(false)
    setIsFetching(false)
  }

  // ── Inject keyword (matches Dart injectKeyword) ───────────────
  function injectKeyword(kw: string) {
    const separator = (!title || title.endsWith(' ')) ? '' : ' '
    const newText = `${title}${separator}${kw} `
    setTitle(newText)
  }

  // ── Award XP when title is copied ─────────────────────────────
  async function handleTitleCopy() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('titles_count, total_xp')
        .eq('id', user.id)
        .single()
      await (supabase.from('profiles') as any)
        .update({
          titles_count: ((profile as any)?.titles_count ?? 0) + 1,
          total_xp: ((profile as any)?.total_xp ?? 0) + 3,
        } as any)
        .eq('id', user.id)
    } catch { /* non-critical */ }
  }

  // ── Title change handler with auto-capitalize ─────────────────
  function handleTitleChange(val: string) {
    // Hard cap at 110 chars — applies to both textarea input and
    // programmatic changes from Clean / Spin / AI Optimize / inject
    const capped = val.slice(0, 110)
    // Auto-capitalize if setting is on (matches Dart autoCapitalize)
    if (autoCapitalize) {
      setTitle(capped.replace(/\b\w/g, c => c.toUpperCase()))
    } else {
      setTitle(capped)
    }
  }

  return (
    <KillSwitchGate switchTitle="Title Builder">
      <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="p-5 lg:p-8 flex flex-col gap-8">

          {/* Page title */}
          <h1 className="text-[24px] font-bold" style={{ color: '#0F172A' }}>
            SellerPulse Pro Title Builder
          </h1>

          {/* Top bar */}
          <TbTopBar
            selectedTimeframe={activeTimeframe} onTimeframeChanged={setActiveTimeframe}
            selectedMarket={activeMarket} onMarketChanged={setActiveMarket}
            selectedLocation={activeLocation} onLocationChanged={setActiveLocation}
            onExtract={handleExtract}
            onSearch={handleSearch}
            onOpenSettings={() => setShowSettings(true)}
          />

          {/* Studio + HUD */}
          <div className="flex flex-col xl:flex-row gap-5">
            <div style={{ flex: 65 }}>
              <TbStudio
                value={title}
                onChange={handleTitleChange}
                charCount={charCount}
                flaggedVero={flaggedVero}
                duplicateCount={flaggedDups.length}
                onCopy={handleTitleCopy}
                keywordContext={[...genericKeywords, ...longTailKeywords].map(k => k.kw)}
                aiOptimizeLimit={planLimits?.max_ai_optimize ?? null}
                aiOptimizeUsed={usageCounts.ai_optimize}
                categoryName={categoryName}
                activeLocation={activeLocation}
                onAiOptimizeUsed={() => {
                  limitRef.current.ai_optimize += 1
                  setUsageCounts(p => ({ ...p, ai_optimize: p.ai_optimize + 1 }))
                  trackUsage('title_builder_ai_optimize')
                }}
              />
            </div>
            <div style={{ flex: 35 }}>
              <TbProHud
                flaggedVero={flaggedVero}
                currentTitle={title}
                timeframe={activeTimeframe}
                saturScore={saturScore}
                trendData={trendData}
                isLoading={marketLoading}
                topWords={genericKeywords.slice(0, 2).map(g => ({ word: g.kw, percent: `${g.comp}%` }))}
              />
            </div>
          </div>

          {/* Keyword tables */}
          <TbKeywordTables
            currentTitle={title}
            onInject={injectKeyword}
            veroDatabase={veroDb}
            longTailData={longTailKeywords}
            genericData={genericKeywords}
            isLoading={isFetching}
          />

        </div>

        {/* Settings panel */}
        {showSettings && (
          <TbSettingsPanel
            autoCapitalize={autoCapitalize} onAutoCapitalizeChanged={setAutoCapitalize}
            autoCopy={autoCopy} onAutoCopyChanged={setAutoCopy}
            veroMode={veroMode} onVeroModeChanged={setVeroMode}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </KillSwitchGate>
  )
}
