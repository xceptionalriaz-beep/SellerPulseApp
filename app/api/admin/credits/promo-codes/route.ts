// app/api/admin/credits/promo-codes/route.ts
// Admin CRUD for credit promo codes
// GET — list all codes
// POST — create a new code
// DELETE ?id=<uuid> — deactivate/delete a code

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAdminUser() {
  try {
    const cookieStore = await cookies()
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return null
    const role = (user.user_metadata?.role ?? user.app_metadata?.role) as string | undefined
    if (role !== 'admin' && role !== 'superadmin') return null
    return user
  } catch { return null }
}

export async function GET() {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await admin
    .from('credit_promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ codes: data ?? [] })
}

export async function POST(req: NextRequest) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    code?: string
    description?: string
    credits?: number
    max_uses?: number | null
    expires_at?: string | null
  }
  try { body = await req.json() } catch { body = {} }

  const { code, description, credits, max_uses, expires_at } = body

  if (!code || !credits || credits <= 0) {
    return NextResponse.json({ error: 'code and credits are required' }, { status: 400 })
  }

  // Normalise code: uppercase, no spaces
  const normCode = code.trim().toUpperCase().replace(/\s+/g, '')

  const { data, error } = await admin
    .from('credit_promo_codes')
    .insert({
      code: normCode,
      description: description ?? null,
      credits,
      max_uses:   max_uses ?? null,
      expires_at: expires_at ?? null,
      created_by: adminUser.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: `Code "${normCode}" already exists` }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ code: data })
}

export async function DELETE(req: NextRequest) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await admin
    .from('credit_promo_codes')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { id?: string; is_active?: boolean }
  try { body = await req.json() } catch { body = {} }

  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await admin
    .from('credit_promo_codes')
    .update({ is_active: body.is_active })
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
