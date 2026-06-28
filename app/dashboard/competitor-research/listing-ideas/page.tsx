'use client'
// app/dashboard/competitor-research/listing-ideas/page.tsx
// Converted 1:1 from lib/pages/competitor_research/listing_ideas_screen.dart

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ArrowLeft, Bookmark, RefreshCw, Search,
  ChevronDown, Radar, Copy, X, Package,
  Zap, CheckCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// â”€â”€ Design tokens (matches Dart _C) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  bg:         '#F8FAFC',
  surface:    '#FFFFFF',
  hover:      '#F1F5F9',
  border:     '#E2E8F0',
  accent:     '#5CB800',
  accentDim:  '#E8FFB0',
  textPri:    '#0F172A',
  textSec:    '#64748B',
  textHint:   '#94A3B8',
  error:      '#FF4D6A',
  rising:     '#00E5A0',
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function timeAgo(dt: Date): string {
  const diff = Date.now() - dt.getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 60)  return `${m}m ago`
  if (h < 24)  return `${h}h ago`
  if (d < 7)   return `${d}d ago`
  return `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`
}

// â”€â”€ Idea card (matches Dart _IdeaCard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function IdeaCard({ idea, onRemove, onCopyTitle }: {
  idea: any; onRemove: () => void; onCopyTitle: () => void
}) {
  const [hover,         setHover]         = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)

  const title    = idea.title    ?? ''
  const price    = Number(idea.price    ?? 0)
  const revenue  = Number(idea.revenue  ?? 0)
  const sold     = idea.sold_count      ?? 0
  const score    = idea.opportunity_score ?? 5
  const imageUrl = idea.image_url       ?? null
  const keywords = (idea.top_keywords as string[] | null) ?? []
  const savedAt  = idea.saved_at ? new Date(idea.saved_at) : null

  const scoreColor = score >= 8 ? C.accent
    : score >= 6 ? C.rising
    : score >= 4 ? '#FFB800' : C.error

  return (
    <>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="flex flex-col rounded-2xl border overflow-hidden transition-all"
        style={{
          backgroundColor: hover ? C.hover : C.surface,
          borderColor:     hover ? `${C.accent}4D` : C.border,
          boxShadow:       hover ? `0 0 20px 2px rgba(92,184,0,0.06)` : 'none',
        }}>

        {/* Image */}
        <div className="relative" style={{ height: 140 }}>
          {imageUrl ? (
            <img src={imageUrl} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
                 style={{ backgroundColor: C.bg }}>
              <Package size={36} style={{ color: C.textHint }} />
            </div>
          )}

          {/* AI Score badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-md border"
               style={{
                 backgroundColor: scoreColor + '26',
                 borderColor:     scoreColor + '66',
               }}>
            <Zap size={10} style={{ color: scoreColor }} />
            <span className="text-[11px] font-bold" style={{ color: scoreColor }}>{score}/10</span>
          </div>

          {/* Remove button */}
          <button onClick={() => setShowConfirm(true)}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full border flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: C.border }}>
            <X size={12} style={{ color: C.textSec }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2.5 p-3.5 flex-1">
          {/* Title */}
          <p className="text-[12px] font-medium leading-snug line-clamp-2" style={{ color: C.textPri }}>
            {title}
          </p>

          {/* Price + sold */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-bold" style={{ color: C.textPri }}>
              ${price.toFixed(2)}
            </span>
            <span className="text-[11px]" style={{ color: C.textSec }}>{sold} sold</span>
          </div>

          {/* Revenue */}
          <p className="text-[11px]" style={{ color: C.rising }}>
            Est. ${revenue >= 1000 ? `${(revenue/1000).toFixed(1)}K` : revenue.toFixed(0)} revenue
          </p>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {keywords.slice(0, 3).map((kw, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px]"
                      style={{ backgroundColor: C.accentDim, color: `rgba(92,184,0,0.8)` }}>
                  {kw}
                </span>
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Copy title button */}
          <button onClick={onCopyTitle}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg border w-full text-[11px] font-semibold"
            style={{ backgroundColor: C.accentDim, borderColor: `${C.accent}4D`, color: C.accent }}>
            <Copy size={11} /> Copy title
          </button>

          {/* Saved date */}
          {savedAt && (
            <p className="text-[10px]" style={{ color: C.textHint }}>
              Saved {timeAgo(savedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Remove confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setShowConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border" style={{ borderColor: C.border }}>
            <h3 className="text-[16px] font-bold mb-2" style={{ color: C.textPri }}>Remove idea?</h3>
            <p className="text-[13px] mb-5" style={{ color: C.textSec }}>
              This product will be removed from your Listing Ideas board.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-[13px] font-medium" style={{ color: C.textSec }}>
                Cancel
              </button>
              <button onClick={() => { setShowConfirm(false); onRemove() }}
                className="px-4 py-2 rounded-lg text-[13px] font-bold"
                style={{ color: C.error }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ListingIdeasPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [ideas,   setIdeas]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [sortBy,  setSortBy]  = useState('saved_at')
  const [showSort, setShowSort] = useState(false)

  const SORT_OPTIONS: Record<string, string> = {
    saved_at: 'Newest first',
    score:    'AI Score',
    revenue:  'Revenue',
    price:    'Price',
  }

  useEffect(() => { loadIdeas() }, [])

  async function loadIdeas() {
    setLoading(true)
    try {
      const { data } = await supabase.from('listing_ideas' as any).select('*')
        .order('saved_at', { ascending: false })
      setIdeas((data ?? []) as any[])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function removeIdea(itemId: string, title: string) {
    try {
      await (supabase.from('listing_ideas') as any).delete().eq('item_id', itemId)
      setIdeas(prev => prev.filter(i => i.item_id !== itemId))
    } catch (e) { console.error(e) }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  // Filtered + sorted â€” matches Dart _filtered getter
  const filtered = (() => {
    let list = [...ideas]
    if (search) {
      list = list.filter(i => (i.title ?? '').toLowerCase().includes(search.toLowerCase()))
    }
    switch (sortBy) {
      case 'score':   list.sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0)); break
      case 'price':   list.sort((a, b) => (b.price ?? 0)    - (a.price ?? 0));    break
      case 'revenue': list.sort((a, b) => (b.revenue ?? 0)  - (a.revenue ?? 0));  break
      default:        list.sort((a, b) => (b.saved_at ?? '').localeCompare(a.saved_at ?? '')); break
    }
    return list
  })()

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>

      {/* Header â€” matches Dart _buildHeader() */}
      <div className="flex items-center gap-4 px-8 py-6 border-b"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <button onClick={() => router.back()}
          className="p-2 rounded-lg border hover:opacity-70"
          style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <ArrowLeft size={17} style={{ color: C.textSec }} />
        </button>

        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             style={{ backgroundColor: C.accentDim }}>
          <Bookmark size={19} style={{ color: C.accent }} />
        </div>

        <div className="flex-1">
          <p className="text-[20px] font-bold tracking-tight" style={{ color: C.textPri }}>
            Listing Ideas
          </p>
          <p className="text-[13px]" style={{ color: C.textSec }}>
            Products saved from competitor scans
          </p>
        </div>

        {/* Count badge */}
        {ideas.length > 0 && (
          <div className="flex items-center px-3.5 py-1.5 rounded-full border"
               style={{ backgroundColor: C.accentDim, borderColor: `${C.accent}4D` }}>
            <span className="text-[13px] font-semibold" style={{ color: C.accent }}>
              {ideas.length} saved
            </span>
          </div>
        )}

        {/* Refresh */}
        <button onClick={loadIdeas}
          className="p-2.5 rounded-lg border hover:opacity-70"
          style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <RefreshCw size={16} style={{ color: C.textSec }} />
        </button>
      </div>

      {/* Toolbar â€” matches Dart _buildToolbar() */}
      <div className="flex items-center gap-3 px-8 py-3.5 border-b"
           style={{ backgroundColor: C.bg, borderColor: C.border }}>
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-lg border"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <Search size={15} style={{ color: C.textHint }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search your saved ideas..."
            className="flex-1 text-[13px] outline-none bg-transparent" style={{ color: C.textPri }} />
        </div>

        {/* Sort dropdown â€” matches Dart _SortDropdown */}
        <div className="relative">
          <button onClick={() => setShowSort(s => !s)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg border text-[12px]"
            style={{ backgroundColor: C.surface, borderColor: C.border, color: C.textSec }}>
            {SORT_OPTIONS[sortBy]} <ChevronDown size={14} />
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl border shadow-lg overflow-hidden"
                   style={{ borderColor: C.border, minWidth: 140 }}>
                {Object.entries(SORT_OPTIONS).map(([val, label]) => (
                  <button key={val}
                    onClick={() => { setSortBy(val); setShowSort(false) }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-[12px] hover:bg-gray-50"
                    style={{ color: sortBy === val ? C.accent : C.textSec }}>
                    {label}
                    {sortBy === val && <CheckCircle size={12} style={{ color: C.accent }} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Count */}
        <p className="text-[12px] shrink-0" style={{ color: C.textHint }}>
          {filtered.length} of {ideas.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
                 style={{ borderTopColor: C.accent }} />
          </div>
        ) : ideas.length === 0 ? (
          /* Empty state â€” matches Dart _buildEmptyState() */
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="w-18 h-18 rounded-full flex items-center justify-center mb-5"
                 style={{ width: 72, height: 72, backgroundColor: C.accentDim }}>
              <Bookmark size={32} style={{ color: C.accent }} />
            </div>
            <p className="text-[18px] font-bold mb-2.5" style={{ color: C.textPri }}>
              No listing ideas yet
            </p>
            <p className="text-[14px] text-center leading-relaxed mb-7" style={{ color: C.textSec }}>
              Scan a competitor store and tap<br />"Save idea" on any product to add it here.
            </p>
            <button onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold"
              style={{ backgroundColor: C.accent, color: '#000' }}>
              <Radar size={15} /> Scan a store now
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-[14px]" style={{ color: C.textSec }}>No ideas match your search</p>
          </div>
        ) : (
          /* Grid â€” matches Dart GridView maxCrossAxisExtent 380, childAspectRatio 0.78 */
          <div className="p-8 grid gap-3.5"
               style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {filtered.map((idea, i) => (
              <IdeaCard key={idea.item_id ?? i} idea={idea}
                onRemove={() => removeIdea(idea.item_id, idea.title)}
                onCopyTitle={() => {
                  const kws = ((idea.top_keywords as string[] | null) ?? []).slice(0, 4).join(' ')
                  const full = `${idea.title ?? ''} ${kws}`.trim()
                  copyToClipboard(full.length > 80 ? full.slice(0, 80) : full)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
