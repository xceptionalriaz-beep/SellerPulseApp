// app/api/contact/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, email, subject, type, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await (supabase.from('tickets') as any).insert({
      title:       `[Contact] ${subject}`,
      description: `From: ${name} <${email}>\n\n${message}`,
      type:        type ?? 'question',
      status:      'open',
      priority:    'medium',
      user_email:  email,
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}