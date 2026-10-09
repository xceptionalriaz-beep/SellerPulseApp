// app/api/user/delete-account/route.ts
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }) } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }) } catch {}
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Use service role to delete user data
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete user data from all tables
    const userId = user.id
    await Promise.allSettled([
      adminSupabase.from('profiles').delete().eq('id', userId),
      adminSupabase.from('orders').delete().eq('user_id', userId),
      adminSupabase.from('subscriptions').delete().eq('user_id', userId),
      adminSupabase.from('login_history').delete().eq('user_id', userId),
      adminSupabase.from('user_events').delete().eq('user_id', userId),
      adminSupabase.from('user_sessions').delete().eq('user_id', userId),
      adminSupabase.from('notifications').delete().eq('user_id', userId),
      adminSupabase.from('tickets').delete().eq('user_id', userId),
      adminSupabase.from('api_keys').delete().eq('user_id', userId),
      adminSupabase.from('ebay_connections').delete().eq('user_id', userId),
    ])

    // Delete the auth user
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}