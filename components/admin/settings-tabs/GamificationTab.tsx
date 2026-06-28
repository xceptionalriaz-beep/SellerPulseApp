'use client'
// components/admin/settings-tabs/GamificationTab.tsx

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Trophy, Plus, Trash2, Check, X, Save, RefreshCw,
  ChevronDown, ChevronUp, Star, Flame, Shield, Search,
  Zap, Users, Crown, Award, Target, CheckCircle,
  AlertTriangle, Clock, BarChart2, Edit,
} from 'lucide-react'

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
  amber:    '#d97706',
  green:    '#16a34a',
  blue:     '#1d4ed8',
  purple:   '#7c3aed',
}

// -- Constants --------------------------------------------------
const LEVEL_NAMES = ['', 'Beginner', 'Rising', 'Smart', 'Pro', 'Elite']
const LEVEL_COLORS  = ['', C.muted, C.blue, C.amber, C.purple, C.limeDeep]
const LEVEL_BG      = ['', C.bg, 'rgba(29,78,216,0.08)', 'rgba(217,119,6,0.08)', 'rgba(124,58,237,0.08)', C.limeTint]
const LEVEL_LUCIDE  = ['', Star, Star, Flame, Crown, Crown]
const LEVEL_XP    = [0, 0, 100, 300, 600, 1000]

const CATEGORIES = ['onboarding', 'engagement', 'revenue']
const REWARD_TYPES = ['badge', 'trial_extension', 'credits', 'feature', 'content', 'call', 'discount']
const ACTION_TYPES = ['search', 'title_built', 'order_protected', 'login_streak', 'referral', 'plan_upgraded', 'ebay_connected', 'profit_calc', 'manual']

const ICON_MAP: Record<string, React.ElementType> = {
  trophy:       Trophy,
  search:       Search,
  shield:       Shield,
  'shield-check': Shield,
  'shield-alert': Shield,
  flame:        Flame,
  star:         Star,
  zap:          Zap,
  users:        Users,
  crown:        Crown,
  award:        Award,
  target:       Target,
  type:         Edit,
  calculator:   BarChart2,
  store:        Target,
  'trending-up': BarChart2,
}

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? Trophy
}

// -- Helpers ----------------------------------------------------
function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function categoryColor(cat: string) {
  if (cat === 'onboarding') return { color: C.blue,   bg: 'rgba(29,78,216,0.08)'  }
  if (cat === 'engagement') return { color: C.amber,  bg: 'rgba(217,119,6,0.08)'  }
  if (cat === 'revenue')    return { color: C.limeDeep, bg: C.limeTint             }
  return { color: C.muted, bg: C.bg }
}

function rewardColor(type: string) {
  if (type === 'trial_extension') return { color: C.limeDeep, bg: C.limeTint              }
  if (type === 'badge')           return { color: C.purple,   bg: 'rgba(124,58,237,0.08)' }
  if (type === 'call')            return { color: C.blue,     bg: 'rgba(29,78,216,0.08)'  }
  if (type === 'content')         return { color: C.amber,    bg: 'rgba(217,119,6,0.08)'  }
  if (type === 'discount')        return { color: C.green,    bg: 'rgba(22,163,74,0.08)'  }
  return { color: C.muted, bg: C.bg }
}

// -- Toast ------------------------------------------------------
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark,    border: C.lime,   color: C.lime },
    error:   { bg: '#FEF2F2', border: '#FECACA', color: C.red  },
    info:    { bg: C.bg,      border: C.border,  color: C.text },
  }
  const t = map[type]
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
         style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}>
      <Check size={15} style={{ color: t.color }} />
      <p className="text-[13px] font-bold" style={{ color: t.color }}>{msg}</p>
    </div>
  )
}

// -- CustomDropdown ---------------------------------------------
function CustomDropdown({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void
  options: { label: string; value: string }[]; label: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  return (
    <div>
      <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>{label}</p>
      <div className="relative">
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between h-9 px-3 rounded-xl border text-[12px] font-bold transition-all"
          style={{ backgroundColor: C.bg, borderColor: open ? C.lime : C.border, color: C.text, boxShadow: open ? '0 0 0 3px rgba(143,255,0,0.12)' : 'none' }}>
          <span>{selected?.label ?? value}</span>
          <ChevronDown size={13} style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-20"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              {options.map(o => (
                <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold hover:bg-[#f4ffe6] transition-colors"
                  style={{ color: o.value === value ? C.limeDeep : C.text }}>
                  {o.label}
                  {o.value === value && <Check size={12} style={{ color: C.limeDeep }} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// -- Quest Modal ------------------------------------------------
function QuestModal({ quest, onClose, onSaved }: {
  quest?: any; onClose: () => void; onSaved: (q: any) => void
}) {
  const supabase = createClient()
  const isEdit   = !!quest

  const [title,        setTitle]        = useState(quest?.title        ?? '')
  const [description,  setDescription]  = useState(quest?.description  ?? '')
  const [rewardText,   setRewardText]   = useState(quest?.reward_text  ?? '')
  const [rewardType,   setRewardType]   = useState(quest?.reward_type  ?? 'badge')
  const [rewardValue,  setRewardValue]  = useState(String(quest?.reward_value  ?? 0))
  const [targetCount,  setTargetCount]  = useState(String(quest?.target_count  ?? 1))
  const [actionType,   setActionType]   = useState(quest?.action_type  ?? 'manual')
  const [xpReward,     setXpReward]     = useState(String(quest?.xp_reward     ?? 50))
  const [category,     setCategory]     = useState(quest?.category     ?? 'onboarding')
  const [saving,       setSaving]       = useState(false)
  const [visible,      setVisible]      = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  async function handleSave() {
    if (!title.trim() || !rewardText.trim()) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/gamification/quest/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({
          id: quest?.id, title, description, reward_text: rewardText,
          reward_type: rewardType, reward_value: Number(rewardValue),
          target_count: Number(targetCount), action_type: actionType,
          xp_reward: Number(xpReward), category,
        }),
      })
      const json = await res.json()
      if (res.ok) { onSaved(json.quest); handleClose() }
    } catch { /* silent */ }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
           style={{ backgroundColor: C.surface, maxHeight: '90vh',
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity: visible ? 1 : 0, transition: 'transform 0.25s ease, opacity 0.25s ease' }}
           onClick={e => e.stopPropagation()}>

        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Trophy size={16} style={{ color: C.limeDeep }} />
          <p className="text-[15px] font-black flex-1" style={{ color: C.dark }}>
            {isEdit ? 'Edit Quest' : 'New Quest'}
          </p>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>TITLE</p>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Run your first product search"
              className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>DESCRIPTION</p>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What does the user need to do?"
              className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>REWARD TEXT</p>
            <input value={rewardText} onChange={e => setRewardText(e.target.value)}
              placeholder="e.g. Unlock 3 bonus trial days"
              className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <CustomDropdown label="CATEGORY"    value={category}   onChange={setCategory}
              options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
            <CustomDropdown label="REWARD TYPE" value={rewardType} onChange={setRewardType}
              options={REWARD_TYPES.map(r => ({ value: r, label: r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <CustomDropdown label="ACTION TYPE" value={actionType} onChange={setActionType}
              options={ACTION_TYPES.map(a => ({ value: a, label: a.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))} />
            <div>
              <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>TARGET COUNT</p>
              <input value={targetCount} onChange={e => setTargetCount(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full h-9 px-3 rounded-xl border text-[13px] font-bold text-center outline-none"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>XP REWARD</p>
              <input value={xpReward} onChange={e => setXpReward(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full h-9 px-3 rounded-xl border text-[13px] font-bold text-center outline-none"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>REWARD VALUE</p>
              <input value={rewardValue} onChange={e => setRewardValue(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0 if not applicable"
                className="w-full h-9 px-3 rounded-xl border text-[13px] font-bold text-center outline-none"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t shrink-0" style={{ borderColor: C.border }}>
          <button onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !title.trim() || !rewardText.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
              : <><Save size={14} /> {isEdit ? 'Save Changes' : 'Create Quest'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// -- Fulfill Modal ----------------------------------------------
function FulfillModal({ item, onClose, onFulfilled }: {
  item: any; onClose: () => void; onFulfilled: (id: string) => void
}) {
  const supabase   = createClient()
  const [note,     setNote]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [visible,  setVisible]  = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  async function handleFulfill() {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/gamification/fulfill', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ progress_id: item.id, note }),
      })
      if (res.ok) { onFulfilled(item.id); handleClose() }
    } catch { /* silent */ }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
           style={{ backgroundColor: C.surface,
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity: visible ? 1 : 0, transition: 'transform 0.25s ease, opacity 0.25s ease' }}
           onClick={e => e.stopPropagation()}>

        <div className="flex items-center gap-3 px-5 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <CheckCircle size={16} style={{ color: C.limeDeep }} />
          <p className="text-[15px] font-black flex-1" style={{ color: C.dark }}>Fulfill Reward</p>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[11px] font-black" style={{ color: C.muted }}>USER</p>
            <p className="text-[13px] font-bold" style={{ color: C.dark }}>
              {item.profiles?.name ?? item.profiles?.email ?? '—'}
            </p>
            <p className="text-[11px]" style={{ color: C.muted }}>{item.profiles?.email}</p>
          </div>
          <div className="p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[11px] font-black" style={{ color: C.muted }}>QUEST</p>
            <p className="text-[13px] font-bold" style={{ color: C.dark }}>{item.quests?.title}</p>
            <p className="text-[11px]" style={{ color: C.limeDeep }}>{item.quests?.reward_text}</p>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>
              FULFILLMENT NOTE (optional)
            </p>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="e.g. Sent booking link via email, sent PDF to user@gmail.com"
              className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
              style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
            <button onClick={handleFulfill} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              {saving
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                : <><CheckCircle size={14} /> Mark Fulfilled</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// -- Badge Manager Section with Pagination ---------------------
function BadgeManagerSection({ badges }: { badges: any[] }) {
  const PAGE_SIZE = 6
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(badges.length / PAGE_SIZE)
  const paginated  = badges.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b"
           style={{ borderColor: C.border, backgroundColor: C.bg }}>
        <Award size={13} style={{ color: C.limeDeep }} />
        <p className="text-[10px] font-black tracking-wider flex-1" style={{ color: C.muted }}>BADGE MANAGER</p>
        <p className="text-[10px]" style={{ color: C.muted }}>{badges.length} badges total</p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {paginated.map(badge => {
          const BIcon      = getIcon(badge.icon)
          const earnedCount = badge.user_badges?.length ?? 0
          return (
            <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl border"
                 style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor: C.limeTint }}>
                <BIcon size={18} style={{ color: C.limeDeep }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black truncate" style={{ color: C.dark }}>{badge.name}</p>
                <p className="text-[10px] truncate" style={{ color: C.muted }}>{badge.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    +{badge.xp_reward} XP
                  </span>
                  <span className="text-[9px]" style={{ color: earnedCount > 0 ? C.limeDeep : C.muted }}>
                    {earnedCount.toLocaleString()} earned
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <p className="text-[10px]" style={{ color: C.muted }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, badges.length)} of {badges.length}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-80 disabled:opacity-30"
              style={{ border: `1px solid ${C.border}`, color: C.muted }}>
              <ChevronDown size={11} style={{ transform: 'rotate(90deg)' }} /> Prev
            </button>
            <span className="text-[11px] font-bold" style={{ color: C.text }}>
              {page + 1} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-80 disabled:opacity-30"
              style={{ border: `1px solid ${C.border}`, color: C.muted }}>
              Next <ChevronDown size={11} style={{ transform: 'rotate(-90deg)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------
export default function GamificationTab() {
  const supabase = createClient()

  const [quests,       setQuests]       = useState<any[]>([])
  const [badges,       setBadges]       = useState<any[]>([])
  const [leaderboard,  setLeaderboard]  = useState<any[]>([])
  const [fulfillments, setFulfillments] = useState<any[]>([])
  const [stats,        setStats]        = useState<any>(null)
  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)
  const [showNewQuest, setShowNewQuest] = useState(false)
  const [editQuest,    setEditQuest]    = useState<any | null>(null)
  const [fulfillItem,  setFulfillItem]  = useState<any | null>(null)
  const [deletingId,   setDeletingId]   = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'quests' | 'fulfillments' | 'leaderboard' | 'badges'>('quests')
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/gamification', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setQuests(json.quests ?? [])
        setBadges(json.badges ?? [])
        setLeaderboard(json.leaderboard ?? [])
        setFulfillments(json.pendingFulfillments ?? [])
        setStats(json.stats ?? null)
      }
    } catch (e) { console.error('[GamificationTab]', e) }
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function handleDeleteQuest(id: string) {
    setDeletingId(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/admin/gamification/quest/delete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id }),
      })
      setQuests(prev => prev.filter(q => q.id !== id))
      showToast('Quest deleted', 'info')
    } catch { showToast('Failed to delete', 'error') }
    setDeletingId(null)
  }

  async function handleToggleQuest(id: string, val: boolean) {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, is_active: val } : q))
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/gamification/quest/save', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body:    JSON.stringify({ id, is_active: val }),
    })
  }

  const SECTION_TABS = [
    { key: 'quests',       label: 'Quest Matrix',        count: quests.length          },
    { key: 'fulfillments', label: 'Fulfillment Queue',   count: fulfillments.length, warn: fulfillments.length > 0 },
    { key: 'leaderboard',  label: 'Leaderboard',         count: null                   },
    { key: 'badges',       label: 'Badge Manager',       count: badges.length          },
  ]

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black tracking-wider mb-0.5" style={{ color: C.muted }}>GAMIFICATION</p>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Quests, XP, badges and leaderboard — make Riazify addictive
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNewQuest(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl text-[12px] font-bold hover:opacity-80"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Plus size={13} /> New Quest
          </button>
          <button onClick={() => { setRefreshing(true); loadData() }} disabled={refreshing}
            className="flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* HUD Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { title: 'Active Quests',        value: stats?.activeQuests        ?? '—', icon: Trophy,       color: C.limeDeep, bg: C.limeTint              },
          { title: 'Completions Today',    value: stats?.completionsToday    ?? '—', icon: CheckCircle,  color: C.green,    bg: 'rgba(22,163,74,0.08)'  },
          { title: 'Avg Seller Level',     value: stats?.avgLevel            ?? '—', icon: Star,         color: C.amber,    bg: 'rgba(217,119,6,0.08)'  },
          { title: 'Pending Fulfillments', value: stats?.pendingFulfillments ?? '—', icon: AlertTriangle, color: (stats?.pendingFulfillments ?? 0) > 0 ? C.red : C.muted, bg: (stats?.pendingFulfillments ?? 0) > 0 ? 'rgba(185,28,28,0.08)' : C.bg },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
                  {card.title.toUpperCase()}
                </p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: card.bg }}>
                  <Icon size={15} style={{ color: card.color }} />
                </div>
              </div>
              {loading
                ? <div className="h-8 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />
                : <p className="text-[28px] font-black" style={{ color: C.dark }}>{card.value}</p>}
            </div>
          )
        })}
      </div>

      {/* Level guide */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Crown size={13} style={{ color: C.limeDeep }} />
          <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>SELLER LEVELS</p>
        </div>
        <div className="grid grid-cols-5 gap-0">
          {[1,2,3,4,5].map(level => {
            const LIcon = LEVEL_LUCIDE[level] as React.ElementType
            return (
              <div key={level} className="flex flex-col items-center gap-1 p-3 border-r last:border-r-0"
                   style={{ borderColor: C.border }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: LEVEL_BG[level] }}>
                  <LIcon size={16} style={{ color: LEVEL_COLORS[level] }} />
                </div>
                <p className="text-[11px] font-black" style={{ color: C.dark }}>{LEVEL_NAMES[level]}</p>
                <p className="text-[10px]" style={{ color: C.muted }}>
                  {LEVEL_XP[level]}+ XP
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 pt-1">
        {SECTION_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key as any)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all h-9"
            style={{
              backgroundColor: activeSection === tab.key ? '#8fff00' : C.surface,
              color:           activeSection === tab.key ? C.lime : C.muted,
              border:          `1px solid ${activeSection === tab.key ? C.dark : C.border}`,
            }}>
            {tab.label}
            {tab.count !== null && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: tab.warn ? C.red : activeSection === tab.key ? C.lime : C.bg,
                      color:           tab.warn ? '#fff'  : activeSection === tab.key ? C.dark : C.muted,
                    }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* -- QUEST MATRIX --------------------------------------- */}
      {activeSection === 'quests' && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="grid px-4 py-2.5 border-b"
               style={{ gridTemplateColumns: '2fr 0.8fr 1.2fr 0.6fr 0.5fr 0.5fr 0.4fr 0.4fr', gap: 10, borderColor: C.border, backgroundColor: C.bg }}>
            {['QUEST', 'CATEGORY', 'REWARD', 'TARGET', 'COMPLETED', 'XP', 'ACTIVE', ''].map(h => (
              <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col gap-2 p-4">
              {[0,1,2].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />)}
            </div>
          ) : quests.map(quest => {
            const catStyle = categoryColor(quest.category)
            const rwdStyle = rewardColor(quest.reward_type)
            const QIcon    = getIcon(quest.icon)
            const completedCount  = (quest.quest_progress ?? []).filter((p: any) => p.completed).length
            const totalUsers      = (quest.quest_progress ?? []).length
            const avgProgress     = totalUsers > 0
              ? Math.round((quest.quest_progress ?? []).reduce((sum: number, p: any) => sum + (p.current_count ?? 0), 0) / totalUsers)
              : 0

            return (
              <div key={quest.id}
                   className="grid items-center px-4 py-3 border-b last:border-b-0 hover:bg-[#fafcf8] transition-colors"
                   style={{ gridTemplateColumns: '2fr 0.8fr 1.2fr 0.6fr 0.5fr 0.5fr 0.4fr 0.4fr', gap: 10, borderColor: C.border }}>

                {/* Quest name */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                       style={{ backgroundColor: catStyle.bg }}>
                    <QIcon size={13} style={{ color: catStyle.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-black truncate" style={{ color: C.dark }}>{quest.title}</p>
                    {quest.description && (
                      <p className="text-[10px] truncate" style={{ color: C.muted }}>{quest.description}</p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <span className="text-[9px] font-black px-2 py-1 rounded-lg capitalize w-fit"
                      style={{ backgroundColor: catStyle.bg, color: catStyle.color }}>
                  {quest.category}
                </span>

                {/* Reward */}
                <span className="text-[9px] font-black px-2 py-1 rounded-lg capitalize w-fit truncate"
                      style={{ backgroundColor: rwdStyle.bg, color: rwdStyle.color }}>
                  {quest.reward_type?.replace('_', ' ')}
                </span>

                {/* Target */}
                <span className="text-[12px] font-bold" style={{ color: C.text }}>
                  {quest.target_count}x
                </span>

                {/* Completed — fractional ratio */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-bold" style={{ color: completedCount > 0 ? C.limeDeep : C.muted }}>
                    {completedCount}
                    <span className="text-[10px] font-normal" style={{ color: C.muted }}> done</span>
                  </span>
                  {quest.target_count > 1 && totalUsers > 0 && (
                    <span className="text-[9px]" style={{ color: C.muted }}>
                      avg {avgProgress}/{quest.target_count}
                    </span>
                  )}
                </div>

                {/* XP */}
                <span className="text-[12px] font-bold" style={{ color: C.amber }}>
                  +{quest.xp_reward}
                </span>

                {/* Active toggle */}
                <div onClick={() => handleToggleQuest(quest.id, !quest.is_active)}
                     className="relative w-10 h-5 rounded-full cursor-pointer"
                     style={{ backgroundColor: quest.is_active ? C.dark : 'rgba(100,116,139,0.35)' }}>
                  <div style={{
                    position: 'absolute', top: 2, left: 2,
                    width: 16, height: 16, borderRadius: '50%',
                    backgroundColor: quest.is_active ? C.lime : '#fff',
                    transform: quest.is_active ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.25s ease',
                  }} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditQuest(quest)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70"
                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                    <Edit size={10} style={{ color: C.muted }} />
                  </button>
                  <button onClick={() => handleDeleteQuest(quest.id)} disabled={deletingId === quest.id}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70 disabled:opacity-40"
                    style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                    {deletingId === quest.id
                      ? <div className="w-3 h-3 rounded-full border border-transparent animate-spin" style={{ borderTopColor: C.red }} />
                      : <Trash2 size={10} style={{ color: C.red }} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* -- FULFILLMENT QUEUE ----------------------------------- */}
      {activeSection === 'fulfillments' && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <AlertTriangle size={13} style={{ color: fulfillments.length > 0 ? C.red : C.muted }} />
            <p className="text-[10px] font-black tracking-wider flex-1" style={{ color: C.muted }}>
              MANUAL FULFILLMENT QUEUE
            </p>
            {fulfillments.length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                {fulfillments.length} pending
              </span>
            )}
          </div>

          {fulfillments.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <CheckCircle size={24} style={{ color: C.limeDeep }} />
              <p className="text-[13px] font-bold" style={{ color: C.muted }}>All caught up!</p>
              <p className="text-[11px]" style={{ color: C.muted }}>No manual rewards pending fulfillment</p>
            </div>
          ) : (
            <>
              <div className="grid px-4 py-2 border-b"
                   style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr 0.6fr', gap: 10, borderColor: C.border, backgroundColor: C.bg }}>
                {['USER', 'QUEST', 'REWARD', 'COMPLETED', 'ACTION'].map(h => (
                  <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
                ))}
              </div>
              {fulfillments.map(item => (
                <div key={item.id}
                     className="grid items-center px-4 py-3 border-b last:border-b-0 hover:bg-[#fafcf8]"
                     style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr 0.6fr', gap: 10, borderColor: C.border }}>
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: C.dark }}>
                      {item.profiles?.name ?? '—'}
                    </p>
                    <p className="text-[10px]" style={{ color: C.muted }}>{item.profiles?.email}</p>
                  </div>
                  <p className="text-[11px] font-semibold truncate" style={{ color: C.text }}>
                    {item.quests?.title}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg truncate"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    {item.quests?.reward_text}
                  </span>
                  <p className="text-[10px]" style={{ color: C.muted }}>
                    {item.completed_at ? timeAgo(item.completed_at) : '—'}
                  </p>
                  <button onClick={() => setFulfillItem(item)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold hover:opacity-80"
                    style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                    <CheckCircle size={10} /> Fulfill
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* -- LEADERBOARD ----------------------------------------- */}
      {activeSection === 'leaderboard' && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <Crown size={13} style={{ color: C.limeDeep }} />
            <p className="text-[10px] font-black tracking-wider flex-1" style={{ color: C.muted }}>
              MONTHLY LEADERBOARD
            </p>
            <p className="text-[10px]" style={{ color: C.muted }}>
              {new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <Crown size={24} style={{ color: C.border }} />
              <p className="text-[13px] font-bold" style={{ color: C.muted }}>No leaderboard data yet</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Rebuilds nightly via cron job</p>
            </div>
          ) : leaderboard.map((entry, idx) => (
            <div key={entry.id}
                 className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-[#fafcf8]"
                 style={{ borderColor: C.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                   style={{
                     backgroundColor: idx === 0 ? 'rgba(251,191,36,0.15)' : idx === 1 ? 'rgba(148,163,184,0.15)' : idx === 2 ? 'rgba(180,83,9,0.15)' : C.bg,
                   }}>
                <span className="text-[13px] font-black"
                      style={{ color: idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : idx === 2 ? '#B45309' : C.muted }}>
                  {idx < 3 ? `#${idx + 1}` : `#${entry.rank}`}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-black"
                   style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                {(entry.display_name ?? '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black truncate" style={{ color: C.dark }}>
                  {entry.display_name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {(() => {
                    const LIcon = LEVEL_LUCIDE[entry.seller_level ?? 1] as React.ElementType
                    return <LIcon size={10} style={{ color: LEVEL_COLORS[entry.seller_level ?? 1] }} />
                  })()}
                  <p className="text-[10px]" style={{ color: LEVEL_COLORS[entry.seller_level ?? 1] }}>
                    {LEVEL_NAMES[entry.seller_level ?? 1]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-black" style={{ color: C.limeDeep }}>{entry.total_xp} XP</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'badges' && (
        <BadgeManagerSection badges={badges} />
      )}

      {/* Modals */}
      {showNewQuest && (
        <QuestModal
          onClose={() => setShowNewQuest(false)}
          onSaved={q => { setQuests(prev => [...prev, q]); showToast('Quest created', 'success') }}
        />
      )}
      {editQuest && (
        <QuestModal
          quest={editQuest}
          onClose={() => setEditQuest(null)}
          onSaved={q => { setQuests(prev => prev.map(x => x.id === q.id ? q : x)); showToast('Quest updated', 'success') }}
        />
      )}
      {fulfillItem && (
        <FulfillModal
          item={fulfillItem}
          onClose={() => setFulfillItem(null)}
          onFulfilled={id => {
            setFulfillments(prev => prev.filter(f => f.id !== id))
            showToast('Reward fulfilled!', 'success')
          }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
