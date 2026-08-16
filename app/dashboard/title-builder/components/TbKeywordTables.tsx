'use client'
// app/dashboard/title-builder/components/TbKeywordTables.tsx
// Converted 1:1 from lib/pages/title_builder/tb_keyword_tables.dart

import { useState, useEffect } from 'react'
import { formatSearches, formatSales } from '@/src/utils/keywordParser'
import Tooltip from '@/components/ui/Tooltip'
import { InjectButton } from '@/components/ui/Buttons'
import { Target, Lightbulb, ChevronLeft, ChevronRight, ArrowDown, ArrowUp, ChevronsUpDown, Plus, Check, Info, AlertTriangle, Search } from 'lucide-react'

const C = {
  dark: '#1e1535', lime: '#7530fb', border: '#D1D5DB',
  bg: '#F1F5F9', text: '#1E293B', muted: '#64748B',
}

interface KeywordRow {
  kw: string
  search: string
  comp: string
  sales: string
  image?: string
  url?: string
  type?: string
  sales_price?: string
  avgSearches?: number
  estSalesUnits?: number
  competition?: number
  feedbackScore?: string | null
  feedbackPct?: string | null
  soldCount?: number | null
  fullTitle?: string
}
interface VeroEntry { brand_name: string }

// ── Smart keyword cell — highlights VeRO words as red pills ──
function SmartKeyword({ keyword, veroDatabase, isCompeting = false }: { keyword: string; veroDatabase: VeroEntry[]; isCompeting?: boolean }) {
  const banned = new Set(veroDatabase.map(e => e.brand_name.toLowerCase()))
  const words = keyword.split(' ')

  if (isCompeting) {
    return (
      <p className="text-[12px] font-semibold leading-snug"
        style={{ color: C.text, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {keyword}
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {words.map((word, i) => {
        const clean = word.replace(/[^\w\s]/g, '').toLowerCase()
        if (banned.has(clean)) {
          return (
            <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded border mx-0.5"
              style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
              <AlertTriangle size={11} style={{ color: '#EF4444' }} />
              <span className="text-[12px] font-bold" style={{ color: '#EF4444' }}>{word}</span>
            </div>
          )
        }
        return (
          <span key={i} className="text-[13px] font-bold mx-0.5" style={{ color: C.text }}>{word}</span>
        )
      })}
    </div>
  )
}

// ── Sortable header ───────────────────────────────────────────

// ── Animated table row ─────────────────────────────────────────


// ── Competition Badge ─────────────────────────────────────────
function CompetitionBadge({ value }: { value?: number }) {
  if (!value) return <span className="text-[12px]" style={{ color: '#9ca3af' }}>—</span>

  const formatted = value.toLocaleString()

  const isHigh = value > 500_000
  const isMedium = value > 50_000 && !isHigh

  const color = isHigh ? '#b91c1c' : isMedium ? '#d97706' : '#16a34a'
  const bg = isHigh ? '#fef2f2' : isMedium ? '#fffbeb' : '#f0fdf4'
  const border = isHigh ? '#fecaca' : isMedium ? '#fde68a' : '#bbf7d0'

  const tooltipText = isHigh
    ? `High Competition — ${formatted} listings. Very saturated, hard to rank.`
    : isMedium
      ? `Moderate Competition — ${formatted} listings. Achievable with a good title.`
      : `Low Competition — ${formatted} listings. Great opportunity to rank.`

  return (
    <Tooltip text={tooltipText} position="top">
      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded border"
        style={{ backgroundColor: bg, color, borderColor: border }}>
        {formatted}
      </span>
    </Tooltip>
  )
}

// ── Keyword Row Item ───────────────────────────────────────────
function KeywordRowItem({ row, i, isLongTail, isCompeting, titleLower, veroDatabase, onInject, injectLongTailKeywords }: {
  row: KeywordRow; i: number
  isLongTail: boolean; isCompeting: boolean
  titleLower: string
  veroDatabase: VeroEntry[]; onInject: (kw: string) => void
  injectLongTailKeywords: (kw: string) => void
}) {
  const [hover, setHover] = useState(false)
  const isUsed = titleLower.includes(row.kw.toLowerCase())

  const compNum = parseFloat(row.comp) || 0
  const compLabel = compNum >= 66 ? 'High' : compNum >= 33 ? 'Med' : 'Low'
  const compColor = compNum >= 66
    ? { bg: '#fef2f2', text: DC.red, border: '#fecaca' }
    : compNum >= 33
      ? { bg: '#fffbeb', text: DC.amber, border: '#fde68a' }
      : { bg: '#f0fdf4', text: DC.green, border: '#bbf7d0' }

  function handleInject() {
    if (isUsed) return
    if (isLongTail || isCompeting) injectLongTailKeywords(row.kw)
    else onInject(row.kw)
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center px-4 py-2.5 border-b transition-colors"
      style={{
        borderColor: C.border,
        backgroundColor: isUsed ? '#fafafa' : hover ? '#f3eeff' : DC.surface,
        opacity: isUsed ? 0.5 : 1,
        cursor: 'default',
      }}>

      {/* Thumbnail — Competing Listings tab only */}
      {isCompeting && (
        <div className="shrink-0 mr-3" style={{ width: 34, height: 34 }}>
          {row.image ? (
            <a href={row.url || '#'} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="block w-full h-full rounded overflow-hidden transition-all"
              style={{ border: hover ? `2px solid ${'#7530fb'}` : `1px solid ${C.border}` }}>
              <img src={row.image} alt="" className="w-full h-full object-cover" />
            </a>
          ) : (
            <div className="w-full h-full rounded" style={{ backgroundColor: DC.bg }} />
          )}
        </div>
      )}

      {/* Keyword */}
      <div style={{ flex: 4, minWidth: 0, paddingRight: 8 }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isCompeting && titleLower.includes(row.kw.toLowerCase()) && (
            <span className="text-[9px] font-bold px-1 py-0.5 rounded shrink-0"
              style={{ backgroundColor: '#f0fdf4', color: DC.green, border: '1px solid #bbf7d0' }}>✓</span>
          )}
          <SmartKeyword keyword={row.kw.slice(0, 60)} veroDatabase={veroDatabase} isCompeting={isCompeting} />
          {row.type === 'phrase' && !isLongTail && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: '#eff6ff', color: DC.blue, border: `1px solid #bfdbfe` }}>
              PHRASE
            </span>
          )}
        </div>
      </div>

      {isLongTail ? (
        // Long-Tail: IN LISTINGS | COMPETITION | AVG PRICE | EST. SEARCHES | EST. SALES
        <>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <span className="text-[12px] font-semibold" style={{ color: '#7530fb' }}>
              {(() => {
                const parts = row.search.split('/')
                if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
                  return `${Math.round((Number(parts[0]) / Number(parts[1])) * 100)}%`
                }
                return row.search
              })()}
            </span>
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <CompetitionBadge value={row.competition} />
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <span className="text-[12px] font-bold" style={{ color: DC.green }}>{row.sales || row.sales_price || '—'}</span>
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            {row.avgSearches != null
              ? <span className="text-[12px] font-semibold" style={{ color: '#1e1535' }}>{formatSearches(row.avgSearches)}</span>
              : <span className="text-[12px]" style={{ color: DC.muted }}>—</span>}
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            {row.estSalesUnits != null
              ? <span className="text-[12px] font-semibold" style={{ color: '#1e1535' }}>{formatSales(row.estSalesUnits)}</span>
              : <span className="text-[12px]" style={{ color: DC.muted }}>—</span>}
          </div>
        </>
      ) : isCompeting ? (
        // Competing Listings: CONDITION | SHIPPING | PRICE | SELLER | CHARS
        <>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <span className="text-[11px]" style={{ color: DC.muted }}>{row.search || 'N/A'}</span>
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <span className="text-[11px]" style={{ color: DC.muted }}>{row.comp}</span>
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <span className="text-[12px] font-bold" style={{ color: DC.green }}>{row.sales}</span>
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            {row.feedbackScore != null ? (
              <div>
                <span className="text-[11px] font-bold" style={{ color: '#1e1535' }}>{row.feedbackScore}</span>
                {row.feedbackPct && (
                  <span className="text-[10px] ml-1" style={{ color: DC.muted }}>{row.feedbackPct}</span>
                )}
              </div>
            ) : (
              <span className="text-[11px]" style={{ color: DC.muted }}>—</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <span className="text-[11px] font-bold"
              style={{ color: (row.fullTitle ?? row.kw).length >= 75 ? DC.green : (row.fullTitle ?? row.kw).length >= 60 ? DC.amber : DC.red }}>
              {(row.fullTitle ?? row.kw).length}/80
            </span>
          </div>
        </>
      ) : (
        // Generic: IN LISTINGS % | COMPETITION | AVG PRICE | EST. SEARCHES | EST. SALES
        <>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <span className="text-[12px] font-semibold" style={{ color: '#7530fb' }}>
              {(() => {
                const parts = row.search.split('/')
                if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
                  return `${Math.round((Number(parts[0]) / Number(parts[1])) * 100)}%`
                }
                return row.search
              })()}
            </span>
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <CompetitionBadge value={row.competition} />
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            <span className="text-[12px] font-bold" style={{ color: DC.green }}>{row.sales}</span>
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            {row.avgSearches != null
              ? <span className="text-[12px] font-semibold" style={{ color: '#1e1535' }}>{formatSearches(row.avgSearches)}</span>
              : <span className="text-[12px]" style={{ color: DC.muted }}>—</span>}
          </div>
          <div style={{ flex: 2, paddingRight: 16 }}>
            {row.estSalesUnits != null
              ? <span className="text-[12px] font-semibold" style={{ color: '#1e1535' }}>{formatSales(row.estSalesUnits)}</span>
              : <span className="text-[12px]" style={{ color: DC.muted }}>—</span>}
          </div>
        </>
      )}

      {/* Inject button — only this triggers injection */}
      <div style={{ width: 72, textAlign: 'right' }}>
        <InjectButton onClick={handleInject} injected={isUsed} />
      </div>
    </div>
  )
}


interface Props {
  currentTitle: string
  onInject: (kw: string) => void
  veroDatabase: VeroEntry[]
  longTailData: KeywordRow[]
  genericData: KeywordRow[]
  competingData: KeywordRow[]
  totalListings: number
  hasMore: boolean
  onLoadMore: () => void
  isLoading: boolean
  hasSearched: boolean
  filterExclude: string
}

const DC = {
  lime: '#7530fb', dark: '#1e1535', border: '#ede9fe',
  muted: '#9ca3af', surface: '#ffffff', bg: '#f8f7ff',
  red: '#b91c1c', amber: '#d97706', green: '#16a34a', blue: '#1d4ed8', teal: '#0ea5e9',
}

export default function TbKeywordTables({
  currentTitle, onInject, veroDatabase,
  longTailData, genericData, competingData,
  totalListings, hasMore, onLoadMore, isLoading, hasSearched,
  filterExclude,
}: Props) {
  const [activeTab, setActiveTab] = useState<'longtail' | 'generic' | 'competing'>('longtail')
  const [sortCol, setSortCol] = useState('kw')
  const [sortAsc, setSortAsc] = useState(true)

  useEffect(() => { setSortCol('kw'); setSortAsc(true) }, [activeTab])

  function injectLongTailKeywords(fullTitle: string) {
    // Words to always remove — not useful keywords
    const stopWords = new Set([
      // Grammar
      'for', 'with', 'and', 'the', 'in', 'on', 'a', 'to', 'of', 'by', 'at', 'is', 'it', 'as', 'an', 'be', 'or', 'are', 'was',
      // Condition
      'new', 'used', 'refurbished', 'faulty', 'genuine', 'original', 'authentic',
      // Shipping / fulfilment
      'ships', 'shipping', 'ship', 'today', 'fast', 'free', 'dispatch', 'delivery', 'delivered', 'express', 'priority',
      // Sale / quantity words
      'lot', 'wholesale', 'bulk', 'bundle', 'sale', 'deal', 'offer', 'value', 'cheap', 'buy', 'get', 'pack', 'packs', 'pcs', 'set', 'sets', 'kit', 'kits', 'piece', 'pieces',
      // Location
      'us', 'uk', 'usa', 'seller', 'from', 'based',
      // Filler adjectives
      'best', 'top', 'great', 'good', 'nice', 'premium', 'quality', 'grade', 'pro', 'super', 'ultra', 'high', 'low',
      // Time
      'now', 'just', 'only', 'new', '2024', '2023', '2022', '2021', '2020',
      // Common eBay words
      'item', 'items', 'listing', 'brand', 'condition', 'see', 'description', 'photos', 'photo', 'pictures',
    ])

    // Words that are ALL CAPS and short = likely abbreviation/filler not brand
    const isFillerCaps = (w: string) => w === w.toUpperCase() && w.length <= 4 && !/^[A-Z][a-z]/.test(w)

    const keywords = fullTitle
      // Remove special chars and emoji, keep letters/numbers/spaces
      .replace(/[^\w\s]/g, ' ')
      // Split into words
      .split(/\s+/)
      .filter(w =>
        w.length > 2 &&                          // min 3 chars
        !/^\d/.test(w) &&                        // no words starting with digit (3Pack, 2Pcs, 100)
        !/^\d+$/.test(w) &&                      // no pure numbers
        !stopWords.has(w.toLowerCase()) &&       // not a stop word
        !isFillerCaps(w)                         // not short all-caps filler
      )
      // Remove duplicates while preserving order
      .filter((w, i, arr) => arr.findIndex(x => x.toLowerCase() === w.toLowerCase()) === i)
      .slice(0, 4)
      .join(' ')

    if (keywords) onInject(keywords)
  }

  const excludeSet = new Set(
    filterExclude.split(',').map(w => w.trim().toLowerCase()).filter(Boolean)
  )

  function applyClientFilters(data: KeywordRow[]): KeywordRow[] {
    return data.filter(row => {
      if (excludeSet.size > 0) {
        const kw = row.kw.toLowerCase()
        if ([...excludeSet].some(ex => kw.includes(ex))) return false
      }
      return true
    })
  }

  const activeData = activeTab === 'longtail'
    ? applyClientFilters(longTailData)
    : activeTab === 'generic'
      ? applyClientFilters(genericData)
      : competingData

  const titleLower = currentTitle.toLowerCase()
  const isLongTail = activeTab === 'longtail'
  const isCompeting = activeTab === 'competing'

  const sorted = [...activeData].sort((a, b) => {
    if (sortCol === 'kw') return sortAsc ? a.kw.localeCompare(b.kw) : b.kw.localeCompare(a.kw)
    const va = parseFloat(String(a[sortCol as keyof KeywordRow] ?? '').replace(/[^0-9.]/g, '')) || 0
    const vb = parseFloat(String(b[sortCol as keyof KeywordRow] ?? '').replace(/[^0-9.]/g, '')) || 0
    return sortAsc ? va - vb : vb - va
  })

  function handleSort(col: string) {
    if (sortCol === col) setSortAsc(p => !p)
    else { setSortCol(col); setSortAsc(true) }
  }

  // ── Welcome state — shown before first search or after reset ────
  if (!hasSearched && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#f3eeff' }}>
          <Search size={20} style={{ color: '#7530fb' }} />
        </div>
        <p className="text-[13px] font-semibold" style={{ color: '#1e1535' }}>
          Search a keyword to get started
        </p>
        <p className="text-[12px]" style={{ color: '#9ca3af' }}>
          Paste a keyword or competitor ID above and click Generate
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin mb-3"
          style={{ borderTopColor: '#7530fb' }} />
        <p className="text-[13px] font-medium" style={{ color: '#7530fb' }}>Fetching live keyword data...</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── TABS — 3 tabs with count badges ── */}
      <div className="flex shrink-0" style={{ borderBottom: '2px solid #7530fb', backgroundColor: '#f3eeff', borderRadius: '12px 12px 0 0' }}>
        {([
          {
            key: 'longtail',
            label: 'Long-Tail Keywords',
            count: longTailData.length,
            tooltip: '2-3 word phrases from competing listings. Inject directly into your title to match real buyer searches.',
          },
          {
            key: 'generic',
            label: 'Generic Keywords',
            count: genericData.length,
            tooltip: 'Single high-frequency words from competing titles. Use to fill gaps and boost title searchability.',
          },
          {
            key: 'competing',
            label: 'Competing Listings',
            count: competingData.length,
            tooltip: 'Real live eBay listings for this keyword. Click any thumbnail to view the full listing on eBay.',
          },
        ] as const).map(({ key, label, count, tooltip }) => {
          const isActive = activeTab === key
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 px-4 py-3 text-[12px] font-bold relative transition-all whitespace-nowrap"
              style={{
                color: isActive ? '#7530fb' : DC.muted,
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                borderRadius: isActive ? '10px 10px 0 0' : 0,
                borderTop: isActive ? `2px solid #7530fb` : '2px solid transparent',
                borderLeft: isActive ? `2px solid #7530fb` : '2px solid transparent',
                borderRight: isActive ? `2px solid #7530fb` : '2px solid transparent',
                borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
                marginBottom: isActive ? '-2px' : 0,
              }}>
              {label}
              {count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? '#7530fb' : C.border,
                    color: isActive ? '#ffffff' : DC.muted,
                  }}>
                  {count}
                </span>
              )}
              <Tooltip text={tooltip} position="top">
                <span onClick={e => e.stopPropagation()}
                  style={{ color: isActive ? '#7530fb' : DC.muted, display: 'flex', alignItems: 'center' }}>
                  <Info size={11} />
                </span>
              </Tooltip>
            </button>
          )
        })}
      </div>

      {/* ── TABLE HEADER ── */}
      <div className="flex items-center px-4 py-3 border-b shrink-0"
        style={{ backgroundColor: 'transparent', borderColor: '#ede9fe', borderBottomWidth: 1 }}>

        {/* Thumbnail spacer for competing tab — must match image(34) + mr-3(12) = 46 */}
        {isCompeting && <div style={{ width: 46, flexShrink: 0 }} />}

        {/* KEYWORD column */}
        <div style={{ flex: 4, minWidth: 0, paddingRight: 8 }}>
          <Tooltip text={isCompeting ? 'Competing listing title on eBay. Click image to view.' : 'Keyword extracted from competing listings.'} position="top">
            <button onClick={() => handleSort('kw')}
              className="flex items-center gap-1 text-[10px] font-black tracking-widest uppercase"
              style={{ color: '#1e1535' }}>
              Keyword
              {sortCol === 'kw' ? (sortAsc ? <ArrowDown size={11} /> : <ArrowUp size={11} />) : <ChevronsUpDown size={11} />}
            </button>
          </Tooltip>
        </div>

        {isLongTail ? (
          // Long-Tail columns: IN LISTINGS | COMPETITION | AVG PRICE | EST. SEARCHES | EST. SALES
          <>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="How many fetched listings contain this keyword." position="top">
                <button onClick={() => handleSort('search')}
                  className="flex items-center gap-1 text-[10px] font-black tracking-widest uppercase"
                  style={{ color: '#1e1535' }}>
                  In Listings
                  {sortCol === 'search' ? (sortAsc ? <ArrowDown size={11} /> : <ArrowUp size={11} />) : <ChevronsUpDown size={11} />}
                </button>
              </Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="Total eBay listings for this keyword. Green = low, Amber = moderate, Red = high." position="top">
                <button onClick={() => handleSort('competition')}
                  className="flex items-center gap-1 text-[10px] font-black tracking-widest uppercase"
                  style={{ color: '#1e1535' }}>
                  Competition
                  {sortCol === 'competition' ? (sortAsc ? <ArrowDown size={11} /> : <ArrowUp size={11} />) : <ChevronsUpDown size={11} />}
                </button>
              </Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="Avg price of listings with this keyword." position="top"><span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Avg Price</span></Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="~ Estimated monthly searches. Based on listing density — not real eBay data." position="top"><span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Est. Searches</span></Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="~ Estimated monthly sales. Derived from search volume — not real eBay data." position="top"><span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Est. Sales</span></Tooltip>
            </div>
          </>
        ) : isCompeting ? (
          // Competing Listings columns: CONDITION | SHIPPING | PRICE | SELLER
          <>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="Item condition listed by the seller." position="top">
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Condition</span>
              </Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="Shipping cost for this listing." position="top">
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Shipping</span>
              </Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="Current listing price." position="top">
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Price</span>
              </Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="Seller's total feedback count and positive rating %. Higher = more trusted." position="top">
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Seller</span>
              </Tooltip>
            </div>
            <div style={{ flex: 1 }}>
              <Tooltip text="Title length. Green = optimised (75+), amber = ok (60-74), red = too short." position="top">
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Chars</span>
              </Tooltip>
            </div>
          </>
        ) : (
          // Generic columns: IN LISTINGS | COMPETITION | AVG PRICE | EST. SEARCHES | EST. SALES
          <>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="How many fetched listings contain this keyword." position="top">
                <button onClick={() => handleSort('search')}
                  className="flex items-center gap-1 text-[10px] font-black tracking-widest uppercase"
                  style={{ color: '#1e1535' }}>
                  In Listings
                  {sortCol === 'search' ? (sortAsc ? <ArrowDown size={11} /> : <ArrowUp size={11} />) : <ChevronsUpDown size={11} />}
                </button>
              </Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="Total eBay listings for this keyword. Green = low, Amber = moderate, Red = high." position="top">
                <button onClick={() => handleSort('competition')}
                  className="flex items-center gap-1 text-[10px] font-black tracking-widest uppercase"
                  style={{ color: '#1e1535' }}>
                  Competition
                  {sortCol === 'competition' ? (sortAsc ? <ArrowDown size={11} /> : <ArrowUp size={11} />) : <ChevronsUpDown size={11} />}
                </button>
              </Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="Avg price of listings with this keyword." position="top"><span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Avg Price</span></Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="~ Estimated monthly searches. Based on listing density — not real eBay data." position="top"><span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Est. Searches</span></Tooltip>
            </div>
            <div style={{ flex: 2, paddingRight: 16 }}>
              <Tooltip text="~ Estimated monthly sales. Derived from search volume — not real eBay data." position="top"><span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Est. Sales</span></Tooltip>
            </div>
          </>
        )}

        <div style={{ width: 72, textAlign: 'center' }}>
          <Tooltip text="Click to inject this keyword into your title." position="left"><span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#1e1535' }}>Action</span></Tooltip>
        </div>
      </div>

      {/* ── ROWS ── explicit height so it scrolls without pushing page down */}
      <div style={{
        overflowY: 'auto',
        backgroundColor: DC.surface,
        flexShrink: 1,
        minHeight: 0,
        flex: '1 1 0px',
      }}>
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[13px]" style={{ color: DC.muted }}>No keywords found.</p>
          </div>
        ) : sorted.map((row, i) => (
          <KeywordRowItem
            key={`${row.kw}-${i}`}
            row={row}
            i={i}
            isLongTail={isLongTail}
            isCompeting={isCompeting}
            titleLower={titleLower}
            veroDatabase={veroDatabase}
            onInject={onInject}
            injectLongTailKeywords={injectLongTailKeywords}
          />
        ))}
      </div>

      {/* ── BOTTOM STATS + PAGINATION ── */}
      <div className="flex items-center justify-between px-4 py-1 border-t shrink-0"
        style={{ backgroundColor: '#f3eeff', borderColor: '#ddd6fe', borderTopWidth: 2 }}>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold" style={{ color: '#1e1535' }}>
            Showing 1–{sorted.length} of {sorted.length}{' '}
            {activeTab === 'longtail' ? 'phrases' : activeTab === 'competing' ? 'listings' : 'keywords'}
          </span>
          {totalListings > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#b8fa33', color: '#1e1535' }}>
              {totalListings >= 1000000
                ? `${(totalListings / 1000000).toFixed(1)}M`
                : totalListings >= 1000
                  ? `${(totalListings / 1000).toFixed(1)}K`
                  : totalListings} total eBay listings
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button disabled={true}
            className="p-1 rounded transition-all opacity-30"
            style={{ color: '#1e1535' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={hasMore ? onLoadMore : undefined}
            disabled={!hasMore}
            className="p-1 rounded transition-all hover:opacity-70 disabled:opacity-30"
            style={{ color: '#1e1535' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
