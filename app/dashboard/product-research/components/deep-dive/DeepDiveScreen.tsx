'use client'
// app/dashboard/product-research/components/deep-dive/DeepDiveScreen.tsx
// Converted 1:1 from lib/pages/product_research/deep_dive/deep_dive_screen.dart

import { useState, useEffect } from 'react'
import NeonIcon            from '../shared/NeonIcon'
import UniversalScanButton from '../shared/UniversalScanButton'
import AnimatedActionButton from '../shared/AnimatedActionButton'
import CompetitorXrayCard  from './CompetitorXrayCard'
import VelocityChartCard   from './VelocityChartCard'
import ProfitCalculatorCard from './ProfitCalculatorCard'
import SourcingIntelCard   from './SourcingIntelCard'
import AiListingCard       from './AiListingCard'
import { Search, Save, Download, Table, Zap } from 'lucide-react'

const C = { text: '#1E293B', muted: '#64748B', border: '#D1D5DB', white: '#FFFFFF', lime: '#8FFF00' }

interface ScrapedData {
  title:          string
  price:          string
  rawPrice:       number
  imageUrl:       string
  seller:         string
  totalSold:      string
  stockLeft:      string
  veroRisk:       string
  keywords:       string
  optimizedTitle: string
  suggestedPrice: string
}

interface Props {
  productUrl: string
}

export default function DeepDiveScreen({ productUrl }: Props) {
  const [inputVal,    setInputVal]    = useState(productUrl)
  const [isScraping,  setIsScraping]  = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)

  // Auto-start if productUrl given (matches Dart initState)
  useEffect(() => {
    if (productUrl) startScrapingEngine(productUrl)
  }, [])

  // â”€â”€ Scraping engine (matches Dart _startScrapingEngine) â”€â”€â”€â”€â”€â”€
  async function startScrapingEngine(url: string) {
    setIsScraping(true)
    // Simulate 2s scraper delay (matches Dart Future.delayed 2s)
    await new Promise(r => setTimeout(r, 2000))
    setScrapedData({
      title:          url.includes('mouse') ? 'Wireless Gaming Mouse' : 'Dynamic Scraped Product',
      price:          '$39.99',
      rawPrice:       39.99,
      imageUrl:       'https://m.media-amazon.com/images/I/61KxT3YVvVL._AC_SX679_.jpg',
      seller:         'EbayProStore',
      totalSold:      '1,425',
      stockLeft:      '2 Left (Low)',
      veroRisk:       'LOW (Safe)',
      keywords:       '"Wireless", "Bluetooth", "Pro"',
      optimizedTitle: 'Premium Dynamic Scraped Product - Free Shipping',
      suggestedPrice: '$38.50',
    })
    setIsScraping(false)
  }

  // â”€â”€ Loading state (matches Dart _buildLoadingState) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function LoadingState() {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <div className="w-10 h-10 rounded-full border-2 animate-spin"
             style={{ borderColor: C.lime, borderTopColor: 'transparent' }} />
        <p className="text-[18px] font-bold" style={{ color: C.text }}>
          ðŸ¤– AI is scraping this eBay listing...
        </p>
        <p className="text-[14px] text-center" style={{ color: C.muted }}>
          Analyzing competitors, stock levels, and VERO risk for:<br />
          <span className="font-semibold">{inputVal}</span>
        </p>
      </div>
    )
  }

  // â”€â”€ Analyzed data layout (matches Dart _buildAnalyzedData) â”€â”€â”€
  function AnalyzedData() {
    if (!scrapedData) return null
    return (
      <div className="flex flex-col gap-5 flex-1 overflow-hidden">

        {/* Top row â€” flex 4: CompetitorXray(2) + VelocityChart(3) */}
        <div className="flex gap-5" style={{ flex: 4 }}>
          <div style={{ flex: 2 }}>
            <CompetitorXrayCard
              title={scrapedData.title}
              price={scrapedData.price}
              imageUrl={scrapedData.imageUrl}
              seller={scrapedData.seller}
            />
          </div>
          <div style={{ flex: 3 }}>
            <VelocityChartCard totalSold={scrapedData.totalSold} />
          </div>
        </div>

        {/* Bottom row â€” flex 5: ProfitCalc + SourcingIntel + AiListing */}
        <div className="flex gap-5" style={{ flex: 5 }}>
          <div className="flex-1">
            <ProfitCalculatorCard salePrice={scrapedData.rawPrice} />
          </div>
          <div className="flex-1">
            <SourcingIntelCard
              stockLeft={scrapedData.stockLeft}
              veroRisk={scrapedData.veroRisk}
              keywords={scrapedData.keywords}
            />
          </div>
          <div className="flex-1">
            <AiListingCard
              optimizedTitle={scrapedData.optimizedTitle}
              suggestedPrice={scrapedData.suggestedPrice}
            />
          </div>
        </div>

        {/* Quick actions row */}
        <div className="flex items-center justify-end gap-2.5 pb-1">
          <Zap size={19} style={{ color: '#F59E0B' }} />
          <p className="text-[13px] font-bold mr-2" style={{ color: C.muted }}>QUICK ACTIONS:</p>
          <AnimatedActionButton icon={Save}     label="Save"   onTap={() => {}} />
          <AnimatedActionButton icon={Download} label="Images" onTap={() => {}} />
          <AnimatedActionButton icon={Table}    label="CSV"    onTap={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 gap-5">

      {/* Top bar â€” NeonIcon + title + search input */}
      <div className="flex items-center gap-4">
        <NeonIcon icon={Search} />
        <p className="text-[24px] font-bold" style={{ color: C.text }}>Deep Dive Analysis</p>
        <div className="flex-1" />

        {/* Search input â€” width:500 height:50 matches Dart */}
        <div className="flex items-center rounded-xl border overflow-hidden"
             style={{ width: 500, height: 50, backgroundColor: C.white, borderColor: C.border }}>
          <input value={inputVal} onChange={e => setInputVal(e.target.value)}
            placeholder="Paste eBay link..."
            className="flex-1 px-5 text-[14px] outline-none bg-transparent"
            style={{ color: C.text }} />
          <UniversalScanButton text="SCAN ITEM" width={120}
            onTap={() => { if (inputVal.trim()) startScrapingEngine(inputVal) }} />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {isScraping
          ? <LoadingState />
          : scrapedData === null
            ? <div className="flex items-center justify-center h-full">
                <p className="text-[15px]" style={{ color: C.muted }}>Paste an eBay link to begin analysis.</p>
              </div>
            : <AnalyzedData />}
      </div>
    </div>
  )
}
