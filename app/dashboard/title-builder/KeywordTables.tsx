'use client'
// app/dashboard/title-builder/KeywordTables.tsx
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Converted from: lib/pages/title_builder/tb_keyword_tables.dart
//
// What the Dart version had:
//   âœ… Loading state â€” spinner + "Fetching Live Keyword Data..."
//   âœ… Two tables side by side on desktop, stacked on mobile
//   âœ… LONG TAIL KEYWORDS table (dark navy header, lime icon)
//   âœ… GENERIC KEYWORD IDEAS table (dark navy header, lime icon)
//   âœ… Sortable columns â€” KEYWORD, SEARCHES, COMP., SALES
//   âœ… Sort arrows (asc/desc) with blue highlight
//   âœ… Pagination â€” 10 items per page, prev/next
//   âœ… "Hover to Inject" badge on desktop
//   âœ… Row hover â†’ green tint + inject button appears
//   âœ… Already-used keywords â†’ grey out + check icon
//   âœ… VeRO word detection â†’ red pill with warning icon
//   âœ… Competition heat bar (green/orange/red based on value)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { useState, useEffect } from 'react'
import {
  Target, Lightbulb, ChevronLeft, ChevronRight,
  ArrowDown, ArrowUp, ChevronsUpDown, Plus, Check,
  AlertTriangle,
} from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface KeywordRow {
  kw: string; search: string; comp: string; sales: string
}
interface VeroEntry { brand_name: string; risk_level?: string }

// â”€â”€ Smart keyword renderer (matches Dart _buildSmartKeyword) â”€â”€â”€
function SmartKeyword({ keyword, veroDatabase }: {
  keyword: string; veroDatabase: VeroEntry[]
}) {
  const bannedWords = veroDatabase.map(e => e.brand_name.toLowerCase())
  const words = keyword.split(' ')

  return (
    <span className="flex flex-wrap items-center gap-0.5">
      {words.map((word, i) => {
        const clean = word.replace(/[^\w\s]/g, '').toLowerCase()
        const isVero = bannedWords.includes(clean)
        if (isVero) return (
          <span key={i}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border mx-0.5"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
            <AlertTriangle size={10} className="text-red-500" />
            <span className="text-[12px] font-bold text-red-600">{word}</span>
          </span>
        )
        return (
          <span key={i} className="text-[13px] font-bold text-[#1E293B] px-0.5">{word}</span>
        )
      })}
    </span>
  )
}

// â”€â”€ Sortable header (matches Dart _sortableHeader) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SortHeader({ title, columnKey, sortCol, sortAsc, onSort }: {
  title: string; columnKey: string; sortCol: string
  sortAsc: boolean; onSort: (col: string) => void
}) {
  const isActive = sortCol === columnKey
  return (
    <button onClick={() => onSort(columnKey)}
      className="flex items-center gap-1 hover:opacity-80 transition-opacity">
      <span className="text-[11px] font-extrabold tracking-[0.8px]"
            style={{ color: isActive ? '#1D4ED8' : '#64748B' }}>
        {title}
      </span>
      {isActive
        ? sortAsc
          ? <ArrowDown size={13} className="text-blue-700" />
          : <ArrowUp size={13} className="text-blue-700" />
        : <ChevronsUpDown size={13} className="text-[#CBD5E1]" />
      }
    </button>
  )
}

// â”€â”€ Animated table row (matches Dart AnimatedTableRow) â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TableRow({ row, isEven, isUsed, onInject, veroDatabase }: {
  row: KeywordRow; isEven: boolean; isUsed: boolean
  onInject: () => void; veroDatabase: VeroEntry[]
}) {
  const [hovered, setHovered] = useState(false)

  const compValue = parseInt(row.comp.replace(/,/g, '')) || 0
  const compRatio = Math.min(1, compValue / 500)
  const heatColor = compRatio < 0.33 ? '#22c55e' : compRatio < 0.66 ? '#f97316' : '#ef4444'

  const bg = isUsed ? '#F1F5F9'
           : hovered ? '#F0FDF4'
           : isEven  ? '#FFFFFF' : '#F8FAFC'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!isUsed) onInject() }}
      className="flex items-center px-5 py-3 border-b border-gray-100 transition-colors"
      style={{ backgroundColor: bg, opacity: isUsed ? 0.4 : 1, cursor: isUsed ? 'default' : 'pointer' }}
    >
      {/* Keyword */}
      <div className="flex-[4] min-w-0 pr-2">
        <SmartKeyword keyword={row.kw} veroDatabase={veroDatabase} />
      </div>

      {/* Searches */}
      <div className="flex-[2] text-[13px] text-[#64748B] truncate">{row.search}</div>

      {/* Competition + heat bar */}
      <div className="flex-[2]">
        <span className="text-[13px] font-bold text-[#0F172A]">{row.comp}</span>
        <div className="h-1 w-10 rounded-full bg-gray-200 mt-1 overflow-hidden">
          <div className="h-full rounded-full transition-all"
               style={{ width: `${compRatio * 100}%`, backgroundColor: heatColor }} />
        </div>
      </div>

      {/* Sales */}
      <div className="flex-[2] text-[13px] font-bold text-green-600 truncate">{row.sales}</div>

      {/* Inject button */}
      <div className={cn('transition-opacity duration-200', (isUsed || hovered) ? 'opacity-100' : 'opacity-0')}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center"
             style={{
               backgroundColor: isUsed ? '#E2E8F0' : '#8FFF00',
               boxShadow: isUsed ? 'none' : '0 0 5px rgba(143,255,0,0.5)',
             }}>
          {isUsed
            ? <Check size={14} className="text-gray-500" />
            : <Plus size={14} className="text-[#0F172A]" />
          }
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Smart keyword table (matches Dart SmartKeywordTable) â”€â”€â”€â”€â”€â”€â”€â”€
function SmartKeywordTable({ title, icon: Icon, data, currentTitle, onInject, veroDatabase }: {
  title: string; icon: React.ElementType
  data: KeywordRow[]; currentTitle: string
  onInject: (kw: string) => void; veroDatabase: VeroEntry[]
}) {
  const [tableData,   setTableData]   = useState<KeywordRow[]>([])
  const [sortCol,     setSortCol]     = useState('')
  const [sortAsc,     setSortAsc]     = useState(true)
  const [page,        setPage]        = useState(1)
  const PER_PAGE = 10

  // Update table when new data comes in (mirrors Dart didUpdateWidget)
  useEffect(() => {
    setTableData([...data])
    setPage(1)
  }, [data])

  // Sort handler (matches Dart _sortData)
  function handleSort(col: string) {
    const asc = sortCol === col ? !sortAsc : true
    setSortCol(col); setSortAsc(asc); setPage(1)
    setTableData(prev => [...prev].sort((a, b) => {
      if (col === 'kw') return asc ? a.kw.localeCompare(b.kw) : b.kw.localeCompare(a.kw)
      const va = parseInt((a[col as keyof KeywordRow] || '0').replace(/,/g, '')) || 0
      const vb = parseInt((b[col as keyof KeywordRow] || '0').replace(/,/g, '')) || 0
      return asc ? vb - va : va - vb
    }))
  }

  const totalPages = Math.max(1, Math.ceil(tableData.length / PER_PAGE))
  const start = (page - 1) * PER_PAGE
  const visible = tableData.slice(start, start + PER_PAGE)
  const titleLower = currentTitle.toLowerCase()

  return (
    <div className="rounded-xl border-2 border-gray-300 overflow-hidden bg-white shadow-sm">

      {/* Dark header (matches Dart Container with navy bg) */}
      <div className="flex items-center gap-2.5 px-5 py-4"
           style={{ backgroundColor: '#1a2410', borderRadius: '10px 10px 0 0' }}>
        <Icon size={19} style={{ color: '#8FFF00' }} />
        <span className="flex-1 text-[14px] font-black text-white tracking-[1.2px] truncate">{title}</span>
        <span className="hidden md:block px-2.5 py-1 rounded-full text-[10px] font-bold text-white/70"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          Hover to Inject
        </span>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-5 py-3.5 border-b-2 border-gray-300"
           style={{ backgroundColor: '#F1F5F9' }}>
        <div className="flex-[4]">
          <SortHeader title="KEYWORD"  columnKey="kw"     sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
        </div>
        <div className="flex-[2]">
          <SortHeader title="SEARCHES" columnKey="search" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
        </div>
        <div className="flex-[2]">
          <SortHeader title="COMP."    columnKey="comp"   sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
        </div>
        <div className="flex-[2]">
          <SortHeader title="SALES"    columnKey="sales"  sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
        </div>
        <div className="w-7" />
      </div>

      {/* Rows */}
      {tableData.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-[14px] font-bold text-gray-400">No keywords found.</span>
        </div>
      ) : (
        visible.map((row, i) => (
          <TableRow
            key={`${row.kw}-${i}`}
            row={row}
            isEven={i % 2 === 0}
            isUsed={titleLower.includes(row.kw.toLowerCase())}
            onInject={() => onInject(row.kw)}
            veroDatabase={veroDatabase}
          />
        ))
      )}

      {/* Pagination (matches Dart bottom row) */}
      <div className="flex items-center justify-center gap-3 px-4 py-3.5 border-t border-gray-200">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="disabled:opacity-30 text-blue-600 hover:text-blue-800 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-[13px] font-bold text-[#475569]">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="disabled:opacity-30 text-blue-600 hover:text-blue-800 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN EXPORT (matches Dart TbKeywordTables)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
interface KeywordTablesProps {
  currentTitle:  string
  onInject:      (kw: string) => void
  veroDatabase:  VeroEntry[]
  longTailData:  KeywordRow[]
  genericData:   KeywordRow[]
  isLoading:     boolean
}

export default function KeywordTables({
  currentTitle, onInject, veroDatabase,
  longTailData, genericData, isLoading,
}: KeywordTablesProps) {

  // Loading state (matches Dart beautiful loading state)
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[400px] gap-5">
      <PageSpinner />
      <span className="text-[14px] font-bold" style={{ color: '#64748B' }}>
        Fetching Live Keyword Data...
      </span>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <div className="flex-1">
        <SmartKeywordTable
          title="LONG TAIL KEYWORDS"
          icon={Target}
          data={longTailData}
          currentTitle={currentTitle}
          onInject={onInject}
          veroDatabase={veroDatabase}
        />
      </div>
      <div className="flex-1">
        <SmartKeywordTable
          title="GENERIC KEYWORD IDEAS"
          icon={Lightbulb}
          data={genericData}
          currentTitle={currentTitle}
          onInject={onInject}
          veroDatabase={veroDatabase}
        />
      </div>
    </div>
  )
}
