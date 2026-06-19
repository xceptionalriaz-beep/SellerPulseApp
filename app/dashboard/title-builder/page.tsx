'use client'
// app/dashboard/title-builder/page.tsx
// Converted 1:1 from lib/pages/title_builder/title_builder_main.dart

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import TbTopBar        from './components/TbTopBar'
import TbStudio        from './components/TbStudio'
import TbProHud        from './components/TbProHud'
import TbKeywordTables from './components/TbKeywordTables'
import TbSettingsPanel from './components/TbSettingsPanel'
import KillSwitchGate from '@/components/KillSwitchGate'

const supabase = createClient()

export default function TitleBuilderPage() {

  // ── Title state ──────────────────────────────────────────────
  const [title,       setTitle]       = useState('')
  const [charCount,   setCharCount]   = useState(0)
  const [flaggedVero, setFlaggedVero] = useState<string[]>([])
  const [flaggedDups, setFlaggedDups] = useState<string[]>([])
  const [veroDb,      setVeroDb]      = useState<any[]>([])

  // ── Master filters ───────────────────────────────────────────
  const [activeTimeframe, setActiveTimeframe] = useState('30D')
  const [activeMarket,    setActiveMarket]    = useState('eBay')
  const [activeLocation,  setActiveLocation]  = useState('US')

  // ── Settings ─────────────────────────────────────────────────
  const [autoCapitalize, setAutoCapitalize] = useState(true)
  const [autoCopy,       setAutoCopy]       = useState(false)
  const [veroMode,       setVeroMode]       = useState('Strict')
  const [showSettings,   setShowSettings]   = useState(false)

  // ── Keyword data ─────────────────────────────────────────────
  const [isFetching,       setIsFetching]       = useState(false)
  const [longTailKeywords, setLongTailKeywords] = useState<any[]>([])
  const [genericKeywords,  setGenericKeywords]  = useState<any[]>([])

  // ── MarketProvider data (replaces Dart Consumer<MarketProvider>) ──
  const [saturScore, setSaturScore] = useState(0)
  const [trendData,  setTrendData]  = useState<number[]>([])
  const [marketLoading, setMarketLoading] = useState(false)

  // ── Load VeRO database on mount ───────────────────────────────
  useEffect(() => {
    async function loadVeroDb() {
      try {
        const { data } = await supabase.from('vero_brands').select('brand_name, risk_level')
        if (data) setVeroDb(data as any[])
      } catch (e) { console.error('VeRO Load Error:', e) }
    }
    loadVeroDb()
  }, [])

  // ── Analyze title on change (matches Dart _analyzeTitle) ─────
  useEffect(() => {
    const text  = title
    const words = text.toLowerCase().split(/\s+/).filter(Boolean)

    const newDups:  string[] = []
    const newVero:  string[] = []
    const seen = new Set<string>()
    const skipWords = new Set(['for','with','and','the','in','on','a','to','of'])

    for (const word of words) {
      if (skipWords.has(word)) continue
      if (seen.has(word) && !newDups.includes(word)) newDups.push(word)
      seen.add(word)
    }

    if (veroDb.length > 0) {
      for (const brand of veroDb) {
        const name = brand.brand_name?.toString() ?? ''
        if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`, 'i').test(text)) {
          newVero.push(name)
        }
      }
    }

    setCharCount(text.length)
    setFlaggedVero(newVero)
    setFlaggedDups(newDups)

    // Auto-copy at 80 chars (matches Dart autoCopy setting)
    if (autoCopy && text.length === 80) {
      navigator.clipboard.writeText(text)
    }
  }, [title, veroDb, autoCopy])

  // ── Extract item ID — real eBay API ──────────────────────────
  async function handleExtract(itemId: string) {
    if (!itemId) return
    setIsFetching(true)
    try {
      const res  = await fetch(`/api/ebay/item?id=${encodeURIComponent(itemId)}&purpose=title`)
      const data = await res.json()
      if (res.ok && data.title) {
        setTitle(data.title)
      } else {
        console.error('[title-builder] Extract failed:', data.error)
      }
    } catch (e) { console.error('[title-builder] Extract error:', e) }
    setIsFetching(false)
  }

  // ── Search keyword — real eBay API ────────────────────────────
  async function handleSearch(keyword: string) {
    if (!keyword) return
    setMarketLoading(true)
    setIsFetching(true)
    try {
      const marketplace = activeMarket === 'eBay UK' ? 'EBAY_GB'
        : activeMarket === 'eBay AU' ? 'EBAY_AU'
        : activeMarket === 'eBay DE' ? 'EBAY_DE'
        : 'EBAY_US'

      const res  = await fetch(
        `/api/ebay/search?keyword=${encodeURIComponent(keyword)}&marketplace=${marketplace}&limit=20`
      )
      const data = await res.json()

      if (res.ok) {
        setTrendData(data.trendData ?? [])
        setSaturScore(data.saturScore ?? 0)
        setLongTailKeywords(data.longTailKeywords ?? [])
        setGenericKeywords(data.genericKeywords ?? [])
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
    const newText   = `${title}${separator}${kw} `
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
          total_xp:     ((profile as any)?.total_xp     ?? 0) + 3,
        } as any)
        .eq('id', user.id)
    } catch { /* non-critical */ }
  }

  // ── Title change handler with auto-capitalize ─────────────────
  function handleTitleChange(val: string) {
    // Auto-capitalize if setting is on (matches Dart autoCapitalize)
    if (autoCapitalize) {
      const capitalized = val.replace(/\b\w/g, c => c.toUpperCase())
      setTitle(capitalized)
    } else {
      setTitle(val)
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
            selectedTimeframe={activeTimeframe}   onTimeframeChanged={setActiveTimeframe}
            selectedMarket={activeMarket}         onMarketChanged={setActiveMarket}
            selectedLocation={activeLocation}     onLocationChanged={setActiveLocation}
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
                veroCount={flaggedVero.length}
                duplicateCount={flaggedDups.length}
                onCopy={handleTitleCopy}
              />
            </div>
            <div style={{ flex: 35 }}>
              <TbProHud
                veroCount={flaggedVero.length}
                currentTitle={title}
                timeframe={activeTimeframe}
                saturScore={saturScore}
                trendData={trendData}
                isLoading={marketLoading}
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
            autoCapitalize={autoCapitalize}  onAutoCapitalizeChanged={setAutoCapitalize}
            autoCopy={autoCopy}              onAutoCopyChanged={setAutoCopy}
            veroMode={veroMode}              onVeroModeChanged={setVeroMode}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </KillSwitchGate>
  )
}