// app/api/brand/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await (supabase.from('brand_settings') as any)
      .select('key, value')
    if (error) throw error

    // Convert to key-value object
    const brand: Record<string, string> = {}
    for (const row of data ?? []) {
      brand[row.key] = row.value ?? ''
    }
    return NextResponse.json({ brand })
  } catch {
    return NextResponse.json({
      brand: {
        logo_icon:       '',
        logo_full_dark:  '',
        logo_full_light: '',
        og_image:        '',
        brand_name:      'Riazify',
        brand_color:     '#8fff00',
      }
    })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const { key, value } = await req.json()

    const { error } = await (supabase.from('brand_settings') as any)
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}