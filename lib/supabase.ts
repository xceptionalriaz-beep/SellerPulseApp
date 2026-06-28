import { createBrowserClient }              from '@supabase/ssr'
import { createClient as createBaseClient } from '@supabase/supabase-js'
import type { Database }                    from '@/types/database'

// â”€â”€â”€ Browser Client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Use this in Client Components ('use client')
export function createClient() {

  // â”€â”€ Impersonation tab detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // When an admin uses "Login as User", the view-as page sets
  // this flag in sessionStorage. sessionStorage is tab-specific
  // so ONLY the impersonation tab has this flag.
  // All other tabs (including the admin's original tab) are
  // completely unaffected â€” they still use the normal client.
  const isImpersonating =
    typeof window !== 'undefined' &&
    window.sessionStorage.getItem('__riazify_impersonating__') === '1'

  if (isImpersonating) {
    // Use plain supabase-js with sessionStorage.
    // This means Daniel's session lives ONLY in this tab.
    // Closing the tab automatically clears his session.
    return createBaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage:            window.sessionStorage,
          autoRefreshToken:   true,
          persistSession:     true,
          detectSessionInUrl: false,
        },
      }
    )
  }

  // â”€â”€ Normal client â€” all regular tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Unchanged from your original â€” uses localStorage by default
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
