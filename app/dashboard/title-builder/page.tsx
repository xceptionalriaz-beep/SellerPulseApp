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

  // ── Extract item ID (matches Dart _handleExtract) ────────────
  async function handleExtract(itemId: string) {
    if (!itemId) return
    setIsFetching(true)
    await new Promise(r => setTimeout(r, 2000)) // simulate API
    setTitle(`Extracted Title for Item ${itemId}`)
    setIsFetching(false)
  }

  // ── Search keyword (matches Dart _handleSearch + MarketProvider.updateSearch) ──
  async function handleSearch(keyword: string) {
    if (!keyword) return

    // Update MarketProvider equivalent — simulate market data
    setMarketLoading(true)
    setIsFetching(true)

    await new Promise(r => setTimeout(r, 2000)) // simulate API

    // Mock trend data + saturation score
    setTrendData([12,18,15,22,19,25,20,28,24,30,27,35])
    setSaturScore(Math.random() * 0.8 + 0.1)
    setMarketLoading(false)

    // Keyword tables data (matches Dart mock data)
    setLongTailKeywords([
      { kw: `${keyword} pro max`,       search: '25,400', comp: '120', sales: '890'   },
      { kw: `Genuine ${keyword} oem`,   search: '18,200', comp: '80',  sales: '450'   },
      { kw: `${keyword} black edition`, search: '12,100', comp: '45',  sales: '210'   },
      { kw: `Fast ${keyword} usb-c`,    search: '9,800',  comp: '30',  sales: '195'   },
    ])
    setGenericKeywords([
      { kw: keyword,    search: '45,000', comp: '500', sales: '1,200' },
      { kw: 'Adapter',  search: '30,000', comp: '200', sales: '600'   },
      { kw: 'Premium',  search: '15,000', comp: '100', sales: '300'   },
    ])
    setIsFetching(false)
  }

  // ── Inject keyword (matches Dart injectKeyword) ───────────────
  function injectKeyword(kw: string) {
    const separator = (!title || title.endsWith(' ')) ? '' : ' '
    const newText   = `${title}${separator}${kw} `
    setTitle(newText)
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

        {/* Studio + HUD — desktop: side by side (65/35), mobile: stacked */}
        <div className="flex flex-col xl:flex-row gap-5">
          <div style={{ flex: 65 }}>
            <TbStudio
              value={title}
              onChange={handleTitleChange}
              charCount={charCount}
              veroCount={flaggedVero.length}
              duplicateCount={flaggedDups.length}
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
  )
}