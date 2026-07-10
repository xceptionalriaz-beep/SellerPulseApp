'use client'
// hooks/useAdminPermission.ts
// Check if current admin user has permission for a specific tab
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Permission = 'none' | 'view' | 'full'

let cachedPermissions: Record<string, Permission> | null = null
let cacheTime = 0
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export function useAdminPermission(tabKey: string) {
  const [permission, setPermission] = useState<Permission>('full') // default full for founder
  const [loading, setLoading]       = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      try {
        // Use cache if fresh
        if (cachedPermissions && Date.now() - cacheTime < CACHE_TTL) {
          setPermission(cachedPermissions[tabKey] ?? 'full')
          setLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setPermission('none'); setLoading(false); return }

        // Get user's role_id from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role_id, role')
          .eq('id', user.id)
          .single()

        // If admin role (founder) — full access always
        if ((profile as any)?.role === 'admin' && !(profile as any)?.role_id) {
          setPermission('full')
          setLoading(false)
          return
        }

        // Get role permissions
        if ((profile as any)?.role_id) {
          const { data: role } = await (supabase.from('admin_roles') as any)
            .select('permissions, role_name')
            .eq('id', (profile as any).role_id)
            .single()

          // Super Admin — always full
          if (role?.role_name === 'Super Admin') {
            setPermission('full')
            setLoading(false)
            return
          }

          const perms = role?.permissions ?? {}
          cachedPermissions = perms
          cacheTime = Date.now()
          setPermission(perms[tabKey] ?? 'none')
        } else {
          setPermission('full') // no role = founder = full access
        }
      } catch {
        setPermission('full') // fail safe = full access
      }
      setLoading(false)
    }
    check()
  }, [tabKey])

  return {
    permission,
    loading,
    canView: permission === 'view' || permission === 'full',
    canEdit: permission === 'full',
    isHidden: permission === 'none',
  }
}

// Clear permission cache (call after role changes)
export function clearPermissionCache() {
  cachedPermissions = null
  cacheTime = 0
}