// app/api/admin-roles/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const { id, permissions, action_permissions, section_permissions, data_permissions, access_restrictions } = await req.json()

    const { error } = await (supabase.from('admin_roles') as any)
      .update({
        permissions,
        action_permissions,
        section_permissions,
        data_permissions,
        access_restrictions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}