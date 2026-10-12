// app/api/feedback/reply/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/feedback/reply
// Body: { feedbackId: string, text: string }
// Calls eBay RespondToFeedback Trading API, then updates the local row.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient as createServerClient } from '@supabase/supabase-js'
import { createServerClient as createSsrClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getEbayToken } from '@/lib/ebay-auth'

const adminDb = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const EBAY_TRADING_API = 'https://api.ebay.com/ws/api.dll'

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createSsrClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

function xmlVal(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { feedbackId, text } = body as { feedbackId: string; text: string }

  if (!feedbackId || !text?.trim()) {
    return NextResponse.json({ error: 'feedbackId and text are required' }, { status: 400 })
  }
  if (text.length > 80) {
    return NextResponse.json({ error: 'eBay limits replies to 80 characters' }, { status: 400 })
  }

  let accessToken: string
  try {
    accessToken = await getEbayToken(userId)
  } catch (err: any) {
    return NextResponse.json({ error: err.message, notConnected: true }, { status: 400 })
  }

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<RespondToFeedbackRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${accessToken}</eBayAuthToken>
  </RequesterCredentials>
  <FeedbackID>${feedbackId}</FeedbackID>
  <ResponseType>Reply</ResponseType>
  <Text>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</Text>
</RespondToFeedbackRequest>`

  const res = await fetch(EBAY_TRADING_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
      'X-EBAY-API-CALL-NAME': 'RespondToFeedback',
      'X-EBAY-API-SITEID': '0',
    },
    body: xml,
  })

  const resBody = await res.text()
  const ack = xmlVal(resBody, 'Ack')

  if (!res.ok || ack === 'Failure') {
    const errMsg = xmlVal(resBody, 'LongMessage') || xmlVal(resBody, 'ShortMessage') || `eBay ${res.status}`
    return NextResponse.json({ error: errMsg }, { status: 502 })
  }

  // Update local row
  await adminDb
    .from('feedback_items')
    .update({
      feedback_response: text,
      responded_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('feedback_id', feedbackId)

  return NextResponse.json({ ok: true })
}
