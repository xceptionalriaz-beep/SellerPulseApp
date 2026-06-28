'use client'
// app/roadmap/RoadmapClient.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ArrowUp, CheckCircle, Plus, X, Tag,
  Search, SlidersHorizontal, Flag, Activity, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

// ── Brand colours ──────────────────────────────────────────────
const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  red:      '#b91c1c',
}

const STATUSES = [
  { value: 'planned',      label: 'Planned',      color: '#FB923C', bg: '#FFF7ED' },
  { value: 'in_progress',  label: 'In Progress',  color: '#1D70F5', bg: '#EFF6FF' },
  { value: 'under_review', label: 'Under Review', color: '#8B5CF6', bg: '#F5F3FF' },
  { value: 'done',         label: 'Done',         color: '#16a34a', bg: '#F0FDF4' },
]

const CATEGORIES = ['All Categories', 'New Feature', 'UI / UX', 'Integration', 'Performance', 'Bug Fix']

interface Feature {
  id: string; title: string; description: string | null
  status: string; votes: number; category: string; created_at: string
}

export default function RoadmapClient() {
  const supabase = createClient()

  const [features,    setFeatures]    = useState<Feature[]>([])
  const [loading,     setLoading]     = useState(true)
  const [votedIds,    setVotedIds]    = useState<Set<string>>(new Set())
  const [filter,      setFilter]      = useState('all')
  const [category,    setCategory]    = useState('All Categories')
  const [search,      setSearch]      = useState('')
  const [sortBy,      setSortBy]      = useState<'votes' | 'newest'>('votes')
  const [user,        setUser]        = useState<any>(null)
  const [showSubmit,  setShowSubmit]  = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [title,       setTitle]       = useState('')
  const [desc,        setDesc]        = useState('')
  const [newCategory, setNewCategory] = useState('New Feature')
  const [toast,       setToast]       = useState<string | null>(null)
  const [searchFocus, setSearchFocus] = useState(false)
  const [showSort,       setShowSort]       = useState(false)
  const [showCat,        setShowCat]        = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')

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
      // First load from localStorage (fast)
      try {
        const stored = localStorage.getItem('riazify_voted')
        if (stored) setVotedIds(new Set(JSON.parse(stored)))
      } catch { /* ignore */ }

      // Fix 6: Also check DB for cross-device vote tracking
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
    if (!user)              { showToastMsg('Sign in to vote on features'); return }
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
        title:             title.trim(),
        description:       desc.trim() || null,
        category:          newCategory,
        status:            'planned',
        votes:             0,
        is_public:         false,
        submitted_by:      user.id,
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

  // ── Filter + search + sort ─────────────────────────────────
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

  // ── Status counts ──────────────────────────────────────────
  const counts = {
    all:          features.length,
    in_progress:  features.filter(f => f.status === 'in_progress').length,
    planned:      features.filter(f => f.status === 'planned').length,
    under_review: features.filter(f => f.status === 'under_review').length,
    done:         features.filter(f => f.status === 'done').length,
  }

  // ── Group by status (for "All" view) ──────────────────────
  const grouped: Record<string, Feature[]> = {
    in_progress:  displayed.filter(f => f.status === 'in_progress'),
    planned:      displayed.filter(f => f.status === 'planned'),
    under_review: displayed.filter(f => f.status === 'under_review'),
    done:         displayed.filter(f => f.status === 'done'),
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b px-6 py-3 flex items-center justify-between"
           style={{ backgroundColor: C.dark, borderColor: 'rgba(143,255,0,0.2)' }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                 style={{ backgroundColor: C.lime }}>
              <Activity size={14} style={{ color: C.dark }} />
            </div>
            <span className="text-[15px] font-bold" style={{ color: '#fff' }}>Riazify</span>
            <span className="text-[13px]" style={{ color: C.muted }}>/ Roadmap</span>
          </Link>

          {/* Fix 3: Back to App link */}
          {user && (
            <Link href="/dashboard"
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl border transition-all hover:opacity-80"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
              <ArrowLeft size={13} /> Back to App
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => setShowSubmit(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:opacity-80"
              style={{ backgroundColor: C.lime, color: C.dark }}>
              <Plus size={14} /> Request Feature
            </button>
          ) : (
            <Link href="/auth/login?next=/roadmap"
              className="px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:opacity-80"
              style={{ backgroundColor: C.lime, color: C.dark }}>
              Sign in to vote
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero — Option A ───────────────────────────────────── */}
      <div className="text-center px-6 pt-12 pb-10 relative overflow-hidden"
           style={{ backgroundColor: C.dark, borderBottom: `1px solid rgba(143,255,0,0.15)` }}>

        {/* Lime radial glow behind title */}
        <div className="absolute pointer-events-none"
             style={{
               top: -40, left: '50%', transform: 'translateX(-50%)',
               width: 600, height: 260,
               background: 'radial-gradient(ellipse at center top, rgba(143,255,0,0.1) 0%, transparent 65%)',
             }} />

        {/* "Always improving" pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 relative"
             style={{ backgroundColor: 'rgba(143,255,0,0.08)', border: '1px solid rgba(143,255,0,0.2)' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.lime }} />
          <span className="text-[11px] font-semibold tracking-wide" style={{ color: C.lime }}>
            Always improving
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[34px] font-bold mb-3 relative" style={{ color: '#fff' }}>
          Product Roadmap
        </h1>
        <p className="text-[14px] max-w-md mx-auto mb-8 leading-relaxed relative" style={{ color: C.muted }}>
          See what we are building. Vote on features you want most.
          Your votes directly shape what we build next.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto relative">
          {[
            { label: 'Planned',     value: counts.planned,                                    border: 'rgba(143,255,0,0.2)',  valueBg: 'rgba(143,255,0,0.06)',  color: C.lime    },
            { label: 'In Progress', value: counts.in_progress,                                border: 'rgba(29,112,245,0.25)', valueBg: 'rgba(29,112,245,0.06)', color: '#1D70F5' },
            { label: 'Total Votes', value: features.reduce((s, f) => s + (f.votes ?? 0), 0), border: 'rgba(143,255,0,0.2)',  valueBg: 'rgba(143,255,0,0.06)',  color: C.lime    },
            { label: 'Shipped',     value: counts.done,                                       border: 'rgba(22,163,74,0.25)', valueBg: 'rgba(22,163,74,0.06)',  color: '#16a34a' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl py-4 px-3 text-center"
                 style={{ backgroundColor: s.valueBg, border: `1px solid ${s.border}` }}>
              <p className="text-[26px] font-bold leading-none mb-1" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[11px] font-medium" style={{ color: C.muted }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="px-6 max-w-3xl mx-auto flex flex-col gap-3 mt-8 mb-6">

        {/* Filter tabs with counts — Fix 10 */}
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: 'all',          label: 'All',          count: counts.all          },
            { key: 'in_progress',  label: 'In Progress',  count: counts.in_progress  },
            { key: 'planned',      label: 'Planned',      count: counts.planned      },
            { key: 'under_review', label: 'Under Review', count: counts.under_review },
            { key: 'done',         label: 'Done',         count: counts.done         },
          ] as const).map(f => {
            const s = STATUSES.find(x => x.value === f.key)
            const isActive = filter === f.key
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all"
                style={{
                  backgroundColor: isActive ? (s?.bg ?? C.dark) : C.surface,
                  color:           isActive ? (s?.color ?? C.lime) : C.muted,
                  borderColor:     isActive ? (s?.color ?? C.dark) : C.border,
                }}>
                {f.label}
                <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                      style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'inherit' }}>
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search + Category + Sort — Fix 4, 5, 6 */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 h-9 px-3 rounded-xl flex-1"
               style={{
                 border: `1.5px solid ${searchFocus ? C.limeDeep : C.border}`,
                 boxShadow: searchFocus ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
                 backgroundColor: C.surface,
               }}>
            <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
              placeholder="Search features..."
              className="flex-1 text-[13px] bg-transparent"
              style={{ color: C.text, outline: 'none', border: 'none' }} />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={12} style={{ color: C.muted }} />
              </button>
            )}
          </div>

          {/* Category filter — custom dropdown */}
          <div className="relative">
            <button onClick={() => setShowCat(s => !s)}
              className="flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] font-semibold transition-all"
              style={{
                borderColor:     showCat ? C.limeDeep : C.border,
                backgroundColor: C.surface,
                color:           category === 'All Categories' ? C.muted : C.text,
                boxShadow:       showCat ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
              }}>
              <Tag size={12} style={{ color: category === 'All Categories' ? C.muted : C.limeDeep }} />
              {category}
              <SlidersHorizontal size={11} style={{ color: C.muted }} />
            </button>
            {showCat && (<>
              <div className="fixed inset-0 z-40" onClick={() => setShowCat(false)} />
              <div className="absolute left-0 top-full mt-1.5 z-50 rounded-2xl border py-1.5 w-48"
                   style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                {CATEGORIES.map(c => (
                  <button key={c}
                    onClick={() => { setCategory(c); setShowCat(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold transition-all hover:opacity-80"
                    style={{
                      backgroundColor: category === c ? C.limeTint : 'transparent',
                      color:           category === c ? C.limeDeep : C.text,
                    }}>
                    {category === c && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.limeDeep }} />}
                    {category !== c && <div className="w-1.5 h-1.5 rounded-full shrink-0 opacity-0" />}
                    {c}
                  </button>
                ))}
              </div>
            </>)}
          </div>

          {/* Sort */}
          <div className="relative">
            <button onClick={() => setShowSort(s => !s)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-semibold"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
              <SlidersHorizontal size={13} />
              {sortBy === 'votes' ? 'Top Voted' : 'Newest'}
            </button>
            {showSort && (<>
              <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border py-1 w-36"
                   style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                {[{ val: 'votes', label: 'Top Voted' }, { val: 'newest', label: 'Newest' }].map(s => (
                  <button key={s.val}
                    onClick={() => { setSortBy(s.val as any); setShowSort(false) }}
                    className="w-full text-left px-3 py-2 text-[13px] font-semibold hover:opacity-70"
                    style={{ color: sortBy === s.val ? C.limeDeep : C.text, backgroundColor: sortBy === s.val ? C.limeTint : 'transparent' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </>)}
          </div>
        </div>
      </div>

      {/* ── Feature list ─────────────────────────────────────── */}
      <div className="px-6 pb-16 max-w-3xl mx-auto">

        {/* Fix 1: Skeleton loading */}
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

        {/* Empty state */}
        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <Flag size={40} style={{ color: C.muted }} />
            <p className="text-[16px] font-bold mt-4" style={{ color: C.text }}>
              {search ? `No results for "${search}"` : 'No features yet'}
            </p>
            <p className="text-[13px] mt-1" style={{ color: C.muted }}>
              {search ? 'Try a different search term' : 'Check back soon — we are always building!'}
            </p>
            {user && !search && (
              <button onClick={() => setShowSubmit(true)}
                className="mt-4 px-5 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                Request a Feature
              </button>
            )}
          </div>
        )}

        {/* Grouped view (All filter) */}
        {!loading && filter === 'all' && displayed.length > 0 && (
          <div className="flex flex-col gap-8">
            {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([status, items]) => {
              const s = STATUSES.find(x => x.value === status)
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s?.color }} />
                    <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: s?.color }}>
                      {s?.label}
                    </p>
                    <span className="text-[11px] px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: s?.bg, color: s?.color }}>
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {items.map(feat => (
                      <FeatureCard key={feat.id} feat={feat} votedIds={votedIds} onVote={handleVote} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Flat view (specific filter) */}
        {!loading && filter !== 'all' && displayed.length > 0 && (
          <div className="flex flex-col gap-2">
            {displayed.map(feat => (
              <FeatureCard key={feat.id} feat={feat} votedIds={votedIds} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>

      {/* ── Submit Request Dialog ─────────────────────────────── */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={e => e.target === e.currentTarget && setShowSubmit(false)}>
          <div className="bg-white rounded-2xl border w-full max-w-md p-6"
               style={{ borderColor: C.border, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[16px] font-bold" style={{ color: C.text }}>Request a Feature</p>
              <button onClick={() => setShowSubmit(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70"
                style={{ backgroundColor: C.bg }}>
                <X size={16} style={{ color: C.muted }} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>Title *</p>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="What feature do you need?"
                  className="w-full h-10 px-3 rounded-xl text-[13px]"
                  style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>Description</p>
                <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Describe what it should do and why you need it..."
                  rows={3} className="w-full px-3 py-2 rounded-xl text-[13px] resize-none"
                  style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>Category</p>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl text-[13px]"
                  style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none' }}>
                  {CATEGORIES.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <p className="text-[11px] px-3 py-2 rounded-xl"
                 style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                Our team reviews all requests before they appear publicly.
              </p>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setShowSubmit(false)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={!title.trim() || submitting}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  {submitting
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                    : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
             style={{ backgroundColor: C.dark, border: `1px solid ${C.lime}`, color: C.lime }}>
          <CheckCircle size={15} />
          <p className="text-[13px] font-bold whitespace-nowrap">{toast}</p>
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0);    }
          100% { opacity: 0; transform: translateX(-50%) translateY(-24px); }
        }
      `}</style>

      {/* Footer — matches landing page */}
      <footer className="py-16 border-t" style={{ background: '#1a2410', borderColor: '#1a2410' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

            {/* Brand + newsletter */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.lime }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                       stroke={C.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <span className="text-[16px] font-black text-white">Riazify</span>
              </div>
              <p className="text-[13px] leading-relaxed mb-5" style={{ color: C.muted }}>
                Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers.
              </p>
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(143,255,0,0.2)' }}>
                <input
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Your email..."
                  className="flex-1 px-4 py-2.5 text-[13px] outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                <button className="px-4 py-2.5 text-[12px] font-black shrink-0"
                        style={{ background: C.lime, color: C.dark }}>
                  Subscribe
                </button>
              </div>
            </div>

            {/* Links columns */}
            {[
              { title: 'Product', links: [
                  { label: 'Features',         href: '/#features'  },
                  { label: 'Pricing',          href: '/#pricing'   },
                  { label: 'Changelog',        href: '#'           },
                  { label: 'Roadmap',          href: '/roadmap'    },
                  { label: 'Chrome Extension', href: '#'           },
                ]},
              { title: 'Company', links: [
                  { label: 'About',     href: '#' },
                  { label: 'Blog',      href: '#' },
                  { label: 'Careers',   href: '#' },
                  { label: 'Press Kit', href: '#' },
                ]},
              { title: 'Legal', links: [
                  { label: 'Privacy Policy',   href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Cookie Policy',    href: '#' },
                  { label: 'GDPR',             href: '#' },
                ]},
            ].map(col => (
              <div key={col.title}>
                <p className="text-[12px] font-black tracking-wider mb-4 text-white">{col.title.toUpperCase()}</p>
                <div className="flex flex-col gap-2.5">
                  {col.links.map(l => (
                    <Link key={l.label} href={l.href}
                       className="text-[13px] transition-opacity hover:opacity-100 opacity-60"
                       style={{ color: l.label === 'Roadmap' ? C.lime : C.muted }}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t flex items-center justify-between flex-wrap gap-4"
               style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[12px]" style={{ color: C.muted }}>© {new Date().getFullYear()} Riazify — All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['Twitter', 'LinkedIn', 'YouTube', 'Discord'].map(s => (
                <a key={s} href="#" className="text-[12px] font-semibold transition-opacity hover:opacity-100 opacity-50"
                   style={{ color: C.muted }}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ── Feature Card ───────────────────────────────────────────────
function FeatureCard({ feat, votedIds, onVote }: {
  feat: Feature; votedIds: Set<string>; onVote: (f: Feature) => void
}) {
  const voted    = votedIds.has(feat.id)
  const s        = STATUSES.find(x => x.value === feat.status)
  const [pop,    setPop]    = useState(false)
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
    <div className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm"
         style={{ backgroundColor: C.surface, borderColor: voted ? C.limeDeep + '50' : C.border }}>

      {/* Vote button with animation */}
      <div className="relative shrink-0">
        <button onClick={handleClick}
          className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border transition-all"
          style={{
            borderColor:     voted ? C.limeDeep : C.border,
            backgroundColor: voted ? C.limeTint : C.bg,
            minWidth:        56,
            cursor:          voted ? 'default' : 'pointer',
            transform:       pop ? 'scale(0.85)' : 'scale(1)',
            transition:      'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), background-color 0.2s ease, border-color 0.2s ease',
          }}>
          <ArrowUp size={14}
            style={{
              color:      voted ? C.limeDeep : C.muted,
              transform:  pop ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.15s ease',
            }} />
          <span className="text-[16px] font-bold leading-tight"
                style={{ color: voted ? C.limeDeep : C.text }}>
            {feat.votes}
          </span>
          {voted && (
            <span className="text-[9px] font-bold" style={{ color: C.limeDeep }}>Voted</span>
          )}
        </button>

        {/* +1 floating animation */}
        {showPlus && (
          <div className="absolute left-1/2 pointer-events-none font-bold text-[13px]"
               style={{
                 color:     C.limeDeep,
                 transform: 'translateX(-50%)',
                 animation: 'floatUp 0.8s ease forwards',
                 top: -8,
               }}>
            +1
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold" style={{ color: C.text }}>{feat.title}</p>
        {feat.description && (
          <p className="text-[12px] mt-0.5 line-clamp-2" style={{ color: C.muted }}>{feat.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: C.bg, color: C.muted }}>
            <Tag size={10} /> {feat.category}
          </span>
        </div>
      </div>

      {/* Status + Share */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/roadmap#${feat.id}`)
            alert('Link copied!')
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all hover:opacity-70"
          title="Copy link"
          style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ backgroundColor: s?.bg ?? C.bg, color: s?.color ?? C.muted }}>
          {s?.label ?? feat.status}
        </span>
      </div>
    </div>
  )
}
