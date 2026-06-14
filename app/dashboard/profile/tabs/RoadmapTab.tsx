'use client'
// app/dashboard/profile/tabs/RoadmapTab.tsx
// Roadmap tab inside user profile — logged-in users vote + submit requests

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { ArrowUp, Plus, X, Tag, Flag, ExternalLink, CheckCircle, Search } from 'lucide-react'

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

const CATEGORIES = ['New Feature', 'UI / UX', 'Integration', 'Performance', 'Bug Fix']

interface Feature {
  id: string; title: string; description: string | null
  status: string; votes: number; category: string; created_at: string
}

export default function RoadmapUserTab() {
  const supabase = createClient()

  const [features,    setFeatures]    = useState<Feature[]>([])
  const [votedIds,    setVotedIds]    = useState<Set<string>>(new Set())
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('all')
  const [search,      setSearch]      = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const [user,        setUser]        = useState<any>(null)
  const [showSubmit,  setShowSubmit]  = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [title,       setTitle]       = useState('')
  const [desc,        setDesc]        = useState('')
  const [category,    setCategory]    = useState('New Feature')
  const [toast,       setToast]       = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const { data } = await (supabase as any)
        .from('feature_requests')
        .select('*')
        .eq('is_public', true)
        .order('votes', { ascending: false })
      setFeatures(data ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    try {
      const stored = localStorage.getItem('riazify_voted')
      if (stored) setVotedIds(new Set(JSON.parse(stored)))
    } catch { /* ignore */ }
  }, [load])

  function showToastMsg(msg: string) {
    setToast(msg); setTimeout(() => setToast(null), 3000)
  }

  async function handleVote(feat: Feature) {
    if (votedIds.has(feat.id)) { showToastMsg('Already voted!'); return }
    try {
      await (supabase as any).from('feature_votes').insert([{ feature_id: feat.id, user_id: user?.id }])
      await (supabase as any).from('feature_requests')
        .update({ votes: (feat.votes ?? 0) + 1 }).eq('id', feat.id)
      const newVoted = new Set([...votedIds, feat.id])
      setVotedIds(newVoted)
      localStorage.setItem('riazify_voted', JSON.stringify([...newVoted]))
      setFeatures(f => f.map(x => x.id === feat.id ? { ...x, votes: x.votes + 1 } : x))
      showToastMsg('Vote recorded!')
    } catch (e) { console.error(e) }
  }

  async function handleSubmit() {
    if (!title.trim() || !user) return
    setSubmitting(true)
    try {
      await (supabase as any).from('feature_requests').insert([{
        title:             title.trim(),
        description:       desc.trim() || null,
        category,
        status:            'planned',
        votes:             0,
        is_public:         false,
        submitted_by:      user.id,
        submitted_by_name: user.user_metadata?.full_name ?? user.email,
      }])
      setShowSubmit(false)
      setTitle(''); setDesc(''); setCategory('New Feature')
      showToastMsg('Request submitted for review!')
    } catch (e) {
      console.error(e)
      showToastMsg('Failed to submit.')
    }
    setSubmitting(false)
  }

  const displayed = features
    .filter(f => filter === 'all' ? true : f.status === filter)
    .filter(f => {
      const q = search.toLowerCase()
      return !q || f.title.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q)
    })

  const counts = {
    all:         features.length,
    in_progress: features.filter(f => f.status === 'in_progress').length,
    planned:     features.filter(f => f.status === 'planned').length,
    done:        features.filter(f => f.status === 'done').length,
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[17px] font-bold" style={{ color: C.text }}>Product Roadmap</h2>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Vote on features you want. Your votes shape what we build next.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/roadmap" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-bold hover:opacity-80"
            style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
            <ExternalLink size={13} /> Full Board
          </a>
          <button onClick={() => setShowSubmit(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold hover:opacity-80"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            <Plus size={14} /> Request Feature
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Features', value: counts.all,         color: C.lime    },
          { label: 'In Progress',    value: counts.in_progress, color: '#1D70F5' },
          { label: 'Shipped',        value: counts.done,        color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="p-3.5 rounded-2xl border text-center"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[24px] font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px]" style={{ color: C.muted }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {([
            { key: 'all',         label: 'All',         count: counts.all         },
            { key: 'in_progress', label: 'In Progress', count: counts.in_progress },
            { key: 'planned',     label: 'Planned',     count: counts.planned     },
            { key: 'done',        label: 'Done',        count: counts.done        },
          ] as const).map(f => {
            const s = STATUSES.find(x => x.value === f.key)
            const isActive = filter === f.key
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all"
                style={{
                  backgroundColor: isActive ? (s?.bg ?? C.dark) : 'transparent',
                  color:           isActive ? (s?.color ?? C.lime) : C.muted,
                  borderColor:     isActive ? (s?.color ?? C.dark) : 'transparent',
                }}>
                {f.label}
                <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                      style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 h-8 px-3 rounded-xl flex-1"
             style={{ border: `1.5px solid ${searchFocus ? C.lime : C.border}`, backgroundColor: C.surface, minWidth: 150 }}>
          <Search size={12} style={{ color: C.muted, flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
            placeholder="Search features..." className="flex-1 text-[12px] bg-transparent"
            style={{ color: C.text, outline: 'none', border: 'none' }} />
          {search && <button onClick={() => setSearch('')}><X size={11} style={{ color: C.muted }} /></button>}
        </div>
      </div>

      {/* Feature list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 animate-spin"
               style={{ borderColor: C.border, borderTopColor: C.lime }} />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center py-14 rounded-2xl border"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <Flag size={32} style={{ color: C.muted }} />
          <p className="text-[14px] font-bold mt-3" style={{ color: C.muted }}>
            {search ? `No results for "${search}"` : 'No features yet'}
          </p>
          <p className="text-[12px] mt-1" style={{ color: C.muted }}>
            {search ? 'Try a different term' : 'Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayed.map(feat => {
            const voted = votedIds.has(feat.id)
            const s = STATUSES.find(x => x.value === feat.status)
            return (
              <div key={feat.id}
                   className="flex items-center gap-3 p-4 rounded-2xl border transition-all"
                   style={{ backgroundColor: C.surface, borderColor: voted ? C.limeDeep + '50' : C.border }}>
                <button onClick={() => handleVote(feat)}
                  className="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border transition-all shrink-0"
                  style={{
                    borderColor: voted ? C.limeDeep : C.border,
                    backgroundColor: voted ? C.limeTint : C.bg,
                    minWidth: 48, cursor: voted ? 'default' : 'pointer',
                  }}>
                  <ArrowUp size={13} style={{ color: voted ? C.limeDeep : C.muted }} />
                  <span className="text-[15px] font-bold" style={{ color: voted ? C.limeDeep : C.text }}>
                    {feat.votes}
                  </span>
                  {voted && <span className="text-[9px] font-bold" style={{ color: C.limeDeep }}>Voted</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: C.text }}>{feat.title}</p>
                  {feat.description && (
                    <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: C.muted }}>{feat.description}</p>
                  )}
                  <span className="flex items-center gap-1 text-[10px] mt-1 w-fit px-2 py-0.5 rounded-lg"
                        style={{ backgroundColor: C.bg, color: C.muted }}>
                    <Tag size={9} /> {feat.category}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: s?.bg ?? C.bg, color: s?.color ?? C.muted }}>
                  {s?.label ?? feat.status}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Submit dialog */}
      {showSubmit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setShowSubmit(false)}>
          <div className="bg-white rounded-2xl border w-full max-w-sm p-5"
               style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[15px] font-bold" style={{ color: C.text }}>Request a Feature</p>
              <button onClick={() => setShowSubmit(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:opacity-70"
                style={{ backgroundColor: C.bg }}>
                <X size={14} style={{ color: C.muted }} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Feature title *"
                className="w-full h-10 px-3 rounded-xl text-[13px]"
                style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none' }} />
              <textarea value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Describe what it should do..."
                rows={2} className="w-full px-3 py-2 rounded-xl text-[13px] resize-none"
                style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none' }} />
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-[13px]"
                style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-[11px] px-3 py-2 rounded-xl"
                 style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                Our team reviews all requests before they go public.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowSubmit(false)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                  style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
                <button onClick={handleSubmit} disabled={!title.trim() || submitting}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50"
                  style={{ backgroundColor: C.dark, color: C.lime }}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: C.dark, border: `1px solid ${C.lime}`, color: C.lime }}>
          <CheckCircle size={14} />
          <p className="text-[13px] font-bold">{toast}</p>
        </div>
      )}
    </div>
  )
}