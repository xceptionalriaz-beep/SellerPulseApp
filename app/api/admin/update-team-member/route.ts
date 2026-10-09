// app/api/admin/update-team-member/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await req.json()
    const { id, is_super_admin, role_id, section_permissions, tab_permissions, permissions_updated_at, sidebar_mode } = body

    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

    const { error } = await supabase
      .from('profiles')
      .update({
        is_super_admin,
        role_id:                role_id ?? null,
        section_permissions:    section_permissions ?? {},
        tab_permissions:        tab_permissions ?? {},
        permissions_updated_at: permissions_updated_at ?? new Date().toISOString(),
        sidebar_mode:           sidebar_mode ?? 'hide',
      })
      .eq('id', id)

    if (error) throw error

    // Log permission change
    await supabase.from('admin_notifications').insert({
      title:   'Permissions updated',
      message: `Permissions updated for user ${id}`,
      type:    'info',
      is_read: false,
    }).single()

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}