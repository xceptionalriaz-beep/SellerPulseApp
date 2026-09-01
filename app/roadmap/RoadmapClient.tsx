'use client'

// app/roadmap/RoadmapClient.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ArrowUp, CheckCircle, Plus, X, Tag,
  Search, SlidersHorizontal, Flag, Activity,
} from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

// -- Riazify Color Role Tokens (v2.0) ---------------------------
const C = {
  primary: '#7530fb',
  primaryHover: '#6020e0',
  primaryLight: '#f3eeff',
  accent: '#b8fa33',
  accentHover: '#a3e635',
  dark: '#1e1535',
  darkHover: '#2d1f4e',
  darkCard: '#271c42',
  border: '#ede9fe',
  borderDark: '#2d1f4e',
  borderInput: '#e5e0f5',
  bg: '#f8f7ff',
  surface: '#ffffff',
  text: '#1f1d2e',
  textDark: '#1e1535',
  muted: '#6b7280',
  textLight: '#a89cc8',
}

const STATUSES = [
  { value: 'planned', label: 'Planned', color: '#f59e0b', bg: '#fef3c7' },
  { value: 'in_progress', label: 'In Progress', color: '#7530fb', bg: '#f3eeff' },
  { value: 'under_review', label: 'Under Review', color: '#8b5cf6', bg: '#ede9fe' },
  { value: 'done', label: 'Done', color: '#16a34a', bg: '#dcfce7' },
]

const CATEGORIES = ['All Categories', 'New Feature', 'UI / UX', 'Integration', 'Performance', 'Bug Fix']

interface Feature {
  id: string; title: string; description: string | null
  status: string; votes: number; category: string; created_at: string
}

export default function RoadmapClient() {
  const supabase = createClient()

  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('all')
  const [category, setCategory] = useState('All Categories')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes')
  const [user, setUser] = useState<any>(null)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [newCategory, setNewCategory] = useState('New Feature')
  const [toast, setToast] = useState<string | null>(null)
  const [searchFocus, setSearchFocus] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showCat, setShowCat] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await (supabase as any)
          .from('feature_requests')
          .select('*')
          .eq('is_public', true)
          .order('votes', { ascending: false })
        setFeatures(data ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    async function loadVotedIds() {
      try {
        const stored = localStorage.getItem('riazify_voted')
        if (stored) setVotedIds(new Set(JSON.parse(stored)))
      } catch { /* ignore */ }

      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)
        if (currentUser) {
          const { data: votes } = await (supabase as any)
            .from('feature_votes')
            .select('feature_id')
            .eq('user_id', currentUser.id)
          if (votes?.length) {
            const dbVoted = new Set<string>(votes.map((v: any) => v.feature_id))
            setVotedIds(prev => new Set([...prev, ...dbVoted]))
          }
        }
      } catch { /* ignore */ }
    }

    load()
    loadVotedIds()
  }, [])

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleVote(feat: Feature) {
    if (!user) { showToastMsg('Sign in to vote on features'); return }
    if (votedIds.has(feat.id)) { showToastMsg('You already voted for this!'); return }
    try {
      await (supabase as any).from('feature_votes').insert([{ feature_id: feat.id, user_id: user.id }])
      await (supabase as any).from('feature_requests')
        .update({ votes: (feat.votes ?? 0) + 1 }).eq('id', feat.id)
      const newVoted = new Set([...votedIds, feat.id])
      setVotedIds(newVoted)
      localStorage.setItem('riazify_voted', JSON.stringify([...newVoted]))
      setFeatures(f => f.map(x => x.id === feat.id ? { ...x, votes: x.votes + 1 } : x))
      showToastMsg('Vote recorded!')
    } catch (e) { console.error(e); showToastMsg('Failed to record vote. Try again.') }
  }

  async function handleSubmit() {
    if (!title.trim()) return
    if (!user) { showToastMsg('Sign in to submit a request'); return }
    setSubmitting(true)
    try {
      await (supabase as any).from('feature_requests').insert([{
        title: title.trim(),
        description: desc.trim() || null,
        category: newCategory,
        status: 'planned',
        votes: 0,
        is_public: false,
        submitted_by: user.id,
        submitted_by_name: user.user_metadata?.full_name ?? user.email,
      }])
      setShowSubmit(false)
      setTitle(''); setDesc(''); setNewCategory('New Feature')
      showToastMsg('Request submitted! Our team will review it.')
    } catch (e) {
      console.error(e)
      showToastMsg('Failed to submit. Try again.')
    }
    setSubmitting(false)
  }

  // -- Filter + search + sort ---------------------------------
  const displayed = features
    .filter(f => filter === 'all' ? true : f.status === filter)
    .filter(f => category === 'All Categories' ? true : f.category === category)
    .filter(f => {
      const q = search.toLowerCase()
      if (!q) return true
      return f.title.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q)
    })
    .sort((a, b) => sortBy === 'votes'
      ? b.votes - a.votes
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  // -- Status counts ------------------------------------------
  const counts = {
    all: features.length,
    in_progress: features.filter(f => f.status === 'in_progress').length,
    planned: features.filter(f => f.status === 'planned').length,
    under_review: features.filter(f => f.status === 'under_review').length,
    done: features.filter(f => f.status === 'done').length,
  }

  // -- Group by status (for "All" view) ----------------------
  const grouped: Record<string, Feature[]> = {
    in_progress: displayed.filter(f => f.status === 'in_progress'),
    planned: displayed.filter(f => f.status === 'planned'),
    under_review: displayed.filter(f => f.status === 'under_review'),
    done: displayed.filter(f => f.status === 'done'),
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg }}>
      <Navbar />

      {/* ── 1. Hero ── */}
      <div className="text-center px-4 pt-24 pb-12 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
        {/* Decorative Background Accents */}
        <div className="absolute pointer-events-none" style={{ top: -80, right: -80, width: 340, height: 340, borderRadius: '50%', background: 'rgba(117,48,251,0.08)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(184,250,51,0.08)' }} />

        {/* Status Chip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 relative border shadow-xs"
          style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.primary }} />
          <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.primary }}>
            PUBLIC PRODUCT ROADMAP
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="font-black mb-3 relative font-syne tracking-tight" style={{ color: C.textDark, fontSize: 'clamp(30px, 5vw, 48px)' }}>
          What We Are Building
        </h1>
        <p className="text-[15px] max-w-md mx-auto mb-8 leading-relaxed relative" style={{ color: C.muted }}>
          Vote on features you want prioritized. Your votes directly shape what our engineering team ships next.
        </p>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto relative">
          {[
            { label: 'Planned', value: counts.planned, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'In Progress', value: counts.in_progress, color: C.primary, bg: C.primaryLight },
            { label: 'Total Votes', value: features.reduce((s, f) => s + (f.votes ?? 0), 0), color: C.primary, bg: C.surface },
            { label: 'Shipped', value: counts.done, color: '#16a34a', bg: '#dcfce7' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl py-4 px-3 text-center border shadow-xs"
              style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <p className="text-[26px] font-black leading-none mb-1 font-syne" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider font-syne" style={{ color: C.muted }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Controls ── */}
      <div className="px-4 max-w-3xl mx-auto flex flex-col gap-3 mt-4 mb-6">

        {/* Filter Tabs with Counts */}
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: 'all', label: 'All', count: counts.all },
            { key: 'in_progress', label: 'In Progress', count: counts.in_progress },
            { key: 'planned', label: 'Planned', count: counts.planned },
            { key: 'under_review', label: 'Under Review', count: counts.under_review },
            { key: 'done', label: 'Done', count: counts.done },
          ] as const).map(f => {
            const s = STATUSES.find(x => x.value === f.key)
            const isActive = filter === f.key
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer shadow-xs"
                style={{
                  backgroundColor: isActive ? (s?.bg ?? C.dark) : C.surface,
                  color: isActive ? (s?.color ?? '#ffffff') : C.muted,
                  borderColor: isActive ? (s?.color ?? C.dark) : C.border,
                }}>
                <span>{f.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black"
                  style={{ backgroundColor: isActive ? 'rgba(0,0,0,0.08)' : C.bg, color: 'inherit' }}>
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search + Category Dropdown + Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl flex-1 border shadow-xs"
            style={{
              borderColor: searchFocus ? C.primary : C.border,
              boxShadow: searchFocus ? '0 0 0 3px rgba(117,48,251,0.12)' : 'none',
              backgroundColor: C.surface,
            }}>
            <Search size={14} style={{ color: C.muted, flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
              placeholder="Search features..."
              className="flex-1 text-[13px] bg-transparent outline-none border-none"
              style={{ color: C.text }} />
            {search && (
              <button onClick={() => setSearch('')} className="cursor-pointer">
                <X size={13} style={{ color: C.muted }} />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <button onClick={() => setShowCat(s => !s)}
              className="flex items-center gap-2 h-10 px-3.5 rounded-xl border text-[12px] font-bold transition-all cursor-pointer shadow-xs"
              style={{
                borderColor: showCat ? C.primary : C.border,
                backgroundColor: C.surface,
                color: category === 'All Categories' ? C.muted : C.primary,
                boxShadow: showCat ? '0 0 0 3px rgba(117,48,251,0.12)' : 'none',
              }}>
              <Tag size={13} style={{ color: category === 'All Categories' ? C.muted : C.primary }} />
              <span>{category}</span>
              <SlidersHorizontal size={11} style={{ color: C.muted }} />
            </button>
            {showCat && (<>
              <div className="fixed inset-0 z-40" onClick={() => setShowCat(false)} />
              <div className="absolute left-0 top-full mt-1.5 z-50 rounded-2xl border py-1.5 w-48 shadow-xl"
                style={{ backgroundColor: C.surface, borderColor: C.border }}>
                {CATEGORIES.map(c => (
                  <button key={c}
                    onClick={() => { setCategory(c); setShowCat(false) }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-[13px] font-semibold transition-colors cursor-pointer"
                    style={{
                      backgroundColor: category === c ? C.primaryLight : 'transparent',
                      color: category === c ? C.primary : C.text,
                    }}>
                    {category === c && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.primary }} />}
                    {category !== c && <div className="w-1.5 h-1.5 rounded-full shrink-0 opacity-0" />}
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </>)}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button onClick={() => setShowSort(s => !s)}
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl border text-[12px] font-bold cursor-pointer shadow-xs"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
              <SlidersHorizontal size={13} />
              <span>{sortBy === 'votes' ? 'Top Voted' : 'Newest'}</span>
            </button>
            {showSort && (<>
              <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-50 rounded-xl border py-1 w-36 shadow-xl"
                style={{ backgroundColor: C.surface, borderColor: C.border }}>
                {[{ val: 'votes', label: 'Top Voted' }, { val: 'newest', label: 'Newest' }].map(s => (
                  <button key={s.val}
                    onClick={() => { setSortBy(s.val as any); setShowSort(false) }}
                    className="w-full text-left px-3.5 py-2 text-[13px] font-semibold cursor-pointer"
                    style={{ color: sortBy === s.val ? C.primary : C.text, backgroundColor: sortBy === s.val ? C.primaryLight : 'transparent' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </>)}
          </div>
        </div>
      </div>

      {/* ── 3. Feature List ── */}
      <div className="px-4 pb-20 max-w-3xl mx-auto">

        {/* Skeleton Loading State */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border animate-pulse"
                style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="rounded-xl shrink-0" style={{ width: 56, height: 64, backgroundColor: C.bg }} />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 rounded-lg" style={{ backgroundColor: C.bg, width: '60%' }} />
                  <div className="h-3 rounded-lg" style={{ backgroundColor: C.bg, width: '40%' }} />
                  <div className="h-3 rounded-lg" style={{ backgroundColor: C.bg, width: '20%' }} />
                </div>
                <div className="rounded-full shrink-0" style={{ width: 72, height: 24, backgroundColor: C.bg }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border shadow-xs text-center"
            style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <Flag size={40} style={{ color: C.muted }} />
            <p className="text-[16px] font-black font-syne mt-4" style={{ color: C.textDark }}>
              {search ? `No results for "${search}"` : 'No features found'}
            </p>
            <p className="text-[13px] mt-1" style={{ color: C.muted }}>
              {search ? 'Try adjusting your search query or filter tags' : 'Check back soon — our engineers are actively deploying.'}
            </p>
            {user && !search && (
              <button onClick={() => setShowSubmit(true)}
                className="mt-5 px-6 py-2.5 rounded-xl text-[13px] font-black transition-transform hover:scale-105 cursor-pointer shadow-sm"
                style={{ backgroundColor: C.accent, color: C.dark }}>
                Request a Feature
              </button>
            )}
          </div>
        )}

        {/* Grouped View (All Tab) */}
        {!loading && filter === 'all' && displayed.length > 0 && (
          <div className="flex flex-col gap-8">
            {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([status, items]) => {
              const s = STATUSES.find(x => x.value === status)
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s?.color }} />
                    <p className="text-[12px] font-black uppercase tracking-wider font-syne" style={{ color: s?.color }}>
                      {s?.label}
                    </p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: s?.bg, color: s?.color }}>
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {items.map(feat => (
                      <FeatureCard key={feat.id} feat={feat} votedIds={votedIds} onVote={handleVote} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Flat View (Filtered Tab) */}
        {!loading && filter !== 'all' && displayed.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {displayed.map(feat => (
              <FeatureCard key={feat.id} feat={feat} votedIds={votedIds} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Submit Request Dialog Modal ── */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(30,21,53,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowSubmit(false)}>
          <div className="rounded-3xl border w-full max-w-md p-6 sm:p-7 shadow-2xl"
            style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[18px] font-black font-syne" style={{ color: C.textDark }}>Request a Feature</p>
              <button onClick={() => setShowSubmit(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f8f7ff] cursor-pointer"
                style={{ backgroundColor: C.bg }}>
                <X size={16} style={{ color: C.muted }} />
              </button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 font-syne" style={{ color: C.muted }}>Title *</p>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="What feature would improve your eBay store?"
                  className="w-full h-11 px-3.5 rounded-xl text-[13px] border outline-none"
                  style={{ borderColor: C.borderInput, backgroundColor: C.bg, color: C.text }} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 font-syne" style={{ color: C.muted }}>Description</p>
                <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Describe your use case and desired outcome..."
                  rows={3} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] resize-none border outline-none"
                  style={{ borderColor: C.borderInput, backgroundColor: C.bg, color: C.text }} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 font-syne" style={{ color: C.muted }}>Category</p>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl text-[13px] border outline-none cursor-pointer"
                  style={{ borderColor: C.borderInput, backgroundColor: C.bg, color: C.text }}>
                  {CATEGORIES.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <p className="text-[11px] px-3.5 py-2.5 rounded-xl border leading-relaxed"
                style={{ backgroundColor: C.primaryLight, borderColor: C.border, color: C.primary }}>
                Our team reviews all requests before they appear publicly on the live roadmap.
              </p>
              <div className="flex gap-2.5 mt-2">
                <button onClick={() => setShowSubmit(false)}
                  className="flex-1 py-3 rounded-xl border text-[13px] font-bold cursor-pointer hover:bg-[#f8f7ff]"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={!title.trim() || submitting}
                  className="flex-1 py-3 rounded-xl text-[13px] font-black disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  style={{ backgroundColor: C.accent, color: C.dark }}>
                  {submitting
                    ? <div className="w-4 h-4 rounded-full border-2 border-[#1e1535] border-t-transparent animate-spin" />
                    : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Toast Feedback ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border"
          style={{ backgroundColor: C.dark, borderColor: C.primary, color: '#ffffff' }}>
          <CheckCircle size={15} style={{ color: C.accent }} />
          <p className="text-[13px] font-bold whitespace-nowrap">{toast}</p>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0);    }
          100% { opacity: 0; transform: translateX(-50%) translateY(-24px); }
        }
      `}</style>
    </div>
  )
}

// ── Feature Card Component ─────────────────────────────────────
function FeatureCard({ feat, votedIds, onVote }: {
  feat: Feature; votedIds: Set<string>; onVote: (f: Feature) => void
}) {
  const voted = votedIds.has(feat.id)
  const s = STATUSES.find(x => x.value === feat.status)
  const [pop, setPop] = useState(false)
  const [showPlus, setShowPlus] = useState(false)

  function handleClick() {
    if (voted) return
    setPop(true)
    setShowPlus(true)
    setTimeout(() => setPop(false), 300)
    setTimeout(() => setShowPlus(false), 800)
    onVote(feat)
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-xs"
      style={{ backgroundColor: C.surface, borderColor: voted ? C.primary : C.border }}>

      {/* Upvote Button with Feedback Animation */}
      <div className="relative shrink-0">
        <button onClick={handleClick}
          className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border transition-all shadow-2xs"
          style={{
            borderColor: voted ? C.primary : C.border,
            backgroundColor: voted ? C.primaryLight : C.bg,
            minWidth: 56,
            cursor: voted ? 'default' : 'pointer',
            transform: pop ? 'scale(0.88)' : 'scale(1)',
            transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), background-color 0.2s ease, border-color 0.2s ease',
          }}>
          <ArrowUp size={14}
            style={{
              color: voted ? C.primary : C.muted,
              transform: pop ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.15s ease',
            }} className="stroke-[2.5]" />
          <span className="text-[15px] font-black font-syne leading-tight"
            style={{ color: voted ? C.primary : C.textDark }}>
            {feat.votes}
          </span>
          {voted && (
            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: C.primary }}>Voted</span>
          )}
        </button>

        {/* Floating +1 Marker */}
        {showPlus && (
          <div className="absolute left-1/2 pointer-events-none font-black text-[13px] font-syne"
            style={{
              color: C.primary,
              transform: 'translateX(-50%)',
              animation: 'floatUp 0.8s ease forwards',
              top: -8,
            }}>
            +1
          </div>
        )}
      </div>

      {/* Title & Category Details */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-black font-syne" style={{ color: C.textDark }}>{feat.title}</p>
        {feat.description && (
          <p className="text-[12px] mt-0.5 line-clamp-2 leading-relaxed" style={{ color: C.muted }}>{feat.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border"
            style={{ backgroundColor: C.bg, borderColor: C.border, color: C.muted }}>
            <Tag size={10} style={{ color: C.primary }} /> {feat.category}
          </span>
        </div>
      </div>

      {/* Status Badge & Share Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/roadmap#${feat.id}`)
            alert('Roadmap link copied to clipboard!')
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all hover:bg-[#f8f7ff] cursor-pointer"
          title="Copy link"
          style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
        <span className="px-3 py-1.5 rounded-full text-[11px] font-black font-syne uppercase tracking-wider"
          style={{ backgroundColor: s?.bg ?? C.bg, color: s?.color ?? C.muted }}>
          {s?.label ?? feat.status}
        </span>
      </div>
    </div>
  )
}
