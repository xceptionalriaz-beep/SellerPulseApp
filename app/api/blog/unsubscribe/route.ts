// app/api/blog/unsubscribe/route.ts
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const supabase = createClient()
    const { error } = await (supabase.from('newsletter_subscribers') as any)
      .update({ is_active: false })
      .eq('email', email.toLowerCase().trim())
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}