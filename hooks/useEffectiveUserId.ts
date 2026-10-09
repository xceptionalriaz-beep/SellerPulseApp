// hooks/useEffectiveUserId.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Returns the "effective" user ID for data queries.
// If member is viewing an owner's account â†’ returns owner's ID
// Otherwise â†’ returns their own ID
//
// Usage in ANY dashboard component:
//   const effectiveId = useEffectiveUserId()
//   supabase.from('protected_orders').eq('user_id', effectiveId)
//
// This makes ALL tools automatically show the owner's data
// when a team member has switched to their account
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { useState, useEffect } from 'react'
import { createClient }        from '@/lib/supabase'

interface EffectiveUser {
  effectiveId:    string | null   // the ID to use in queries
  ownId:          string | null   // always the logged-in user's own ID
  isViewingTeam:  boolean         // true = viewing someone else's account
  ownerName:      string | null   // name of the account being viewed
  role:           string | null   // member's role in that team
  loading:        boolean
}

export function useEffectiveUserId(): EffectiveUser {
  const supabase = createClient()
  const [state, setState] = useState<EffectiveUser>({
    effectiveId:   null,
    ownId:         null,
    isViewingTeam: false,
    ownerName:     null,
    role:          null,
    loading:       true,
  })

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setState(s => ({ ...s, loading: false })); return }

        // Get profile with active_team_owner_id
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('id, name, active_team_owner_id')
          .eq('id', user.id)
          .single()

        const activeOwnerId = (profile as any)?.active_team_owner_id

        if (activeOwnerId) {
          // Member is viewing an owner's account
          // Verify membership still active
          const { data: membership } = await (supabase.from('team_members') as any)
            .select('role, owner:owner_id(name, email)')
            .eq('owner_id', activeOwnerId)
            .eq('member_id', user.id)
            .eq('status', 'active')
            .single()

          if (membership) {
            const owner     = (membership as any).owner ?? {}
            const ownerName = owner.name ?? owner.email?.split('@')[0] ?? 'Team Account'
            setState({
              effectiveId:   activeOwnerId,
              ownId:         user.id,
              isViewingTeam: true,
              ownerName,
              role:          (membership as any).role,
              loading:       false,
            })
          } else {
            // Membership revoked â€” clear active_team_owner_id and use own ID
            await (supabase.from('profiles') as any)
              .update({ active_team_owner_id: null })
              .eq('id', user.id)

            setState({
              effectiveId:   user.id,
              ownId:         user.id,
              isViewingTeam: false,
              ownerName:     null,
              role:          null,
              loading:       false,
            })
          }
        } else {
          // Normal â€” viewing own account
          setState({
            effectiveId:   user.id,
            ownId:         user.id,
            isViewingTeam: false,
            ownerName:     null,
            role:          null,
            loading:       false,
          })
        }
      } catch {
        setState(s => ({ ...s, loading: false }))
      }
    }
    load()
  }, [])

  return state
}
