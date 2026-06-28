// hooks/useHeartbeat.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Updates profiles.last_seen every 2 minutes while user
// is on the dashboard. Fires immediately on mount.
// Add to dashboard/layout.tsx â€” zero UI changes for user.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export function useHeartbeat() {
  const supabase = createClient()

  useEffect(() => {
    async function beat() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await (supabase.from('profiles') as any)
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id)
      } catch { /* non-critical */ }
    }

    beat() // fire immediately on page load
    const interval = setInterval(beat, 2 * 60 * 1000) // every 2 minutes
    return () => clearInterval(interval)
  }, [])
}
