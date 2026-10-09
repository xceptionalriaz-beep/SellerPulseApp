// app/api/tickets/create/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, description, type } = body

    if (!title?.trim())       return NextResponse.json({ error: 'Title is required' },       { status: 400 })
    if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    if (!['bug', 'question', 'feature'].includes(type)) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 })
    }

    const { data, error } = await adminClient.from('tickets').insert({
      user_id:     user.id,
      title:       title.trim(),
      description: description.trim(),
      type,
      status:      'open',
      created_at:  new Date().toISOString(),
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await adminClient.from('admin_notifications').insert({
        type:       'new_ticket',
        title:      'New Support Ticket',
        message:    `${user.email} submitted a ${type}: ${title.trim()}`,
        is_read:    false,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, ticket: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
