// hooks/usePresence.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// usePresence()       â†’ USER dashboard layout
//                       joins 'riazify-presence' channel
//                       skips automatically for admin accounts
//
// useOnlineUserIds()  â†’ ADMIN CRM only
//                       subscribes to 'riazify-presence'
//                       (no conflict â€” admin skips usePresence)
//
// getOnlineCount()    â†’ fallback using last_seen (3 min window)
//                       matches the 2-min heartbeat interval
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const CHANNEL = 'riazify-presence'

// â”€â”€ For USER dashboard layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

        // Admins skip â€” they observe from useOnlineUserIds instead
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

// â”€â”€ For ADMIN CRM â€” subscribe to same channel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // Same channel name as users â€” admin skipped joining so no conflict
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

// â”€â”€ Fallback: count from last_seen (3 min = 1 heartbeat + buffer)
// Heartbeat fires every 2 min, so 3 min = user definitely gone
export function getOnlineCount(users: any[]): number {
  const THREE_MIN = 3 * 60 * 1000
  return users.filter(u =>
    u.last_seen && (Date.now() - new Date(u.last_seen).getTime()) < THREE_MIN
  ).length
}
