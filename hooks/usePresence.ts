// hooks/usePresence.ts
// ─────────────────────────────────────────────────────────────
// usePresence()       → USER dashboard layout
//                       joins 'riazify-presence' channel
//                       skips automatically for admin accounts
//
// useOnlineUserIds()  → ADMIN CRM only
//                       subscribes to 'riazify-presence'
//                       (no conflict — admin skips usePresence)
//
// getOnlineCount()    → fallback using last_seen (3 min window)
//                       matches the 2-min heartbeat interval
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const CHANNEL = 'riazify-presence'

// ── For USER dashboard layout ─────────────────────────────────
export function usePresence() {
  const supabase = createClient()

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function join() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await (supabase.from('profiles') as any)
          .select('name, role')
          .eq('id', user.id)
          .single()

        // Admins skip — they observe from useOnlineUserIds instead
        // This prevents the "cannot add callbacks after subscribe" conflict
        if ((profile as any)?.role === 'admin') return

        channel = supabase.channel(CHANNEL, {
          config: { presence: { key: user.id } },
        })

        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel!.track({
              userId:   user.id,
              name:     (profile as any)?.name ?? user.email?.split('@')[0] ?? 'User',
              email:    user.email ?? '',
              joinedAt: new Date().toISOString(),
            })
          }
        })
      } catch { /* non-critical */ }
    }

    join()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])
}

// ── For ADMIN CRM — subscribe to same channel ─────────────────
// Safe: admin skips usePresence() above so no conflict
export interface OnlineUser {
  userId:   string
  name:     string
  email:    string
  joinedAt: string
}

export function useOnlineUserIds(): Set<string> {
  const supabase = createClient()
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Same channel name as users — admin skipped joining so no conflict
    const channel = supabase
      .channel(CHANNEL)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<OnlineUser>()
        const ids   = new Set<string>()
        for (const presences of Object.values(state)) {
          for (const p of presences as any[]) {
            if (p.userId) ids.add(p.userId)
          }
        }
        setOnlineIds(ids)
      })
      .on('presence', { event: 'leave' }, () => {
        // Re-sync immediately on leave so count drops fast
        const state = channel.presenceState<OnlineUser>()
        const ids   = new Set<string>()
        for (const presences of Object.values(state)) {
          for (const p of presences as any[]) {
            if (p.userId) ids.add(p.userId)
          }
        }
        setOnlineIds(ids)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return onlineIds
}

// ── Fallback: count from last_seen (3 min = 1 heartbeat + buffer)
// Heartbeat fires every 2 min, so 3 min = user definitely gone
export function getOnlineCount(users: any[]): number {
  const THREE_MIN = 3 * 60 * 1000
  return users.filter(u =>
    u.last_seen && (Date.now() - new Date(u.last_seen).getTime()) < THREE_MIN
  ).length
}