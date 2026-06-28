'use client'
// app/dashboard/profile/tabs/VaultTab.tsx
// Converted from: lib/user_profile/tabs/vault_tab.dart
//
// Sections (same as Dart):
//   Tab 0: Saved Products    (user_watchlist + listing_ideas)
//   Tab 1: Tracked Sellers   (watchlist + store_scans)
//   Tab 2: Research History  (scanned_products, paginated 20/page, search + filter)

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Bookmark, Store, Search, TrendingUp, TrendingDown,
  Minus, ExternalLink, Trash2, BookmarkMinus, Image,
  X, ChevronDown, SearchX,
} from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'
import { cn } from '@/lib/utils'

const C = {
  bg:'#F4F7FA', surface:'#FFFFFF', navy:'#0F172A', accent:'#8FFF00',
  txt1:'#0F172A', txt2:'#64748B', txt3:'#94A3B8', border:'#E2E8F0',
  green:'#00C48C', orange:'#FFB800', red:'#FF4D6A', blue:'#1D70F5',
  purple:'#8B5CF6',
}

// â”€â”€ Section header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SectionHeader({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[15px] font-bold" style={{ color: C.txt1 }}>{title}</span>
      <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold"
            style={{ backgroundColor: color + '1F', color }}>{count}</span>
    </div>
  )
}

// â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EmptyState({ icon: Icon, title, subtitle, color }: {
  icon: React.ElementType; title: string; subtitle: string; color: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
           style={{ backgroundColor: color + '1A' }}>
        <Icon size={36} style={{ color }} />
      </div>
      <p className="text-[16px] font-bold text-center" style={{ color: C.txt1, fontFamily: 'var(--font-space-grotesk)' }}>{title}</p>
      <p className="text-[13px] text-center leading-relaxed" style={{ color: C.txt2 }}>{subtitle}</p>
    </div>
  )
}

// â”€â”€ Icon button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function IconBtn({ icon: Icon, color, onClick }: { icon: React.ElementType; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
      style={{ backgroundColor: color + '14' }}>
      <Icon size={15} style={{ color }} />
    </button>
  )
}

// â”€â”€ Placeholder image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PlaceholderImg({ size = 44 }: { size?: number }) {
  return (
    <div className="rounded-lg flex items-center justify-center"
         style={{ width: size, height: size, backgroundColor: '#F1F5F9' }}>
      <Image size={18} style={{ color: C.txt3 }} />
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SECTION 1: SAVED PRODUCTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function SavedProductsSection() {
  const supabase = createClient()
  const toast    = useToast()
  const [items,   setItems]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [watchRes, ideasRes] = await Promise.all([
        supabase.from('user_watchlist').select().eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('listing_ideas').select().eq('user_id', user.id).order('saved_at', { ascending: false }),
      ])
      const combined: any[] = []
      for (const item of (watchRes.data || []) as any[]) combined.push({ ...item, source: 'watchlist' })
      for (const item of (ideasRes.data || []) as any[]) combined.push({ ...item, source: 'listing_ideas' })
      setItems(combined)
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string, source: string) {
    const table = source === 'listing_ideas' ? 'listing_ideas' : 'user_watchlist'
    await supabase.from(table).delete().eq('id', id)
    toast.deleted('Product')
    load()
  }

  if (loading) return <PageSpinner />
  if (items.length === 0) return (
    <EmptyState icon={Bookmark} title="No Saved Products Yet"
      subtitle="Save products from the Product Research tool to track them here." color={C.blue} />
  )

  return (
    <div>
      <SectionHeader title="Saved Products" count={items.length} color={C.blue} />
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold"
             style={{ backgroundColor: '#F8FAFC', color: C.txt3 }}>
          <div className="w-11 shrink-0" />
          <div className="flex-1">PRODUCT</div>
          <div className="w-14 text-center">PRICE</div>
          <div className="w-8" />
        </div>
        {items.map((item, i) => {
          const score = item.opportunity_score || item.score
          const scoreColor = score >= 8 ? C.green : score >= 5 ? C.orange : C.red
          const ebayUrl = item.ebay_url || (item.ebay_id ? `https://www.ebay.com/itm/${item.ebay_id}` : null)
          return (
            <div key={item.id || i} className="flex items-center gap-2.5 px-3 py-2.5 border-b last:border-0"
                 style={{ borderColor: C.border + '80' }}>
              {/* Image */}
              <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                   style={{ backgroundColor: '#F1F5F9' }}>
                {item.image_url
                  ? <img src={item.image_url} alt="" className="w-full h-full object-cover"
                         onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  : <Image size={16} style={{ color: C.txt3 }} />
                }
              </div>
              {/* Title + source */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: C.txt1 }}>{item.title || 'Product'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[13px] font-bold" style={{ color: C.blue, fontFamily: 'var(--font-space-grotesk)' }}>
                    ${parseFloat(item.price || 0).toFixed(0)}
                  </span>
                  {item.source === 'listing_ideas' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{ backgroundColor: C.accent + '26', color: C.navy }}>Idea</span>
                  )}
                </div>
              </div>
              {/* Score */}
              {score !== undefined && score !== null && (
                <div className="w-7 h-7 rounded-full border flex items-center justify-center shrink-0"
                     style={{ backgroundColor: scoreColor + '1A', borderColor: scoreColor + '66' }}>
                  <span className="text-[10px] font-bold" style={{ color: scoreColor }}>{score}</span>
                </div>
              )}
              {/* Actions */}
              <div className="flex items-center gap-1">
                {ebayUrl && <IconBtn icon={ExternalLink} color={C.blue} onClick={() => window.open(ebayUrl, '_blank')} />}
                <IconBtn icon={Trash2} color={C.red} onClick={() => handleDelete(item.id, item.source)} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SECTION 2: TRACKED SELLERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function TrackedSellersSection() {
  const supabase = createClient()
  const toast    = useToast()
  const [scans,   setScans]   = useState<any[]>([])
  const [watched, setWatched] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [scansRes, watchRes] = await Promise.all([
        supabase.from('store_scans').select().eq('user_id', user.id).order('scanned_at', { ascending: false }),
        supabase.from('watchlist').select().eq('user_id', user.id).order('added_at', { ascending: false }),
      ])
      setScans(scansRes.data || [])
      setWatched(watchRes.data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleRemoveWatch(id: string) {
    await supabase.from('watchlist').delete().eq('id', id)
    toast.deleted('Seller')
    load()
  }

  function timeAgo(iso?: string): string {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60)  return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24)  return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7)   return `${d}d ago`
    const dt = new Date(iso)
    return `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`
  }

  if (loading) return <PageSpinner />
  if (scans.length === 0 && watched.length === 0) return (
    <EmptyState icon={Store} title="No Tracked Sellers"
      subtitle="Scan competitor stores in the Competitor Research tool." color={C.orange} />
  )

  return (
    <div className="space-y-6">
      {/* Watchlist */}
      {watched.length > 0 && (
        <div>
          <SectionHeader title="Watchlist" count={watched.length} color={C.purple} />
          <div className="space-y-2.5">
            {watched.map((w, i) => (
              <div key={w.id || i} className="flex items-center gap-3 p-4 rounded-xl border bg-white"
                   style={{ borderColor: C.purple + '4D' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                     style={{ backgroundColor: C.purple + '1A' }}>
                  <Store size={20} style={{ color: C.purple }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold truncate" style={{ color: C.txt1 }}>{w.store_name || w.username}</p>
                  <p className="text-[11px]" style={{ color: C.txt3 }}>@{w.username}</p>
                </div>
                {w.last_revenue != null && (
                  <div className="text-right">
                    <p className="text-[14px] font-bold" style={{ color: C.green, fontFamily: 'var(--font-space-grotesk)' }}>
                      ${Number(w.last_revenue).toFixed(0)}
                    </p>
                    <p className="text-[10px]" style={{ color: C.txt3 }}>{w.last_sold || 0} sold</p>
                  </div>
                )}
                <IconBtn icon={BookmarkMinus} color={C.red} onClick={() => handleRemoveWatch(w.id)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Scans */}
      {scans.length > 0 && (
        <div>
          <SectionHeader title="Recent Scans" count={scans.length} color={C.orange} />
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border }}>
            <div className="grid px-4 py-2 text-[10px] font-bold"
                 style={{ backgroundColor: '#F8FAFC', color: C.txt3,
                   gridTemplateColumns: '1fr 60px 70px 70px 60px 32px' }}>
              <span>SELLER</span>
              <span className="text-center">LISTINGS</span>
              <span className="text-center">REVENUE</span>
              <span className="text-center">FEEDBACK</span>
              <span className="text-center">AVG $</span>
              <span />
            </div>
            {scans.map((s, i) => (
              <div key={s.id || i} className="grid items-center px-4 py-2.5 border-b last:border-0"
                   style={{ borderColor: C.border + '80', gridTemplateColumns: '1fr 60px 70px 70px 60px 32px' }}>
                <div>
                  <p className="text-[13px] font-semibold truncate" style={{ color: C.txt1 }}>{s.username || 'Store'}</p>
                  <p className="text-[10px]" style={{ color: C.txt3 }}>{timeAgo(s.scanned_at)}</p>
                </div>
                <p className="text-center text-[13px] font-semibold" style={{ color: C.blue }}>{s.active_listings || 0}</p>
                <p className="text-center text-[13px] font-semibold" style={{ color: C.green }}>${Number(s.estimated_revenue || 0).toFixed(0)}</p>
                <p className="text-center text-[13px] font-semibold" style={{ color: C.orange }}>{Number(s.feedback_percent || 0).toFixed(1)}%</p>
                <p className="text-center text-[13px] font-semibold" style={{ color: C.purple }}>${Number(s.avg_price || 0).toFixed(0)}</p>
                <div className="flex justify-center">
                  {s.store_url && <IconBtn icon={ExternalLink} color={C.blue} onClick={() => window.open(s.store_url, '_blank')} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SECTION 3: RESEARCH HISTORY (paginated, search + filter)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function ResearchHistorySection() {
  const supabase     = createClient()
  const searchRef    = useRef('')
  const [items,      setItems]      = useState<any[]>([])
  const [searchInput,setSearchInput]= useState('')
  const [trendFilter,setTrendFilter]= useState('all')
  const [page,       setPage]       = useState(0)
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [loadingMore,setLoadingMore]= useState(false)
  const PAGE_SIZE = 20

  const load = useCallback(async (reset = false) => {
    if (reset) { setLoading(true); setPage(0); setItems([]) }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const currentPage = reset ? 0 : page
      const from = currentPage * PAGE_SIZE
      const to   = from + PAGE_SIZE - 1

      let query = supabase.from('scanned_products').select('*', { count: 'exact' })
        .eq('user_id', user.id)
      if (searchRef.current) query = (query as any).ilike('title', `%${searchRef.current}%`)
      if (trendFilter !== 'all') query = (query as any).eq('trend', trendFilter)

      const { data, count } = await (query as any)
        .order('opportunity_score', { ascending: false }).range(from, to)

      setTotal(count || 0)
      setItems(prev => reset ? (data || []) : [...prev, ...(data || [])])
    } catch {} finally { setLoading(false); setLoadingMore(false) }
  }, [page, trendFilter])

  useEffect(() => { load(true) }, [trendFilter])

  function handleSearch(v: string) {
    setSearchInput(v); searchRef.current = v
    load(true)
  }

  async function handleLoadMore() {
    setLoadingMore(true); setPage(p => p + 1)
    await load(false)
  }

  const TREND_FILTERS = [
    { value: 'all',    label: 'All'       },
    { value: 'rising', label: 'ðŸ”¥ Rising' },
    { value: 'stable', label: 'ðŸ“ˆ Stable' },
    { value: 'fading', label: 'ðŸ“‰ Fading' },
  ]

  if (loading) return <PageSpinner />

  return (
    <div>
      <SectionHeader title="Research History" count={total} color={C.green} />

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 h-[42px] px-3 rounded-xl border bg-white"
             style={{ borderColor: C.border }}>
          <Search size={15} style={{ color: C.txt3 }} />
          <input type="text" value={searchInput} onChange={e => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 text-[13px] bg-transparent outline-none" style={{ color: C.txt1 }} />
          {searchInput && (
            <button onClick={() => handleSearch('')} style={{ color: C.txt3 }}><X size={14} /></button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {TREND_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTrendFilter(f.value)}
              className="px-3 py-2 rounded-lg border text-[12px] font-semibold whitespace-nowrap transition-all"
              style={{
                backgroundColor: trendFilter === f.value ? C.navy : C.surface,
                borderColor: trendFilter === f.value ? C.navy : C.border,
                color: trendFilter === f.value ? '#fff' : C.txt2,
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={SearchX} title="No Results Found"
          subtitle={searchInput ? 'Try a different search term' : 'Start using Product Research to build history'}
          color={C.green} />
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border }}>
            {/* Table header */}
            <div className="grid px-3 py-2 text-[10px] font-bold"
                 style={{ backgroundColor: '#F8FAFC', color: C.txt3,
                   gridTemplateColumns: '44px 10px 1fr 55px 50px 55px 65px 32px' }}>
              <span /><span />
              <span>PRODUCT</span>
              <span className="text-center">PRICE</span>
              <span className="text-center">SOLD</span>
              <span className="text-center">SCORE</span>
              <span className="text-center">TREND</span>
              <span />
            </div>
            {items.map((item, i) => {
              const trend = item.trend || 'stable'
              const trendColor = trend === 'rising' ? C.green : trend === 'fading' ? C.red : C.orange
              const TrendIcon  = trend === 'rising' ? TrendingUp : trend === 'fading' ? TrendingDown : Minus
              const trendText  = trend === 'rising' ? 'Rising' : trend === 'fading' ? 'Fading' : 'Stable'
              const score = item.opportunity_score || 0
              const scoreColor = score >= 8 ? C.green : score >= 5 ? C.orange : C.red
              return (
                <div key={item.id || i} className="grid items-center px-3 py-2 border-b last:border-0"
                     style={{ borderColor: C.border + '80',
                       gridTemplateColumns: '44px 10px 1fr 55px 50px 55px 65px 32px' }}>
                  <div className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center"
                       style={{ backgroundColor: '#F1F5F9' }}>
                    {item.image_url
                      ? <img src={item.image_url} alt="" className="w-full h-full object-cover"
                             onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      : <Image size={15} style={{ color: C.txt3 }} />
                    }
                  </div>
                  <div />
                  <p className="text-[12px] font-medium line-clamp-2" style={{ color: C.txt1 }}>{item.title || 'Product'}</p>
                  <p className="text-center text-[12px] font-bold" style={{ color: C.txt1, fontFamily: 'var(--font-space-grotesk)' }}>
                    ${Number(item.price || 0).toFixed(0)}
                  </p>
                  <p className="text-center text-[12px]" style={{ color: C.txt2 }}>{item.sold_count || 0}</p>
                  <div className="flex justify-center">
                    <div className="w-7 h-7 rounded-full border flex items-center justify-center"
                         style={{ backgroundColor: scoreColor + '1A', borderColor: scoreColor + '66' }}>
                      <span className="text-[11px] font-bold" style={{ color: scoreColor }}>{score}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <TrendIcon size={11} style={{ color: trendColor }} />
                    <span className="text-[10px] font-semibold" style={{ color: trendColor }}>{trendText}</span>
                  </div>
                  <div className="flex justify-center">
                    {item.ebay_url && (
                      <IconBtn icon={ExternalLink} color={C.blue} onClick={() => window.open(item.ebay_url, '_blank')} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {items.length < total && (
            <div className="flex justify-center mt-5">
              {loadingMore ? (
                <PageSpinner />
              ) : (
                <button onClick={handleLoadMore}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border text-[13px] font-semibold transition-all hover:bg-[#F4FFE6]"
                  style={{ borderColor: C.border, color: C.txt2 }}>
                  <ChevronDown size={16} />
                  Load More ({total - items.length} remaining)
                </button>
              )}
            </div>
          )}
          <p className="text-center text-[11px] mt-3" style={{ color: C.txt3 }}>
            Showing {items.length} of {total} items
          </p>
        </>
      )}
    </div>
  )
}

// â”€â”€ Loading spinner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LoadingSpinner({ small }: { small?: boolean }) {
  return (
    <div className="flex justify-center py-6">
      <svg className={cn('animate-spin', small ? 'w-5 h-5' : 'w-7 h-7')} viewBox="0 0 24 24" fill="none"
           style={{ color: C.accent }}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const TABS = [
  { icon: 'ðŸ’¾', label: 'Saved'   },
  { icon: 'ðŸ•µï¸', label: 'Sellers' },
  { icon: 'ðŸ”', label: 'History' },
]

export default function VaultTab() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold" style={{ color: '#0F172A', fontFamily: 'var(--font-space-grotesk)' }}>
          My Vault
        </h1>
        <p className="text-[14px] mt-1" style={{ color: C.txt2 }}>
          Your saved products, tracked sellers and research history.
        </p>
      </div>

      {/* Custom tab bar (matches Dart â€” no TabController) */}
      <div className="flex p-1 rounded-xl border bg-white" style={{ borderColor: C.border }}>
        {TABS.map((tab, i) => {
          const isActive = activeTab === i
          return (
            <button key={i} onClick={() => setActiveTab(i)}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
              style={{
                backgroundColor: isActive ? C.navy : 'transparent',
                color: isActive ? '#fff' : C.txt2,
                fontWeight: isActive ? 700 : 500,
              }}>
              {tab.icon} {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 0 && <SavedProductsSection />}
      {activeTab === 1 && <TrackedSellersSection />}
      {activeTab === 2 && <ResearchHistorySection />}
    </div>
  )
}
