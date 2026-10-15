// app/api/feedback/dispute/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/feedback/dispute
// Body: { feedbackId: string, disputed: boolean, reason?: string }
// Marks (or unmarks) a feedback row as disputed — local flag only.
// eBay's own dispute/revision process must be initiated on their site.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient as createServerClient } from '@supabase/supabase-js'
import { createServerClient as createSsrClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const adminDb = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

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

export async function PATCH(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { feedbackId, disputed, reason } = body as {
    feedbackId: string
    disputed: boolean
    reason?: string
  }

  if (!feedbackId || typeof disputed !== 'boolean') {
    return NextResponse.json({ error: 'feedbackId and disputed (boolean) are required' }, { status: 400 })
  }

  const { error } = await adminDb
    .from('feedback_items')
    .update({
      disputed,
      dispute_reason: disputed ? (reason ?? null) : null,
      disputed_at: disputed ? new Date().toISOString() : null,
    })
    .eq('user_id', userId)
    .eq('feedback_id', feedbackId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
