// hooks/useAdminPermissions.ts
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RIAZIFY â€” Admin Permissions Hook
// Fetches live scopes from DB on every mount.
// Never trusts JWT payload for scope data.
// Detects stale sessions via role updated_at timestamp.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type AdminScope =
  | 'crm:read'
  | 'crm:write_notes'
  | 'crm:edit_tiers'
  | 'crm:danger_zone'
  | 'infra:selectors'
  | 'infra:kill_switch'
  | 'infra:ota_update'
  | 'finance:view_mrr'

export interface AdminPermissions {
  // Loading state
  loading:      boolean
  // Is this the founder account (role = 'admin') â€” bypasses all scope checks
  isFounder:    boolean
  // Has any admin access at all (founder OR has a role_id)
  isAdmin:      boolean
  // Raw scopes array
  scopes:       AdminScope[]
  // Role metadata
  roleId:       string | null
  roleName:     string | null
  roleUpdatedAt:string | null
  // Scope checker function
  hasScope:     (scope: AdminScope) => boolean
  // Tab visibility checker (maps tab index to required scope)
  canAccessTab: (tabIndex: number) => boolean
  // Refetch permissions manually
  refetch:      () => Promise<void>
}

// â”€â”€ Tab â†’ Scope mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Maps each SETTINGS_MENU index to the required scope.
// null = founder only (completely hidden from team members)
// undefined = any admin can access
export const TAB_SCOPE_MAP: Record<number, AdminScope | null | undefined> = {
  0:  'crm:read',          // User CRM
  1:  null,                // Role Builder      â†’ founder only
  2:  'crm:read',          // Security Logs
  3:  'crm:edit_tiers',    // Promos & Codes
  4:  null,                // Kill Switches     â†’ founder only
  5:  'crm:edit_tiers',    // Plan Limits
  6:  'crm:write_notes',   // Emails
  7:  'infra:selectors',   // Webhooks
  8:  'crm:edit_tiers',    // Gamification
  9:  'infra:selectors',   // API Vault
  10: 'finance:view_mrr',  // Affiliate Vault
  11: null,                // Founder Ops       â†’ founder only
  12: 'crm:write_notes',   // Marketing
}

// â”€â”€ All scopes granted to founder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FOUNDER_SCOPES: AdminScope[] = [
  'crm:read', 'crm:write_notes', 'crm:edit_tiers', 'crm:danger_zone',
  'infra:selectors', 'infra:kill_switch', 'infra:ota_update', 'finance:view_mrr',
]

// â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useAdminPermissions(): AdminPermissions {
  const supabase = createClient()

  const [loading,       setLoading]       = useState(true)
  const [isFounder,     setIsFounder]     = useState(false)
  const [isAdmin,       setIsAdmin]       = useState(false)
  const [scopes,        setScopes]        = useState<AdminScope[]>([])
  const [roleId,        setRoleId]        = useState<string | null>(null)
  const [roleName,      setRoleName]      = useState<string | null>(null)
  const [roleUpdatedAt, setRoleUpdatedAt] = useState<string | null>(null)

  // Track last fetched updated_at to detect stale sessions
  const lastUpdatedAtRef = useRef<string | null>(null)

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsFounder(false); setIsAdmin(false); setScopes([])
        setLoading(false); return
      }

      // Always fetch fresh from DB â€” never use JWT claims for scopes
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          role_id,
          admin_roles (
            id,
            role_name,
            scopes,
            updated_at
          )
        `)
        .eq('id', session.user.id)
        .single()

      if (error || !profile) {
        setIsFounder(false); setIsAdmin(false); setScopes([])
        setLoading(false); return
      }

      const founder   = (profile as any).role === 'admin'
      const roleData  = (profile as any).admin_roles as {
        id:         string
        role_name:  string
        scopes:     AdminScope[]
        updated_at: string
      } | null

      // Check for stale session â€” if DB updated_at is newer, re-fetch
      if (roleData?.updated_at && lastUpdatedAtRef.current) {
        const dbTs     = new Date(roleData.updated_at).getTime()
        const cachedTs = new Date(lastUpdatedAtRef.current).getTime()
        if (dbTs > cachedTs) {
          // Scopes changed â€” update ref and continue with fresh data
          lastUpdatedAtRef.current = roleData.updated_at
        }
      } else if (roleData?.updated_at) {
        lastUpdatedAtRef.current = roleData.updated_at
      }

      const resolvedScopes: AdminScope[] = founder
        ? FOUNDER_SCOPES
        : (roleData?.scopes ?? []) as AdminScope[]

      const p = profile as any
      setIsFounder(founder)
      setIsAdmin(founder || !!p.role_id)
      setScopes(resolvedScopes)
      setRoleId(p.role_id ?? null)
      setRoleName(founder ? 'Super Admin' : roleData?.role_name ?? null)
      setRoleUpdatedAt(roleData?.updated_at ?? null)

    } catch (e) {
      console.error('[useAdminPermissions]', e)
      setIsFounder(false); setIsAdmin(false); setScopes([])
    }
    setLoading(false)
  }, [supabase])

  // Fetch on mount
  useEffect(() => { fetchPermissions() }, [fetchPermissions])

  // Re-check every 60 seconds to catch role updates
  useEffect(() => {
    const interval = setInterval(fetchPermissions, 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchPermissions])

  // â”€â”€ hasScope â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function hasScope(scope: AdminScope): boolean {
    if (isFounder) return true
    return scopes.includes(scope)
  }

  // â”€â”€ canAccessTab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Returns true if this user can see and access the given tab index
  function canAccessTab(tabIndex: number): boolean {
    if (isFounder) return true
    const requiredScope = TAB_SCOPE_MAP[tabIndex]
    // null = founder only â€” non-founders never get access
    if (requiredScope === null) return false
    // undefined = any admin
    if (requiredScope === undefined) return isAdmin
    // specific scope required
    return scopes.includes(requiredScope)
  }

  return {
    loading,
    isFounder,
    isAdmin,
    scopes,
    roleId,
    roleName,
    roleUpdatedAt,
    hasScope,
    canAccessTab,
    refetch: fetchPermissions,
  }
}
