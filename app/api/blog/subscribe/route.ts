// app/api/blog/subscribe/route.ts
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, source = 'blog' } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const supabase = createClient()
    const clean = email.toLowerCase().trim()

    // Check if already exists
    const { data: existing } = await (supabase.from('newsletter_subscribers') as any)
      .select('id, is_active').eq('email', clean).single()

    if (existing) {
      return NextResponse.json({ success: true, alreadySubscribed: true })
    }

    const { error } = await (supabase.from('newsletter_subscribers') as any)
      .insert({ email: clean, source, subscribed_at: new Date().toISOString(), is_active: true })
    if (error) throw error
    return NextResponse.json({ success: true, alreadySubscribed: false })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}