// lib/checkAdminAccess.ts
// ══════════════════════════════════════════════════════════════
// RIAZIFY — Shared Admin Access Guard
// Used by every protected API route.
// ALWAYS fetches live from DB — never trusts JWT payload for scopes.
// Checks role updated_at timestamp to detect stale sessions.
// ══════════════════════════════════════════════════════════════

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// ── Types ──────────────────────────────────────────────────────
export type AdminScope =
  | 'crm:read'
  | 'crm:write_notes'
  | 'crm:edit_tiers'
  | 'crm:danger_zone'
  | 'infra:selectors'
  | 'infra:kill_switch'
  | 'infra:ota_update'
  | 'finance:view_mrr'

export interface AccessResult {
  authorized:  true
  userId:      string
  scopes:      AdminScope[]
  roleId:      string | null
  roleName:    string | null
  roleUpdatedAt: string | null
}

export interface DeniedResult {
  authorized: false
  response:   NextResponse
}

export type AccessCheckResult = AccessResult | DeniedResult

// ── Main guard function ────────────────────────────────────────
// Pass requiredScope = null to just verify the user is an admin
// without checking a specific scope (useful for read-only admin routes).
export async function checkAdminAccess(
  requiredScope: AdminScope | null = null,
  options: {
    // If the client sends X-Role-Updated-At header, we compare it
    // to the DB value. If DB is newer → return 409 so client re-fetches.
    clientRoleUpdatedAt?: string | null
  } = {}
): Promise<AccessCheckResult> {

  const supabase = createRouteHandlerClient({ cookies })

  // ── 1. Verify session exists ───────────────────────────────
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthenticated. Please log in.' },
        { status: 401 }
      ),
    }
  }

  const userId = session.user.id

  // ── 2. Live fetch profile + joined role from DB ────────────
  // We JOIN admin_roles directly so we get fresh scopes every call.
  // We never read scopes from the JWT — JWT only proves identity.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      role,
      role_id,
      admin_roles (
        id,
        role_name,
        scopes,
        is_system_role,
        updated_at
      )
    `)
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Profile not found.' },
        { status: 403 }
      ),
    }
  }

  // ── 3. Determine if user is an admin ──────────────────────
  // Two valid paths to admin:
  // a) profile.role === 'admin' (legacy founder account)
  // b) profile.role_id points to a role with the required scope
  const isLegacyAdmin = profile.role === 'admin'
  const roleData      = (profile as any).admin_roles as {
    id:            string
    role_name:     string
    scopes:        AdminScope[]
    is_system_role:boolean
    updated_at:    string
  } | null

  // If neither legacy admin nor a role_id assigned → deny
  if (!isLegacyAdmin && !roleData) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Access denied. No admin role assigned.' },
        { status: 403 }
      ),
    }
  }

  // ── 4. Stale session check ─────────────────────────────────
  // If client sends X-Role-Updated-At and DB has a newer timestamp,
  // return 409 Conflict so the client knows to re-fetch permissions.
  if (options.clientRoleUpdatedAt && roleData?.updated_at) {
    const clientTs = new Date(options.clientRoleUpdatedAt).getTime()
    const dbTs     = new Date(roleData.updated_at).getTime()
    if (dbTs > clientTs) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error:      'Role permissions have been updated. Please refresh.',
            code:       'ROLE_STALE',
            updatedAt:  roleData.updated_at,
          },
          { status: 409 }
        ),
      }
    }
  }

  // ── 5. Scope check ─────────────────────────────────────────
  // Legacy admin (founder) gets all scopes automatically.
  // Other admins must have the required scope in their role.
  const scopes: AdminScope[] = isLegacyAdmin
    ? ['crm:read','crm:write_notes','crm:edit_tiers','crm:danger_zone',
       'infra:selectors','infra:kill_switch','infra:ota_update','finance:view_mrr']
    : (roleData?.scopes ?? [])

  if (requiredScope !== null && !scopes.includes(requiredScope)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: `Access denied. Required scope: ${requiredScope}`,
          code:  'INSUFFICIENT_SCOPE',
        },
        { status: 403 }
      ),
    }
  }

  // ── 6. Authorized ─────────────────────────────────────────
  return {
    authorized:     true,
    userId,
    scopes,
    roleId:         profile.role_id ?? null,
    roleName:       isLegacyAdmin ? 'Super Admin' : (roleData?.role_name ?? null),
    roleUpdatedAt:  roleData?.updated_at ?? null,
  }
}

// ── Helper: quick admin-only check (no specific scope) ────────
export async function requireAdmin(): Promise<AccessCheckResult> {
  return checkAdminAccess(null)
}

// ── Helper: extract Bearer token from request headers ─────────
// Used by routes that use the old token-based pattern.
export function getBearerToken(req: Request): string | null {
  return req.headers.get('authorization')?.replace('Bearer ', '') ?? null
}

// ── Helper: verify admin via Bearer token (old pattern) ───────
// For backwards compatibility with existing routes that pass token manually.
export async function verifyAdminToken(token: string): Promise<{
  authorized: boolean
  userId?: string
  error?: string
}> {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { authorized: false, error: 'Invalid token' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, role_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { authorized: false, error: 'Profile not found' }

  const isAdmin = profile.role === 'admin' || profile.role_id !== null
  if (!isAdmin) return { authorized: false, error: 'Not an admin' }

  return { authorized: true, userId: user.id }
}