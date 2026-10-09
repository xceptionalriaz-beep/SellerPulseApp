'use client'
// components/admin/tabs/FeatureRoadmapTab.tsx

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ArrowUp, Plus, Trash2, CheckCircle, X, Search,
  ChevronDown, ExternalLink, RefreshCw, Eye, EyeOff,
  Clock, Flag, Tag, Pencil, RotateCcw,
} from 'lucide-react'

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
  green:    '#16a34a',
}

// ── Status config ──────────────────────────────────────────────
const STATUSES = [
  { value: 'planned',     label: 'Planned',      color: '#FB923C', bg: '#FFF7ED' },
  { value: 'in_progress', label: 'In Progress',  color: '#1D70F5', bg: '#EFF6FF' },
  { value: 'under_review',label: 'Under Review', color: '#8B5CF6', bg: '#F5F3FF' },
  { value: 'done',        label: 'Done',         color: '#16a34a', bg: '#F0FDF4' },
  { value: 'rejected',    label: 'Rejected',     color: '#b91c1c', bg: '#FEF2F2' },
]

const CATEGORIES = ['New Feature', 'UI / UX', 'Integration', 'Performance', 'Bug Fix']

// ── Interfaces ─────────────────────────────────────────────────
interface FeatureRequest {
  id:               string
  title:            string
  description:      string | null
  status:           string
  votes:            number
  category:         string
  is_public:        boolean
  submitted_by:     string | null
  submitted_by_name:string | null
  created_at:       string
}

interface Props {
  isInvestorMode?:      boolean
  isMobile?:            boolean
  startChartAnimation?: boolean
}

// ── FocusInput helper ──────────────────────────────────────────
function FocusInput({ value, onChange, placeholder, multiline }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; multiline?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const style = {
    border: `1.5px solid ${focused ? C.lime : C.border}`,
    boxShadow: focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
    backgroundColor: C.bg, color: C.text, outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    borderRadius: 12, padding: '8px 12px', width: '100%',
    fontSize: 13, fontFamily: 'inherit',
  }
  if (multiline) return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      rows={3} style={{ ...style, resize: 'none' }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  )
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ ...style, height: 40 }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  )
}

// ── StatusBadge ────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find(x => x.value === status) ?? STATUSES[0]
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
          style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function FeatureRoadmapTab(_props: Props) {
  const { can } = useTabPermissions('feature_roadmap')
  const supabase = createClient()

  // ── State ──────────────────────────────────────────────────
  const [features,      setFeatures]      = useState<FeatureRequest[]>([])
  const [loading,       setLoading]       = useState(true)
  const [refreshing,    setRefreshing]    = useState(false)
  const [filter,        setFilter]        = useState<'all' | 'pending' | 'planned' | 'in_progress' | 'under_review' | 'done' | 'rejected'>('all')
  const [search,        setSearch]        = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [addDialog,     setAddDialog]     = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<FeatureRequest | null>(null)
  const [statusMenu,    setStatusMenu]    = useState<string | null>(null)
  const [toast,         setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving,        setSaving]        = useState(false)
  const [editFeature,   setEditFeature]   = useState<FeatureRequest | null>(null)
  const [editTitle,     setEditTitle]     = useState('')
  const [editDesc,      setEditDesc]      = useState('')
  const [editSaving,    setEditSaving]    = useState(false)
  const [voteReset,     setVoteReset]     = useState<FeatureRequest | null>(null)
  const [catFilter,     setCatFilter]     = useState('All')
  const [catOpen,       setCatOpen]       = useState(false)
  const [expandedCell,  setExpandedCell]  = useState<{ id: string; field: 'title' | 'desc' } | null>(null)

  // Add dialog state
  const [newTitle,    setNewTitle]    = useState('')
  const [newDesc,     setNewDesc]     = useState('')
  const [newCategory, setNewCategory] = useState('New Feature')
  const [newStatus,   setNewStatus]   = useState('planned')
  const [newPublic,   setNewPublic]   = useState(true)

  // ── Load ───────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const { data } = await (supabase as any)
        .from('feature_requests')
        .select('*')
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false })
      setFeatures(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await load()
  }

  // ── Add Feature ────────────────────────────────────────────
  async function handleAdd() {
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      await (supabase as any).from('feature_requests').insert([{
        title:       newTitle.trim(),
        description: newDesc.trim() || null,
        status:      newStatus,
        category:    newCategory,
        is_public:   newPublic,
        votes:       0,
      }])
      await load()
      setAddDialog(false)
      setNewTitle(''); setNewDesc(''); setNewCategory('New Feature')
      setNewStatus('planned'); setNewPublic(true)
      showToast('Feature added to roadmap')
    } catch (e) {
      console.error(e)
      showToast('Failed to add feature', 'error')
    }
    setSaving(false)
  }

  // ── Change Status ──────────────────────────────────────────
  async function handleStatusChange(id: string, status: string) {
    try {
      await (supabase as any).from('feature_requests').update({ status }).eq('id', id)
      setFeatures(f => f.map(x => x.id === id ? { ...x, status } : x))
      setStatusMenu(null)
      showToast('Status updated')
    } catch (e) {
      console.error(e)
      showToast('Failed to update status', 'error')
    }
  }

  // ── Toggle Visibility ──────────────────────────────────────
  async function handleTogglePublic(feat: FeatureRequest) {
    try {
      await (supabase as any).from('feature_requests')
        .update({ is_public: !feat.is_public }).eq('id', feat.id)
      setFeatures(f => f.map(x => x.id === feat.id ? { ...x, is_public: !feat.is_public } : x))
      showToast(feat.is_public ? 'Feature hidden from public' : 'Feature visible to public')
    } catch (e) {
      console.error(e)
      showToast('Failed to update visibility', 'error')
    }
  }

  // ── Approve Pending ────────────────────────────────────────
  async function handleApprove(feat: FeatureRequest) {
    try {
      await (supabase as any).from('feature_requests')
        .update({ is_public: true, status: 'planned' }).eq('id', feat.id)
      setFeatures(f => f.map(x => x.id === feat.id ? { ...x, is_public: true, status: 'planned' } : x))
      showToast(`"${feat.title}" approved and published`)
    } catch (e) {
      console.error(e)
      showToast('Failed to approve feature', 'error')
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  async function handleDelete(feat: FeatureRequest) {
    try {
      await (supabase as any).from('feature_requests').delete().eq('id', feat.id)
      setFeatures(f => f.filter(x => x.id !== feat.id))
      setDeleteConfirm(null)
      showToast('Feature deleted')
    } catch (e) {
      console.error(e)
      showToast('Failed to delete feature', 'error')
    }
  }

  // ── Edit Feature ───────────────────────────────────────────
  function openEdit(feat: FeatureRequest) {
    setEditFeature(feat)
    setEditTitle(feat.title)
    setEditDesc(feat.description ?? '')
  }

  async function handleEdit() {
    if (!editFeature || !editTitle.trim()) return
    setEditSaving(true)
    try {
      await (supabase as any).from('feature_requests')
        .update({ title: editTitle.trim(), description: editDesc.trim() || null })
        .eq('id', editFeature.id)
      setFeatures(f => f.map(x => x.id === editFeature.id
        ? { ...x, title: editTitle.trim(), description: editDesc.trim() || null }
        : x
      ))
      setEditFeature(null)
      showToast('Feature updated')
    } catch (e) {
      console.error(e)
      showToast('Failed to update feature', 'error')
    }
    setEditSaving(false)
  }

  // ── Reset Votes ────────────────────────────────────────────
  async function confirmVoteReset() {
    if (!voteReset) return
    try {
      await (supabase as any).from('feature_requests').update({ votes: 0 }).eq('id', voteReset.id)
      await (supabase as any).from('feature_votes').delete().eq('feature_id', voteReset.id)
      setFeatures(f => f.map(x => x.id === voteReset.id ? { ...x, votes: 0 } : x))
      setVoteReset(null)
      showToast('Votes reset to 0')
    } catch (e) {
      console.error(e)
      showToast('Failed to reset votes', 'error')
    }
  }

  // ── Derived stats ──────────────────────────────────────────
  const totalVotes   = features.filter(f => f.is_public).reduce((s, f) => s + (f.votes ?? 0), 0)
  const pendingCount = features.filter(f => !f.is_public && f.submitted_by).length
  const doneCount    = features.filter(f => f.status === 'done').length

  // ── Filter + search (fixed) ───────────────────────────────
  const displayed = features.filter(f => {
    if (filter === 'pending') return !f.is_public && !!f.submitted_by
    if (filter !== 'all')     return f.status === filter
    return true
  }).filter(f => {
    if (catFilter !== 'All') return f.category === catFilter
    return true
  }).filter(f => {
    const q = search.toLowerCase()
    if (!q) return true
    return f.title.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q)
  })

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-5" style={{ color: C.text }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: C.text }}>
            User Roadmap & Feature Voting
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: C.muted }}>
            Stop guessing. Build exactly what your paying customers are begging for.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/roadmap" target="_blank" rel="noreferrer noopener"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-bold transition-all hover:opacity-80"
            style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
            <ExternalLink size={13} /> View Public Board
          </a>
          {can('view_roles') && <button onClick={() => setAddDialog(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Plus size={14} /> Add Feature
          </button>}
          <button onClick={handleRefresh}
            className="w-8 h-8 flex items-center justify-center rounded-xl border transition-all hover:opacity-70"
            style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <RefreshCw size={14} style={{ color: C.muted, animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Features', value: features.length,  icon: Flag,  color: C.lime   },
          { label: 'Total Votes',    value: totalVotes,        icon: ArrowUp, color: '#1D70F5' },
          { label: 'Shipped',        value: doneCount,         icon: CheckCircle, color: C.green },
          { label: 'Pending Approval', value: pendingCount,   icon: Clock, color: '#FB923C' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-2xl border flex items-center gap-3"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: color + '18' }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-[20px] font-bold leading-tight" style={{ color: C.text }}>{value}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs + Search ────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {([
            { key: 'all',          label: 'All',           count: features.length },
            { key: 'pending',      label: 'Pending',       count: pendingCount,   color: '#FB923C' },
            { key: 'planned',      label: 'Planned',       count: features.filter(f => f.status === 'planned').length },
            { key: 'in_progress',  label: 'In Progress',   count: features.filter(f => f.status === 'in_progress').length },
            { key: 'under_review', label: 'Under Review',  count: features.filter(f => f.status === 'under_review').length },
            { key: 'done',         label: 'Done',          count: doneCount },
            { key: 'rejected',     label: 'Rejected',      count: features.filter(f => f.status === 'rejected').length },
          ] as const).map(f => {
            const isActive = filter === f.key
            const s = STATUSES.find(x => x.value === f.key)
            const activeColor = f.key === 'all' ? C.dark : f.key === 'pending' ? '#FB923C' : (s?.color ?? C.dark)
            const activeBg    = f.key === 'all' ? C.dark : f.key === 'pending' ? '#FFF7ED' : (s?.bg ?? C.limeTint)
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  backgroundColor: isActive ? activeBg : 'transparent',
                  color:           isActive ? (f.key === 'all' ? C.lime : activeColor) : C.muted,
                  border:          `1px solid ${isActive ? activeBg : 'transparent'}`,
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

        {/* Search */}
        <div className="flex items-center gap-2 h-8 px-3 rounded-xl flex-1"
             style={{
               border: `1.5px solid ${searchFocused ? C.lime : C.border}`,
               boxShadow: searchFocused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
               backgroundColor: C.surface, minWidth: 200,
             }}>
          <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            placeholder="Search features..."
            className="flex-1 text-[12px] bg-transparent"
            style={{ color: C.text, outline: 'none', border: 'none' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: C.muted }} /></button>}
        </div>

        {/* Fix 4: Category filter — custom branded dropdown */}
        <div className="relative shrink-0">
          <button onClick={() => setCatOpen(o => !o)}
            className="flex items-center gap-2 h-8 px-3 rounded-xl text-[11px] font-bold transition-all"
            style={{
              backgroundColor: catFilter !== 'All' ? C.dark    : C.bg,
              color:           catFilter !== 'All' ? C.lime    : C.muted,
              border:          `1.5px solid ${catFilter !== 'All' ? C.dark : C.border}`,
            }}>
            <Tag size={11} />
            {catFilter === 'All' ? 'All Categories' : catFilter}
            <ChevronDown size={11} style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {catOpen && (<>
            <div className="fixed inset-0 z-40" onClick={() => setCatOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 z-50 rounded-2xl border py-1.5 w-44"
                 style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              {['All', ...CATEGORIES].map(c => (
                <button key={c}
                  onClick={() => { setCatFilter(c); setCatOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: catFilter === c ? C.limeTint : 'transparent',
                    color:           catFilter === c ? C.limeDeep : C.text,
                  }}>
                  {catFilter === c && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.limeDeep }} />}
                  {catFilter !== c && <div className="w-1.5 h-1.5 rounded-full shrink-0 opacity-0" />}
                  {c === 'All' ? 'All Categories' : c}
                </button>
              ))}
            </div>
          </>)}
        </div>
      </div>

      {/* ── Feature Table ───────────────────────────────────── */}
      <div className="rounded-2xl border"
           style={{ borderColor: C.border, backgroundColor: C.surface }}>

        {/* Column headers — switch based on filter */}
        {filter === 'pending' ? (
          <div className="px-4 py-2 grid text-[10px] font-bold uppercase tracking-wide"
               style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 0.8fr 1.6fr', columnGap: 12, backgroundColor: '#FFFBEB', borderBottom: '1px solid #FDE68A', color: '#92400E' }}>
            <span>Title</span>
            <span>Description</span>
            <span>Category</span>
            <span>Submitted By</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
        ) : (
          <div className="px-4 py-2.5 grid text-[10px] font-bold uppercase tracking-wide"
               style={{ gridTemplateColumns: '52px 2.5fr 1.2fr 1fr 1fr 1.8fr', columnGap: 12, backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <span>Votes</span>
            <span>Feature</span>
            <span>Category</span>
            <span>Status</span>
            <span>Added</span>
            <span>Actions</span>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="px-4 py-3 grid items-center animate-pulse"
                   style={{ gridTemplateColumns: '52px 2.5fr 1.2fr 1fr 1fr 1.8fr', columnGap: 12 }}>
                <div className="h-8 rounded-xl" style={{ backgroundColor: C.bg }} />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3.5 rounded-lg" style={{ backgroundColor: C.bg, width: '60%' }} />
                  <div className="h-3 rounded-lg" style={{ backgroundColor: C.bg, width: '40%' }} />
                </div>
                <div className="h-3 rounded-lg" style={{ backgroundColor: C.bg, width: '70%' }} />
                <div className="h-6 rounded-full" style={{ backgroundColor: C.bg, width: '80%' }} />
                <div className="h-3 rounded-lg" style={{ backgroundColor: C.bg, width: '60%' }} />
                <div className="flex gap-1.5">
                  {[1,2,3,4].map(j => <div key={j} className="w-7 h-7 rounded-xl" style={{ backgroundColor: C.bg }} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Flag size={32} style={{ color: C.muted }} />
            <p className="text-[15px] font-bold mt-3" style={{ color: C.muted }}>
              {filter === 'pending' ? 'No pending requests' : search ? `No results for "${search}"` : `No ${filter === 'all' ? '' : filter} features`}
            </p>
            {filter === 'all' && !search && (
              <button onClick={() => setAddDialog(true)}
                className="mt-3 px-4 py-2 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                Add your first feature
              </button>
            )}
          </div>
        )}

        {/* Rows */}
        {!loading && displayed.length > 0 && (
          <div className="flex flex-col divide-y overflow-y-auto"
               style={{ borderColor: C.border, maxHeight: 480 }}>
            {displayed.map((feat, rowIdx) => {
              const isTitleExp = expandedCell?.id === feat.id && expandedCell?.field === 'title'
              const isDescExp  = expandedCell?.id === feat.id && expandedCell?.field === 'desc'

              // ── PENDING ROW (slim, title/desc columns) ─────────
              if (filter === 'pending') return (
                <div key={feat.id}
                     className="px-4 py-2 grid items-center"
                     style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 0.8fr 1.6fr', columnGap: 12,
                              backgroundColor: rowIdx % 2 === 0 ? '#FFFBEB' : '#FFFDE7',
                              borderLeft: '3px solid #FDE68A' }}>

                  {/* Title with expand */}
                  <div className="min-w-0 relative">
                    <div className="flex items-center gap-1">
                      <p className="text-[12px] font-bold" style={{ color: C.text,
                           overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                           maxWidth: isTitleExp ? '100%' : 130 }}>
                        {feat.title.length > 28 && !isTitleExp ? feat.title.slice(0, 28) + '…' : feat.title}
                      </p>
                      {feat.title.length > 28 && (
                        <button onClick={() => setExpandedCell(isTitleExp ? null : { id: feat.id, field: 'title' })}
                          className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md transition-all"
                          style={{ backgroundColor: isTitleExp ? C.limeTint : C.bg, color: isTitleExp ? C.limeDeep : C.muted }}>
                          <Eye size={11} />
                        </button>
                      )}
                    </div>
                    {isTitleExp && (
                      <>
                        <div className="fixed inset-0 z-[9998]" onClick={() => setExpandedCell(null)} />
                        <div className="absolute left-0 bottom-full mb-1 z-[9999] p-3 rounded-xl border text-[12px] leading-relaxed"
                             style={{ backgroundColor: C.surface, borderColor: C.lime, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', color: C.text, minWidth: 220, maxWidth: 320 }}>
                          {feat.title}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Description with expand */}
                  <div className="min-w-0 relative">
                    {feat.description ? (
                      <div className="flex items-center gap-1">
                        <p className="text-[11px]" style={{ color: C.muted,
                             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                             maxWidth: isDescExp ? '100%' : 130 }}>
                          {feat.description.length > 32 && !isDescExp ? feat.description.slice(0, 32) + '…' : feat.description}
                        </p>
                        {feat.description.length > 32 && (
                          <button onClick={() => setExpandedCell(isDescExp ? null : { id: feat.id, field: 'desc' })}
                            className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md transition-all"
                            style={{ backgroundColor: isDescExp ? C.limeTint : C.bg, color: isDescExp ? C.limeDeep : C.muted }}>
                            <Eye size={11} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px]" style={{ color: C.muted }}>—</span>
                    )}
                    {isDescExp && feat.description && (
                      <>
                        <div className="fixed inset-0 z-[9998]" onClick={() => setExpandedCell(null)} />
                        <div className="absolute left-0 bottom-full mb-1 z-[9999] p-3 rounded-xl border text-[11px] leading-relaxed"
                             style={{ backgroundColor: C.surface, borderColor: C.lime, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', color: C.text, minWidth: 220, maxWidth: 320 }}>
                          {feat.description}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Category */}
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-lg w-fit"
                        style={{ backgroundColor: C.bg, color: C.muted }}>
                    <Tag size={9} /> {feat.category}
                  </span>

                  {/* Submitted By */}
                  <span className="text-[11px] font-semibold truncate" style={{ color: C.text }}>
                    {feat.submitted_by_name ?? '—'}
                  </span>

                  {/* Date */}
                  <span className="text-[11px]" style={{ color: C.muted }}>
                    {new Date(feat.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {can('view_roles') && <button onClick={() => handleApprove(feat)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ backgroundColor: C.limeDeep, color: '#fff' }}>
                      <CheckCircle size={11} /> Approve
                    </button>}
                    {can('view_roles') && <button onClick={() => handleStatusChange(feat.id, 'rejected')}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold border"
                      style={{ borderColor: '#FECACA', color: C.red, backgroundColor: '#FEF2F2' }}>
                      <X size={11} /> Reject
                    </button>}
                    {can('view_roles') && <button onClick={() => setDeleteConfirm(feat)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg border transition-all hover:opacity-70"
                      style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
                      <Trash2 size={11} style={{ color: C.red }} />
                    </button>}
                  </div>
                </div>
              )

              // ── REGULAR ROW ────────────────────────────────────
              return (
                <div key={feat.id}
                     className="px-4 py-2 grid items-center transition-all hover:opacity-95"
                     style={{ gridTemplateColumns: '52px 2.5fr 1.2fr 1fr 1fr 1.8fr', columnGap: 12,
                              backgroundColor: rowIdx % 2 === 0 ? 'transparent' : C.bg }}>

                  {/* Votes — number only, no icon */}
                  <div className="flex items-center justify-center py-1.5 rounded-xl border"
                       style={{ borderColor: C.border, backgroundColor: C.surface }}>
                    <span className="text-[14px] font-bold" style={{ color: C.text }}>{feat.votes ?? 0}</span>
                  </div>

                  {/* Feature */}
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[13px] font-bold truncate" style={{ color: C.text }}>{feat.title}</p>
                      {!feat.is_public && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                              style={{ backgroundColor: C.bg, color: C.muted }}>Hidden</span>
                      )}
                    </div>
                    {feat.description && (
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: C.muted }}>{feat.description}</p>
                    )}
                  </div>

                  {/* Category */}
                  <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg w-fit"
                        style={{ backgroundColor: C.bg, color: C.muted }}>
                    <Tag size={10} /> {feat.category}
                  </span>

                  {/* Status */}
                  <div className="relative">
                    <button onClick={() => setStatusMenu(statusMenu === feat.id ? null : feat.id)}
                      className="flex items-center gap-1.5 h-7 px-2 rounded-lg border transition-all hover:opacity-80"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <StatusBadge status={feat.status} />
                      <ChevronDown size={10} style={{ color: C.muted }} />
                    </button>
                    {statusMenu === feat.id && (<>
                      <div className="fixed inset-0 z-[9998]" onClick={() => setStatusMenu(null)} />
                      <div className="absolute left-0 top-full mt-1 z-[9999] rounded-xl border py-1 w-40"
                           style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                        {STATUSES.map(s => (
                          <button key={s.value}
                            onClick={() => handleStatusChange(feat.id, s.value)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold hover:opacity-70"
                            style={{ backgroundColor: feat.status === s.value ? s.bg : 'transparent', color: s.color }}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </>)}
                  </div>

                  {/* Date */}
                  <span className="text-[11px]" style={{ color: C.muted }}>
                    {new Date(feat.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {can('view_roles') && <button onClick={() => handleTogglePublic(feat)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all hover:opacity-70"
                      title={feat.is_public ? 'Hide' : 'Show'}
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      {feat.is_public ? <Eye size={13} style={{ color: C.green }} /> : <EyeOff size={13} style={{ color: C.muted }} />}
                    </button>}
                    {can('view_roles') && <button onClick={() => openEdit(feat)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all hover:opacity-70"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <Pencil size={13} style={{ color: C.muted }} />
                    </button>}
                    {can('view_roles') && <button onClick={() => setVoteReset(feat)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all hover:opacity-70"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <RotateCcw size={12} style={{ color: C.muted }} />
                    </button>}
                    {can('view_roles') && <button onClick={() => setDeleteConfirm(feat)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all hover:opacity-70"
                      style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
                      <Trash2 size={13} style={{ color: C.red }} />
                    </button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Add Feature Dialog ─────────────────────────────── */}
      {addDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setAddDialog(false)}>
          <div className="bg-white rounded-2xl border w-full max-w-md overflow-hidden"
               style={{ borderColor: C.border, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color: C.text }}>Add Feature to Roadmap</p>
              <button onClick={() => setAddDialog(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70"
                style={{ backgroundColor: C.bg }}>
                <X size={16} style={{ color: C.muted }} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">

              {/* Title */}
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Feature Title <span style={{ color: C.red }}>*</span>
                </p>
                <FocusInput value={newTitle} onChange={setNewTitle} placeholder="e.g. Dark Mode UI" />
              </div>

              {/* Description */}
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Description</p>
                <FocusInput value={newDesc} onChange={setNewDesc}
                  placeholder="What will this feature do?" multiline />
              </div>

              {/* Category + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Category</p>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-[13px]"
                    style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Status</p>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-[13px]"
                    style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg, color: C.text, outline: 'none' }}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl"
                   style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: C.text }}>Visible to public</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    Show on /roadmap page immediately
                  </p>
                </div>
                <button onClick={() => setNewPublic(p => !p)}
                  className="w-11 h-6 rounded-full transition-all relative"
                  style={{ backgroundColor: newPublic ? C.limeDeep : C.border }}>
                  <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                       style={{ left: newPublic ? 22 : 2 }} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setAddDialog(false)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={!newTitle.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  {saving
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                    : <><Plus size={14} /> Add Feature</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Feature Dialog ───────────────────────────── */}
      {editFeature && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setEditFeature(null)}>
          <div className="bg-white rounded-2xl border w-full max-w-md overflow-hidden"
               style={{ borderColor: C.border, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color: C.text }}>Edit Feature</p>
              <button onClick={() => setEditFeature(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70"
                style={{ backgroundColor: C.bg }}>
                <X size={16} style={{ color: C.muted }} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Title <span style={{ color: C.red }}>*</span>
                </p>
                <FocusInput value={editTitle} onChange={setEditTitle} placeholder="Feature title" />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Description</p>
                <FocusInput value={editDesc} onChange={setEditDesc}
                  placeholder="What will this feature do?" multiline />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditFeature(null)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button onClick={handleEdit} disabled={!editTitle.trim() || editSaving}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  {editSaving
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                    : <><Pencil size={14} /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Dialog ──────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl border p-6 w-full max-w-sm"
               style={{ borderColor: C.border }}>
            <p className="text-[15px] font-bold mb-1" style={{ color: C.text }}>Delete Feature?</p>
            <p className="text-[13px] mb-5" style={{ color: C.muted }}>
              "{deleteConfirm.title}" will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                style={{ borderColor: C.border, color: C.muted }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: C.red, color: '#fff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Vote Reset Confirm ─────────────────────────────── */}
      {voteReset && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setVoteReset(null)}>
          <div className="bg-white rounded-2xl border p-6 w-full max-w-sm"
               style={{ borderColor: C.border }}>
            <p className="text-[15px] font-bold mb-1" style={{ color: C.text }}>Reset Votes?</p>
            <p className="text-[13px] mb-1" style={{ color: C.muted }}>
              "{voteReset.title}"
            </p>
            <p className="text-[13px] mb-5 font-bold" style={{ color: C.red }}>
              {voteReset.votes} votes will be permanently reset to 0.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setVoteReset(null)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                style={{ borderColor: C.border, color: C.muted }}>
                Cancel
              </button>
              <button onClick={confirmVoteReset}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: C.red, color: '#fff' }}>
                Reset to 0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
             style={{
               backgroundColor: toast.type === 'error' ? '#FEF2F2' : C.dark,
               border:          `1px solid ${toast.type === 'error' ? '#FECACA' : C.lime}`,
               color:           toast.type === 'error' ? C.red : C.lime,
             }}>
          {toast.type === 'error' ? <X size={15} /> : <CheckCircle size={15} />}
          <p className="text-[13px] font-bold">{toast.msg}</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
