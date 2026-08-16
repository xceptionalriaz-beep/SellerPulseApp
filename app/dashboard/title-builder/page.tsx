'use client'
import { useToast } from '@/components/ui/AppToast'
// app/dashboard/title-builder/page.tsx
// New 2-column layout matching Stitch design
// Colors: Lime #7530fb | Dark #1e1535 | Border #ede9fe | BG #f8f7ff
// Font: Inter only | Icons: Lucide React only

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import TbStudio from './components/TbStudio'
import TbProHud from './components/TbProHud'
import TbKeywordTables from './components/TbKeywordTables'
import TbSettingsPanel from './components/TbSettingsPanel'
import KillSwitchGate from '@/components/KillSwitchGate'

const supabase = createClient()

const C = {
  lime: '#7530fb',
  dark: '#1e1535',
  border: '#ede9fe',
  muted: '#9ca3af',
  surface: '#ffffff',
  bg: '#f8f7ff',
  text: '#1e1535',
}

export default function TitleBuilderPage() {
  const toast = useToast()

  // ── Title state ──────────────────────────────────────────────
  const [title, setTitle] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [flaggedDups, setFlaggedDups] = useState<string[]>([])
  interface VeroFlag { name: string; risk_level: string; evidence_url: string | null }
  const [veroDb, setVeroDb] = useState<any[]>([])
  const [flaggedVero, setFlaggedVero] = useState<VeroFlag[]>([])

  // ── Recent titles — load on mount ───────────────────────────
  const [recentTitles, setRecentTitles] = useState<string[]>([])
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save title to Supabase after 3 seconds of no typing
  useEffect(() => {
    if (!title.trim()) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        // Keep last 3 unique titles
        const updated = [title, ...recentTitles.filter(t => t !== title)].slice(0, 3)
        setRecentTitles(updated)
        await (supabase.from('profiles') as any)
          .update({ recent_titles: updated })
          .eq('id', user.id)
      } catch (e) { console.error('[title-history] Save error:', e) }
    }, 3000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [title])
  const [planLimits, setPlanLimits] = useState<any>(null)
  const [usageCounts, setUsageCounts] = useState({ ai_optimize: 0, keyword_search: 0, competitor_extract: 0 })
  const limitRef = useRef({ ai_optimize: 0, keyword_search: 0, competitor_extract: 0 })

  // ── Top bar state (now lives in layout — listen via custom event) ──────────
  const [activeLocation, setActiveLocation] = useState('US')
  const [activeShipFrom, setActiveShipFrom] = useState('')
  const [activeCondition, setActiveCondition] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Use refs so event handlers always have fresh access to latest functions
  const handleExtractRef = useRef<(id: string) => void>(() => { })
  const handleSearchRef = useRef<(kw: string) => void>(() => { })
  const lastKeywordRef = useRef<string>('')

  useEffect(() => {
    function onGenerate(e: Event) {
      const { input, market, shipFrom, condition, category, exclude } = (e as CustomEvent).detail
      setActiveLocation(market ?? 'US')
      setActiveShipFrom(shipFrom ?? '')
      setActiveCondition(condition ?? '')
      setActiveCategory(category ?? '')
      setFilterExclude(exclude ?? '')
      const isItemId = /^[\d\-]+$/.test(input.trim())
      if (isItemId) handleExtractRef.current(input.trim())
      else {
        lastKeywordRef.current = input.trim()
        handleSearchRef.current(input.trim())
      }
    }
    function onSettings() { setShowSettings(true) }
    function onRefilter() {
      if (lastKeywordRef.current) handleSearchRef.current(lastKeywordRef.current)
    }
    function onReset() {
      setTitle('')
      setLongTailKeywords([])
      setGenericKeywords([])
      setCompetingListings([])
      setTotalListings(0)
      setHasSearched(false)
      lastKeywordRef.current = ''
    }
    window.addEventListener('tb:generate', onGenerate)
    window.addEventListener('tb:settings', onSettings)
    window.addEventListener('tb:refilter', onRefilter)
    window.addEventListener('tb:reset', onReset)
    return () => {
      window.removeEventListener('tb:generate', onGenerate)
      window.removeEventListener('tb:settings', onSettings)
      window.removeEventListener('tb:refilter', onRefilter)
      window.removeEventListener('tb:reset', onReset)
    }
  }, [])

  // ── Settings ─────────────────────────────────────────────────
  const [autoCapitalize, setAutoCapitalize] = useState(true)
  const [autoCopy, setAutoCopy] = useState(false)
  const [veroMode, setVeroMode] = useState('Strict')

  // ── Keyword data ─────────────────────────────────────────────
  const [longTailKeywords, setLongTailKeywords] = useState<any[]>([])
  const [genericKeywords, setGenericKeywords] = useState<any[]>([])
  const [competingListings, setCompetingListings] = useState<any[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [saturScore, setSaturScore] = useState(0)
  const [trendData, setTrendData] = useState<number[]>([])
  const [totalListings, setTotalListings] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [searchOffset, setSearchOffset] = useState(0)
  const lastKeywordSearched = useRef('')
  const [marketLoading, setMarketLoading] = useState(false)

  // ── Active filters ────────────────────────────────────────────
  const [filterExclude, setFilterExclude] = useState('')   // comma-separated exclude words

  // ── Load VeRO + plan limits on mount ─────────────────────────
  useEffect(() => {
    async function loadOnMount() {
      try {
        const { data: brands } = await supabase
          .from('vero_brands')
          .select('brand_name, risk_level, keywords, evidence_url')
        if (brands) setVeroDb(brands as any[])
      } catch (e) { console.error('VeRO Load Error:', e) }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('subscription_tier, recent_titles').eq('id', user.id).single()
        const tier = (profile as any)?.subscription_tier ?? 'free'
        // Restore recent titles
        const saved = (profile as any)?.recent_titles ?? []
        if (saved.length > 0) {
          setRecentTitles(saved)
          // Auto-restore last title if title box is empty
          setTitle(saved[0])
        }
        const { data: limits } = await (supabase.from('plan_limits') as any)
          .select('max_ai_optimize, max_keyword_searches, max_competitor_extract, max_title_generations')
          .eq('tier', tier).single()
        if (limits) setPlanLimits(limits as any)

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

  async function trackUsage(toolName: 'title_builder_ai_optimize' | 'title_builder_search' | 'title_builder_extract') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
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
    } catch { }
  }

  function isAtLimit(type: 'ai_optimize' | 'keyword_search' | 'competitor_extract'): boolean {
    if (!planLimits) return false
    const limit = type === 'ai_optimize'
      ? planLimits.max_ai_optimize
      : type === 'keyword_search'
        ? planLimits.max_keyword_searches
        : planLimits.max_competitor_extract
    if (limit === -1) return false
    return limitRef.current[type] >= limit
  }

  // ── VeRO + duplicate analysis on title change ────────────────
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
        if (veroMode === 'Relaxed' && riskLevel === 'Caution') continue
        const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const nameHit = new RegExp(`\\b${escape(brand.brand_name ?? '')}\\b`, 'i').test(text)
        let keywordsHit = false
        if (brand.keywords) {
          const kws = (brand.keywords as string).split(',').map((k: string) => k.trim()).filter(Boolean)
          keywordsHit = kws.some((kw: string) => new RegExp(`\\b${escape(kw)}\\b`, 'i').test(text))
        }
        if ((nameHit || keywordsHit) && !newVero.find(f => f.name === brand.brand_name)) {
          newVero.push({ name: brand.brand_name, risk_level: riskLevel, evidence_url: brand.evidence_url ?? null })
        }
      }
    }
    setCharCount(text.length)
    setFlaggedVero(newVero)
    setFlaggedDups(newDups)
    if (autoCopy && text.length === 80) navigator.clipboard.writeText(text)
  }, [title, veroDb, autoCopy, veroMode])

  // ── handleGenerate moved to layout TitleBuilderTopBar ───────────────────

  async function handleExtract(itemId: string) {
    if (!itemId) return
    if (isAtLimit('competitor_extract')) { alert(`Competitor Extract limit reached. Upgrade to get more.`); return }
    setIsFetching(true)
    setHasSearched(true)
    try {
      const res = await fetch(`/api/ebay/item?id=${encodeURIComponent(itemId)}&purpose=title`)
      const data = await res.json()
      if (res.ok && data.title) {
        setTitle(data.title)
        if (data.categoryName) setCategoryName(data.categoryName)
        limitRef.current.competitor_extract += 1
        setUsageCounts(p => ({ ...p, competitor_extract: p.competitor_extract + 1 }))
        trackUsage('title_builder_extract')
      } else { console.error('[title-builder] Extract failed:', data.error) }
    } catch (e) { console.error('[title-builder] Extract error:', e) }
    setIsFetching(false)
  }
  handleExtractRef.current = handleExtract

  async function handleSearch(keyword: string, offset = 0) {
    if (!keyword) return
    if (isAtLimit('keyword_search')) { alert(`Keyword Search limit reached. Upgrade to get more.`); return }
    setMarketLoading(true)
    setIsFetching(true)
    setHasSearched(true)
    try {
      const marketplace = activeLocation === 'UK' ? 'EBAY_GB'
        : activeLocation === 'CA' ? 'EBAY_CA'
          : activeLocation === 'AU' ? 'EBAY_AU'
            : 'EBAY_US'
      const params = new URLSearchParams({
        keyword, marketplace, limit: '50', offset: String(offset),
      })
      // Ships From filter — pass country code to API
      if (activeShipFrom) params.set('shipFrom', activeShipFrom)
      if (activeCondition) params.set('condition', activeCondition)
      if (activeCategory) params.set('category', activeCategory)
      const res = await fetch(`/api/ebay/search?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setTrendData(data.trendData ?? [])
        setSaturScore(data.saturScore ?? 0)
        setTotalListings(data.total ?? 0)
        setHasMore(data.hasMore ?? false)
        setSearchOffset(offset)
        lastKeywordSearched.current = keyword
        // Fire detected category back to layout so dropdown updates
        // Only update if no manual category selected and detected is not default
        if (data.category && data.category !== 'default' && !activeCategory) {
          window.dispatchEvent(new CustomEvent('tb:categoryDetected', {
            detail: { category: data.category }
          }))
        }
        if (offset === 0) {
          setLongTailKeywords(data.longTailKeywords ?? [])
          setGenericKeywords(data.genericKeywords ?? [])
          setCompetingListings(data.competingListings ?? [])
        } else {
          setLongTailKeywords(p => [...p, ...(data.longTailKeywords ?? [])])
          setGenericKeywords(p => [...p, ...(data.genericKeywords ?? [])])
          setCompetingListings(p => [...p, ...(data.competingListings ?? [])])
        }
        limitRef.current.keyword_search += 1
        setUsageCounts(p => ({ ...p, keyword_search: p.keyword_search + 1 }))
        trackUsage('title_builder_search')
      }
    } catch (e) { console.error('[title-builder] Search error:', e) }
    setMarketLoading(false)
    setIsFetching(false)
  }
  handleSearchRef.current = handleSearch

  function injectKeyword(kw: string) {
    const separator = (!title || title.endsWith(' ')) ? '' : ' '
    const newTitle = `${title}${separator}${kw} `
    if (newTitle.length > 80) {
      toast.warning('Title is full — maximum 80 characters reached.')
      setTitle(title.slice(0, 80))
      return
    }
    setTitle(newTitle.slice(0, 80))
  }

  async function handleTitleCopy() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('titles_count, total_xp').eq('id', user.id).single()
      await (supabase.from('profiles') as any)
        .update({ titles_count: ((profile as any)?.titles_count ?? 0) + 1, total_xp: ((profile as any)?.total_xp ?? 0) + 3 } as any)
        .eq('id', user.id)
    } catch { }
  }

  function handleTitleChange(val: string) {
    const capped = val.slice(0, 80)
    if (val.length >= 80 && title.length < 80) {
      toast.warning('Title is full — maximum 80 characters reached.')
    }
    setTitle(autoCapitalize ? capped.replace(/\b\w/g, c => c.toUpperCase()) : capped)
  }

  return (
    <KillSwitchGate switchTitle="Title Builder">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: C.bg, fontFamily: 'Inter, sans-serif' }}>

        {/* ── MAIN 2-COLUMN WORKSPACE ── */}
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden', gap: 12, padding: 12, minHeight: 0 }}>

          {/* LEFT COLUMN — 45% */}
          <section style={{ width: '45%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            <div style={{ flexShrink: 0 }}>
              <TbStudio
                value={title}
                onChange={handleTitleChange}
                charCount={charCount}
                flaggedVero={flaggedVero}
                duplicateCount={flaggedDups.length}
                onCopy={handleTitleCopy}
                keywordContext={[...genericKeywords, ...longTailKeywords].map(k => k.kw)}
                genericKeywords={genericKeywords}
                longTailKeywords={longTailKeywords}
                competingListings={competingListings}
                aiOptimizeLimit={planLimits?.max_ai_optimize ?? null}
                aiOptimizeUsed={usageCounts.ai_optimize}
                categoryName={categoryName}
                activeLocation={activeLocation}
                recentTitles={recentTitles}
                onRestoreTitle={(t: string) => setTitle(t)}
                onAiOptimizeUsed={() => {
                  limitRef.current.ai_optimize += 1
                  setUsageCounts(p => ({ ...p, ai_optimize: p.ai_optimize + 1 }))
                  trackUsage('title_builder_ai_optimize')
                }}
              />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <TbProHud
                flaggedVero={flaggedVero}
                currentTitle={title}
                saturScore={saturScore}
                trendData={trendData}
                totalListings={totalListings}
                isLoading={marketLoading}
                topWords={genericKeywords.slice(0, 10).map(g => ({ word: g.kw, percent: `${g.comp}%`, searches: g.avgSearches ?? 0 }))}
                longTailData={longTailKeywords}
                genericData={genericKeywords}
                onInject={injectKeyword}
              />
            </div>
          </section>

          {/* RIGHT COLUMN — 55% */}
          <section style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            position: 'relative',
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            backgroundColor: C.surface,
          }}>
            <TbKeywordTables
              currentTitle={title}
              onInject={injectKeyword}
              veroDatabase={veroDb}
              longTailData={longTailKeywords}
              genericData={genericKeywords}
              competingData={competingListings}
              totalListings={totalListings}
              hasMore={hasMore}
              onLoadMore={() => handleSearch(lastKeywordSearched.current, searchOffset + 50)}
              isLoading={isFetching}
              filterExclude={filterExclude}
              hasSearched={hasSearched}
            />
          </section>

        </main>

        {/* Settings panel */}
        {showSettings && (
          <TbSettingsPanel
            autoCapitalize={autoCapitalize} onAutoCapitalizeChanged={setAutoCapitalize}
            autoCopy={autoCopy} onAutoCopyChanged={setAutoCopy}
            veroMode={veroMode} onVeroModeChanged={setVeroMode}
            filterExclude={filterExclude} onFilterExcludeChanged={setFilterExclude}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </KillSwitchGate>
  )
}
