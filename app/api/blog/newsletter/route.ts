// app/api/blog/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'Riazify Blog <notifications@dropnrest.com>'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json()
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}