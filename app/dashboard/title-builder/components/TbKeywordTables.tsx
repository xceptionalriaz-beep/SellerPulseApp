'use client'
// app/dashboard/title-builder/components/TbKeywordTables.tsx
// Converted 1:1 from lib/pages/title_builder/tb_keyword_tables.dart

import { useState, useEffect } from 'react'
import { Target, Lightbulb, ChevronLeft, ChevronRight, ArrowDown, ArrowUp, ChevronsUpDown, Plus, Check, AlertTriangle } from 'lucide-react'

const C = {
  dark: '#1a2410', lime: '#8FFF00', border: '#D1D5DB',
  bg: '#F1F5F9', text: '#1E293B', muted: '#64748B',
}

interface KeywordRow {
  kw: string
  search: string
  comp: string
  sales: string
  image?: string   // thumbnail for Long Tail rows
  url?: string   // eBay listing URL for Long Tail rows
  type?: string   // 'phrase' | 'word' for Generic rows
}
interface VeroEntry { brand_name: string }

// ── Smart keyword cell — highlights VeRO words as red pills ──
function SmartKeyword({ keyword, veroDatabase }: { keyword: string; veroDatabase: VeroEntry[] }) {
  const banned = new Set(veroDatabase.map(e => e.brand_name.toLowerCase()))
  const words = keyword.split(' ')

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
function SortableHeader({ title, colKey, sortCol, sortAsc, onSort }: {
  title: string; colKey: string; sortCol: string; sortAsc: boolean; onSort: (k: string) => void
}) {
  const active = sortCol === colKey
  const Icon = active ? (sortAsc ? ArrowDown : ArrowUp) : ChevronsUpDown
  return (
    <button onClick={() => onSort(colKey)}
      className="flex items-center gap-1 text-[11px] font-extrabold tracking-[0.8px]"
      style={{ color: active ? '#2563EB' : C.muted }}>
      {title}
      <Icon size={13} style={{ color: active ? '#2563EB' : '#94A3B8' }} />
    </button>
  )
}

// ── Animated table row ─────────────────────────────────────────
function TableRow({ row, isEven, isUsed, onInject, veroDatabase, showCompBar, compScale, showImage }: {
  row: KeywordRow; isEven: boolean; isUsed: boolean
  onInject: () => void; veroDatabase: VeroEntry[]
  showCompBar: boolean; compScale: number
  showImage?: boolean   // true for Long Tail rows
}) {
  const [hover, setHover] = useState(false)

  const compVal = parseInt(row.comp.replace(/,/g, '')) || 0
  const compRatio = Math.min(compVal / compScale, 1)
  const heatColor = compRatio < 0.33 ? '#16A34A' : compRatio < 0.66 ? '#F97316' : '#EF4444'

  const bgColor = isUsed ? '#F3F4F6' : hover ? '#F0FDF4' : isEven ? '#fff' : '#F8FAFC'
  const opacity = isUsed ? 0.4 : 1

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={() => !isUsed && onInject()}
      className="flex items-center px-4 py-3 border-b transition-all"
      style={{ backgroundColor: bgColor, borderColor: '#F3F4F6', opacity, cursor: isUsed ? 'default' : 'pointer' }}>

      {/* Thumbnail — only for Long Tail rows. Click opens the eBay listing. */}
      {showImage && (
        <div className="shrink-0 mr-3" style={{ width: 40, height: 40 }}>
          {row.image ? (
            <a href={row.url || '#'} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              title="View on eBay"
              className="block w-full h-full rounded-md overflow-hidden transition-all"
              style={{
                border: hover ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                boxShadow: hover ? '0 0 0 2px rgba(59,130,246,0.2)' : 'none',
                cursor: 'pointer',
              }}>
              <img src={row.image} alt="" className="w-full h-full object-cover" />
            </a>
          ) : (
            <div className="w-full h-full rounded-md" style={{ backgroundColor: '#F3F4F6' }} />
          )}
        </div>
      )}

      {/* Keyword — flex 4 */}
      <div style={{ flex: 4, minWidth: 0, paddingRight: 8 }}>
        <div className="flex items-start gap-1.5 flex-wrap">
          <SmartKeyword keyword={row.kw} veroDatabase={veroDatabase} />
          {/* Phrase badge for bigrams in Generic table */}
          {row.type === 'phrase' && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
              PHRASE
            </span>
          )}
        </div>
      </div>

      {/* Searches — flex 2 */}
      <div style={{ flex: 2 }}>
        {(() => {
          const parts = row.search.split('/')
          if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
            const n = Number(parts[0]), total = Number(parts[1])
            const pct = total > 0 ? Math.round((n / total) * 100) : 0
            return (
              <span className="text-[13px] font-semibold"
                style={{ color: C.muted }}
                title={`Found in ${n} of ${total} listings scanned`}>
                {pct}%
              </span>
            )
          }
          return <span className="text-[13px]" style={{ color: C.muted }}>{row.search}</span>
        })()}
      </div>

      {/* Competition — flex 2 */}
      <div style={{ flex: 2 }}>
        <p className="text-[13px] font-bold mb-1" style={{ color: C.text }}>
          {showCompBar ? `${row.comp}%` : row.comp}
        </p>
        {showCompBar && (
          <div className="h-1 rounded-full overflow-hidden" style={{ width: 40, backgroundColor: '#E5E7EB' }}>
            <div className="h-full rounded-full" style={{ width: `${compRatio * 100}%`, backgroundColor: heatColor }} />
          </div>
        )}
      </div>

      {/* Sales — flex 2 */}
      <div style={{ flex: 2 }}>
        <span className="text-[13px] font-bold" style={{ color: '#16A34A' }}>{row.sales}</span>
      </div>

      {/* Inject button — 30px fixed */}
      <div style={{ width: 30 }}>
        <div className={`p-1 rounded-md transition-opacity ${(isUsed || hover) ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundColor: isUsed ? '#D1D5DB' : C.lime,
            boxShadow: isUsed ? 'none' : `0 0 5px rgba(143,255,0,0.5)`,
          }}>
          {isUsed
            ? <Check size={15} style={{ color: '#9CA3AF' }} />
            : <Plus size={15} style={{ color: C.dark }} />}
        </div>
      </div>
    </div>
  )
}

// ── SmartKeywordTable ─────────────────────────────────────────
function SmartKeywordTable({ title, icon: Icon, initialData, currentTitle, onInject, veroDatabase, columnLabels, showCompBar = true, compScale = 100, showImage = false }: {
  title: string; icon: React.ElementType
  initialData: KeywordRow[]; currentTitle: string
  onInject: (kw: string) => void; veroDatabase: VeroEntry[]
  columnLabels: { search: string; comp: string; sales: string }
  showCompBar?: boolean; compScale?: number
  showImage?: boolean
}) {
  const [data, setData] = useState<KeywordRow[]>([...initialData])
  const [sortCol, setSortCol] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  // Update table when new data arrives (matches Dart didUpdateWidget)
  useEffect(() => {
    setData([...initialData])
    setPage(1)
  }, [initialData])

  function handleSort(col: string) {
    const newAsc = sortCol === col ? !sortAsc : true
    setSortCol(col); setSortAsc(newAsc); setPage(1)
    setData(prev => [...prev].sort((a, b) => {
      if (col === 'kw') {
        return newAsc ? a.kw.localeCompare(b.kw) : b.kw.localeCompare(a.kw)
      }
      const va = parseFloat((a[col as keyof KeywordRow] ?? '').replace(/[^0-9.]/g, '')) || 0
      const vb = parseFloat((b[col as keyof KeywordRow] ?? '').replace(/[^0-9.]/g, '')) || 0
      return newAsc ? vb - va : va - vb
    }))
  }

  const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE))
  const start = (page - 1) * PER_PAGE
  const pageData = data.slice(start, start + PER_PAGE)
  const titleLower = currentTitle.toLowerCase()

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ borderColor: C.border, borderWidth: 2, boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>

      {/* Dark header */}
      <div className="flex items-center gap-2.5 px-5 py-4"
        style={{ backgroundColor: C.dark, borderRadius: '10px 10px 0 0' }}>
        <Icon size={19} style={{ color: C.lime }} />
        <p className="flex-1 text-[14px] font-black text-white tracking-[1.2px] truncate">{title}</p>
        <span className="text-[10px] font-bold hidden lg:block"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
            padding: '2px 10px', borderRadius: 20
          }}>
          Hover to Inject
        </span>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-5 py-3.5 border-b"
        style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <div style={{ flex: 4 }}><SortableHeader title="KEYWORD" colKey="kw" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></div>
        <div style={{ flex: 2 }}><SortableHeader title={columnLabels.search} colKey="search" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></div>
        <div style={{ flex: 2 }}><SortableHeader title={columnLabels.comp} colKey="comp" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></div>
        <div style={{ flex: 2 }}><SortableHeader title={columnLabels.sales} colKey="sales" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></div>
        <div style={{ width: 30 }} />
      </div>

      {/* Rows */}
      {data.length === 0 ? (
        <div className="flex justify-center py-10">
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>No keywords found.</p>
        </div>
      ) : pageData.map((row, i) => (
        <TableRow key={`${row.kw}-${i}`} row={row}
          isEven={i % 2 === 0}
          isUsed={titleLower.includes(row.kw.toLowerCase())}
          onInject={() => onInject(row.kw)}
          veroDatabase={veroDatabase}
          showCompBar={showCompBar}
          compScale={compScale}
          showImage={showImage}
        />
      ))}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 p-4 border-t" style={{ borderColor: '#E5E7EB' }}>
        <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
          className="p-1 rounded disabled:opacity-30">
          <ChevronLeft size={20} style={{ color: '#3B82F6' }} />
        </button>
        <p className="text-[13px] font-bold" style={{ color: '#64748B' }}>
          Page {page} of {totalPages}
        </p>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
          className="p-1 rounded disabled:opacity-30">
          <ChevronRight size={20} style={{ color: '#3B82F6' }} />
        </button>
      </div>
    </div>
  )
}

// ── Main TbKeywordTables ──────────────────────────────────────
interface Props {
  currentTitle: string
  onInject: (kw: string) => void
  veroDatabase: VeroEntry[]
  longTailData: KeywordRow[]
  genericData: KeywordRow[]
  isLoading: boolean
}

export default function TbKeywordTables({ currentTitle, onInject, veroDatabase, longTailData, genericData, isLoading }: Props) {

  // Loading state — matches Dart beautiful loading UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: 400 }}>
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin mb-5"
          style={{ borderTopColor: C.lime }} />
        <p className="text-[14px] font-bold" style={{ color: '#4B5563' }}>
          Fetching Live Keyword Data...
        </p>
      </div>
    )
  }

  // Fix 7: for Long Tail rows (which are full competing listing titles),
  // extract the top meaningful keywords instead of injecting the whole title.
  // Stop words + short words are filtered; we take the first 3 survivors.
  function injectLongTailKeywords(fullTitle: string) {
    const stop = new Set(['for', 'with', 'and', 'the', 'in', 'on', 'a', 'to', 'of', 'by', 'at', 'is', 'it', 'as', 'an', 'be', 'or'])
    const keywords = fullTitle
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stop.has(w.toLowerCase()))
      .slice(0, 3)
      .join(' ')
    if (keywords) onInject(keywords)
  }

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      <div className="flex-1">
        {/* Each row is one real live competing listing — thumbnail + inject extracts keywords */}
        <SmartKeywordTable title="LONG TAIL KEYWORDS" icon={Target} initialData={longTailData}
          currentTitle={currentTitle} onInject={injectLongTailKeywords} veroDatabase={veroDatabase}
          columnLabels={{ search: 'CONDITION', comp: 'SHIPPING', sales: 'PRICE' }}
          showCompBar={false} showImage={true}
        />
      </div>
      <div className="flex-1">
        {/* Each row is a keyword/phrase aggregated from live listings — PHRASE badge on bigrams */}
        <SmartKeywordTable title="GENERIC KEYWORD IDEAS" icon={Lightbulb} initialData={genericData}
          currentTitle={currentTitle} onInject={onInject} veroDatabase={veroDatabase}
          columnLabels={{ search: 'IN LISTINGS', comp: 'DENSITY', sales: 'AVG PRICE' }}
          showCompBar={true} compScale={100} showImage={false}
        />
      </div>
    </div>
  )
}
