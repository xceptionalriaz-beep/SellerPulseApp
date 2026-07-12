// hooks/useTabPermissions.ts
// Returns current user's permissions for a specific tab
// Usage: const { viewOnly, can } = useTabPermissions('tickets')
'use client'
import { useState, useEffect } from 'react'

interface TabPermResult {
  viewOnly:    boolean
  can:         (action: string) => boolean
  isSuperAdmin: boolean
  loading:     boolean
}

// Cache permissions for the session
let cachedPerms: Record<string, any> | null = null
let cachedSuperAdmin: boolean = false
let cacheTime: number = 0
const CACHE_TTL = 60000 // 1 minute

export function useTabPermissions(tabKey: string): TabPermResult {
  const [perms,        setPerms]        = useState<Record<string, any> | null>(cachedPerms)
  const [isSuperAdmin, setIsSuperAdmin] = useState(cachedSuperAdmin)
  const [loading,      setLoading]      = useState(!cachedPerms)

  useEffect(() => {
    // Use cache if fresh
    if (cachedPerms && Date.now() - cacheTime < CACHE_TTL) {
      setPerms(cachedPerms)
      setIsSuperAdmin(cachedSuperAdmin)
      setLoading(false)
      return
    }
    async function load() {
      try {
        const res  = await fetch('/api/admin/get-my-permissions')
        const data = await res.json()
        cachedPerms      = data?.tab_permissions ?? {}
        cachedSuperAdmin = data?.is_super_admin ?? false
        cacheTime        = Date.now()
        setPerms(cachedPerms)
        setIsSuperAdmin(cachedSuperAdmin)
      } catch {
        // Fail open — grant full access on error
        setIsSuperAdmin(true)
      }
      setLoading(false)
    }
    load()
  }, [tabKey])

  const access = (() => {
    if (isSuperAdmin) return 'full'
    if (!perms) return 'full'
    return perms[tabKey]?.access ?? 'full'
  })()

  const viewOnly = access === 'view'

  const can = (action: string): boolean => {
    if (isSuperAdmin) return true
    if (access === 'none' || access === 'view') return false
    if (!perms) return true
    const key = `${tabKey}__${action}`
    const val = perms[key]
    return val === undefined ? true : val === true
  }

  return { viewOnly, can, isSuperAdmin, loading }
}