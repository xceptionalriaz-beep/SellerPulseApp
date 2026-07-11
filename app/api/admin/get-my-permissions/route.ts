// app/api/admin/get-my-permissions/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    // Get current user from session
    const supabaseAuth = createServerSupabaseClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await supabase
      .from('profiles')
      .select('tab_permissions, section_permissions, is_super_admin, role_id')
      .eq('id', user.id)
      .single()

    return NextResponse.json(data ?? {})
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}