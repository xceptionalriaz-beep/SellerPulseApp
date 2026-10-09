// app/api/changelog/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'

    let query = (supabase.from('changelog_entries') as any)
      .select('*')
      .order('published_at', { ascending: false })

    if (!all) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ entries: [], error: error.message })
    return NextResponse.json({ entries: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ entries: [] })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const { data, error } = await (supabase.from('changelog_entries') as any)
      .insert({
        title:        body.title,
        description:  body.description,
        type:         body.type || 'feature',
        version:      body.version || null,
        is_published: body.is_published ?? false,
        published_at: body.published_at || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ entry: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { id, ...updates } = body

    const { data, error } = await (supabase.from('changelog_entries') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ entry: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getSupabase()
    const { id } = await req.json()

    const { error } = await (supabase.from('changelog_entries') as any)
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}