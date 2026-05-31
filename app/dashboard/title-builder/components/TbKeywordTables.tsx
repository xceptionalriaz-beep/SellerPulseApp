'use client'
// app/dashboard/title-builder/components/TbKeywordTables.tsx
// Converted 1:1 from lib/pages/title_builder/tb_keyword_tables.dart

import { useState, useEffect } from 'react'
import { Target, Lightbulb, ChevronLeft, ChevronRight, ArrowDown, ArrowUp, ChevronsUpDown, Plus, Check, AlertTriangle } from 'lucide-react'

const C = {
  dark: '#0F172A', lime: '#8FFF00', border: '#D1D5DB',
  bg: '#F1F5F9', text: '#1E293B', muted: '#64748B',
}

interface KeywordRow { kw: string; search: string; comp: string; sales: string }
interface VeroEntry  { brand_name: string }

// ── Smart keyword cell — highlights VeRO words as red pills ──
function SmartKeyword({ keyword, veroDatabase }: { keyword: string; veroDatabase: VeroEntry[] }) {
  const banned = new Set(veroDatabase.map(e => e.brand_name.toLowerCase()))
  const words  = keyword.split(' ')

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
  const Icon   = active ? (sortAsc ? ArrowDown : ArrowUp) : ChevronsUpDown
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
function TableRow({ row, isEven, isUsed, onInject, veroDatabase }: {
  row: KeywordRow; isEven: boolean; isUsed: boolean
  onInject: () => void; veroDatabase: VeroEntry[]
}) {
  const [hover, setHover] = useState(false)

  const compVal   = parseInt(row.comp.replace(/,/g, '')) || 0
  const compRatio = Math.min(compVal / 500, 1)
  const heatColor = compRatio < 0.33 ? '#16A34A' : compRatio < 0.66 ? '#F97316' : '#EF4444'

  const bgColor  = isUsed ? '#F3F4F6' : hover ? '#F0FDF4' : isEven ? '#fff' : '#F8FAFC'
  const opacity  = isUsed ? 0.4 : 1

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         onClick={() => !isUsed && onInject()}
         className="flex items-center px-5 py-3 border-b transition-all"
         style={{ backgroundColor: bgColor, borderColor: '#F3F4F6', opacity, cursor: isUsed ? 'default' : 'pointer' }}>

      {/* Keyword — flex 4 */}
      <div style={{ flex: 4, minWidth: 0, paddingRight: 8 }}>
        <SmartKeyword keyword={row.kw} veroDatabase={veroDatabase} />
      </div>

      {/* Searches — flex 2 */}
      <div style={{ flex: 2 }}>
        <span className="text-[13px]" style={{ color: C.muted }}>{row.search}</span>
      </div>

      {/* Competition — flex 2 */}
      <div style={{ flex: 2 }}>
        <p className="text-[13px] font-bold mb-1" style={{ color: C.text }}>{row.comp}</p>
        <div className="h-1 rounded-full overflow-hidden" style={{ width: 40, backgroundColor: '#E5E7EB' }}>
          <div className="h-full rounded-full" style={{ width: `${compRatio * 100}%`, backgroundColor: heatColor }} />
        </div>
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
            : <Plus  size={15} style={{ color: C.dark    }} />}
        </div>
      </div>
    </div>
  )
}

// ── SmartKeywordTable ─────────────────────────────────────────
function SmartKeywordTable({ title, icon: Icon, initialData, currentTitle, onInject, veroDatabase }: {
  title: string; icon: React.ElementType
  initialData: KeywordRow[]; currentTitle: string
  onInject: (kw: string) => void; veroDatabase: VeroEntry[]
}) {
  const [data,      setData]      = useState<KeywordRow[]>([...initialData])
  const [sortCol,   setSortCol]   = useState('')
  const [sortAsc,   setSortAsc]   = useState(true)
  const [page,      setPage]      = useState(1)
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
      const va = parseInt(a[col as keyof KeywordRow].replace(/,/g, '')) || 0
      const vb = parseInt(b[col as keyof KeywordRow].replace(/,/g, '')) || 0
      return newAsc ? vb - va : va - vb
    }))
  }

  const totalPages  = Math.max(1, Math.ceil(data.length / PER_PAGE))
  const start       = (page - 1) * PER_PAGE
  const pageData    = data.slice(start, start + PER_PAGE)
  const titleLower  = currentTitle.toLowerCase()

  return (
    <div className="rounded-xl border overflow-hidden"
         style={{ borderColor: C.border, borderWidth: 2, boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>

      {/* Dark header */}
      <div className="flex items-center gap-2.5 px-5 py-4"
           style={{ backgroundColor: C.dark, borderRadius: '10px 10px 0 0' }}>
        <Icon size={19} style={{ color: C.lime }} />
        <p className="flex-1 text-[14px] font-black text-white tracking-[1.2px] truncate">{title}</p>
        <span className="text-[10px] font-bold hidden lg:block"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                       padding: '2px 10px', borderRadius: 20 }}>
          Hover to Inject
        </span>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-5 py-3.5 border-b"
           style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <div style={{ flex: 4 }}><SortableHeader title="KEYWORD"  colKey="kw"     sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></div>
        <div style={{ flex: 2 }}><SortableHeader title="SEARCHES" colKey="search" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></div>
        <div style={{ flex: 2 }}><SortableHeader title="COMP."    colKey="comp"   sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></div>
        <div style={{ flex: 2 }}><SortableHeader title="SALES"    colKey="sales"  sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></div>
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
  onInject:     (kw: string) => void
  veroDatabase: VeroEntry[]
  longTailData: KeywordRow[]
  genericData:  KeywordRow[]
  isLoading:    boolean
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

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      <div className="flex-1">
        <SmartKeywordTable title="LONG TAIL KEYWORDS"    icon={Target}    initialData={longTailData}
          currentTitle={currentTitle} onInject={onInject} veroDatabase={veroDatabase} />
      </div>
      <div className="flex-1">
        <SmartKeywordTable title="GENERIC KEYWORD IDEAS" icon={Lightbulb} initialData={genericData}
          currentTitle={currentTitle} onInject={onInject} veroDatabase={veroDatabase} />
      </div>
    </div>
  )
}