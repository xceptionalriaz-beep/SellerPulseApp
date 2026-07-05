// app/api/page-editor/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — fetch all content for a page
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page')
    const supabase = getSupabase()

    let query = (supabase.from('page_editor') as any).select('*')
    if (page) query = query.eq('page', page)

    const { data, error } = await query.order('section').order('field')
    if (error) throw error

    // Convert to nested object: { section: { field: value } }
    const content: Record<string, Record<string, string>> = {}
    for (const row of data ?? []) {
      if (!content[row.section]) content[row.section] = {}
      content[row.section][row.field] = row.value ?? ''
    }

    return NextResponse.json({ content, raw: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ content: {}, raw: [] })
  }
}

// POST — save a single field
export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const { page, section, field, value } = await req.json()

    const { data, error } = await (supabase.from('page_editor') as any)
      .upsert(
        { page, section, field, value, updated_at: new Date().toISOString() },
        { onConflict: 'page,section,field' }
      )
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — reset a field to default
export async function DELETE(req: Request) {
  try {
    const supabase = getSupabase()
    const { page, section, field } = await req.json()

    const { error } = await (supabase.from('page_editor') as any)
      .delete()
      .eq('page', page)
      .eq('section', section)
      .eq('field', field)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}