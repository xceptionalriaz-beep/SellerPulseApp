'use client'
// components/QuestWidget.tsx
// User-facing gamification widget shown on dashboard
// Shows XP, level, streak, and active quests

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Trophy, Flame, Star, Crown, ChevronDown, ChevronUp,
  CheckCircle, Clock, Zap,
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
  amber:    '#d97706',
  blue:     '#1d4ed8',
  purple:   '#7c3aed',
}

const LEVEL_NAMES   = ['', 'Beginner', 'Rising', 'Smart', 'Pro', 'Elite']
const LEVEL_XP_NEXT = [0, 100, 300, 600, 1000, 9999]
const LEVEL_COLORS  = ['', C.muted, C.blue, C.amber, C.purple, C.limeDeep]

function getLevelIcon(level: number, size: number = 14) {
  if (level >= 5) return <Crown   size={size} style={{ color: C.limeDeep }} />
  if (level >= 4) return <Crown   size={size} style={{ color: C.purple   }} />
  if (level >= 3) return <Flame   size={size} style={{ color: C.amber    }} />
  if (level >= 2) return <Star    size={size} style={{ color: C.blue     }} />
  return               <Trophy  size={size} style={{ color: C.muted     }} />
}

interface QuestProgress {
  id:            string
  current_count: number
  completed:     boolean
  completed_at:  string | null
  quest: {
    id:           string
    title:        string
    reward_text:  string
    target_count: number
    xp_reward:    number
    icon:         string
    category:     string
  }
}

interface UserGamification {
  total_xp:       number
  seller_level:   number
  current_streak: number
  longest_streak: number
}

export default function QuestWidget() {
  const supabase = createClient()

  const [gamification, setGamification] = useState<UserGamification | null>(null)
  const [quests,       setQuests]       = useState<QuestProgress[]>([])
  const [loading,      setLoading]      = useState(true)
  const [expanded,     setExpanded]     = useState(true)
  const [showAll,      setShowAll]      = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get user gamification data
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('total_xp, seller_level, current_streak, longest_streak')
          .eq('id', user.id)
          .single()

        if (profile) setGamification(profile as UserGamification)

        // Get quest progress
        const { data: progress } = await (supabase.from('quest_progress') as any)
          .select(`
            id, current_count, completed, completed_at,
            quests ( id, title, reward_text, target_count, xp_reward, icon, category )
          `)
          .eq('user_id', user.id)
          .order('completed', { ascending: true })

        // Also get active quests with no progress yet
        const { data: allQuests } = await (supabase.from('quests') as any)
          .select('id, title, reward_text, target_count, xp_reward, icon, category')
          .eq('is_active', true)
          .order('sort_order')

        // Merge quests with progress
        const progressMap = new Map((progress ?? []).map((p: any) => [p.quests?.id, p]))
        const merged = (allQuests ?? []).map((q: any) => {
          const p = progressMap.get(q.id) as any
          return {
            id:            p?.id            ?? q.id,
            current_count: p?.current_count ?? 0,
            completed:     p?.completed     ?? false,
            completed_at:  p?.completed_at  ?? null,
            quest:         q,
          }
        })

        setQuests(merged)
      } catch (e) {
        console.error('[QuestWidget]', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="rounded-2xl border p-4 animate-pulse"
         style={{ borderColor: C.border, backgroundColor: C.surface }}>
      <div className="h-4 rounded-lg w-1/3 mb-3" style={{ backgroundColor: C.bg }} />
      <div className="h-2 rounded-full w-full mb-2" style={{ backgroundColor: C.bg }} />
      <div className="h-10 rounded-xl w-full" style={{ backgroundColor: C.bg }} />
    </div>
  )

  if (!gamification) return null

  const level      = gamification.seller_level ?? 1
  const xp         = gamification.total_xp ?? 0
  const nextXP     = LEVEL_XP_NEXT[level] ?? 9999
  const prevXP     = LEVEL_XP_NEXT[level - 1] ?? 0
  const xpProgress = level >= 5 ? 100 : Math.min(((xp - prevXP) / (nextXP - prevXP)) * 100, 100)
  const streak     = gamification.current_streak ?? 0

  const activeQuests    = quests.filter(q => !q.completed).slice(0, showAll ? 12 : 3)
  const completedCount  = quests.filter(q => q.completed).length
  const totalCount      = quests.length

  return (
    <div className="rounded-2xl border overflow-hidden"
         style={{ borderColor: C.border, backgroundColor: C.surface }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
           style={{ backgroundColor: C.bg }}
           onClick={() => setExpanded(p => !p)}>

        {/* Level icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
             style={{ backgroundColor: LEVEL_COLORS[level] + '15' }}>
          {getLevelIcon(level, 18)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-black" style={{ color: C.dark }}>
              Your Seller Journey
            </p>
            {streak > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg"
                   style={{ backgroundColor: 'rgba(217,119,6,0.1)' }}>
                <Flame size={10} style={{ color: C.amber }} />
                <span className="text-[9px] font-black" style={{ color: C.amber }}>
                  {streak}d streak
                </span>
              </div>
            )}
          </div>

          {/* XP Progress bar */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
              <div className="h-full rounded-full transition-all duration-500"
                   style={{ width: `${xpProgress}%`, backgroundColor: C.lime }} />
            </div>
            <span className="text-[9px] font-bold shrink-0" style={{ color: C.muted }}>
              {xp} XP
            </span>
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] font-bold" style={{ color: LEVEL_COLORS[level] }}>
              {LEVEL_NAMES[level]}
            </span>
            {level < 5 && (
              <>
                <span className="text-[9px]" style={{ color: C.muted }}>→</span>
                <span className="text-[9px]" style={{ color: C.muted }}>
                  {LEVEL_NAMES[level + 1]} at {nextXP} XP
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quest progress pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0"
             style={{ backgroundColor: C.limeTint }}>
          <CheckCircle size={12} style={{ color: C.limeDeep }} />
          <span className="text-[11px] font-black" style={{ color: C.limeDeep }}>
            {completedCount}/{totalCount}
          </span>
        </div>

        {expanded
          ? <ChevronUp   size={14} style={{ color: C.muted }} />
          : <ChevronDown size={14} style={{ color: C.muted }} />}
      </div>

      {/* Quest list */}
      {expanded && (
        <div className="px-4 py-3 flex flex-col gap-2 border-t" style={{ borderColor: C.border }}>

          {activeQuests.length === 0 ? (
            <div className="flex flex-col items-center py-4 gap-2">
              <CheckCircle size={20} style={{ color: C.limeDeep }} />
              <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>
                All quests completed!
              </p>
              <p className="text-[10px]" style={{ color: C.muted }}>
                You are a Riazify master
              </p>
            </div>
          ) : (
            activeQuests.map(qp => {
              const pct = qp.quest.target_count > 1
                ? Math.min((qp.current_count / qp.quest.target_count) * 100, 100)
                : qp.completed ? 100 : 0

              return (
                <div key={qp.id}
                     className="flex items-center gap-3 p-3 rounded-xl border"
                     style={{ borderColor: qp.completed ? C.limeDeep + '40' : C.border, backgroundColor: qp.completed ? C.limeTint : C.bg }}>

                  {/* Status icon */}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                       style={{ backgroundColor: qp.completed ? C.limeDeep : C.surface, border: `1px solid ${qp.completed ? C.limeDeep : C.border}` }}>
                    {qp.completed
                      ? <CheckCircle size={13} style={{ color: C.surface }} />
                      : <Clock       size={13} style={{ color: C.muted   }} />}
                  </div>

                  {/* Quest info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate"
                       style={{ color: qp.completed ? C.limeDeep : C.dark }}>
                      {qp.quest.title}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: C.muted }}>
                      {qp.quest.reward_text}
                    </p>

                    {/* Progress bar for multi-step quests */}
                    {qp.quest.target_count > 1 && !qp.completed && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                          <div className="h-full rounded-full transition-all"
                               style={{ width: `${pct}%`, backgroundColor: C.lime }} />
                        </div>
                        <span className="text-[9px] font-bold shrink-0" style={{ color: C.muted }}>
                          {qp.current_count}/{qp.quest.target_count}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* XP badge */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Zap size={10} style={{ color: C.amber }} />
                    <span className="text-[10px] font-black" style={{ color: C.amber }}>
                      +{qp.quest.xp_reward}
                    </span>
                  </div>
                </div>
              )
            })
          )}

          {/* Show more / less */}
          {quests.filter(q => !q.completed).length > 3 && (
            <button onClick={() => setShowAll(p => !p)}
              className="flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-bold hover:opacity-80 transition-all"
              style={{ color: C.muted, border: `1px solid ${C.border}` }}>
              {showAll
                ? <><ChevronUp   size={12} /> Show less</>
                : <><ChevronDown size={12} /> Show {quests.filter(q => !q.completed).length - 3} more quests</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}