// app/api/admin/export-users/route.ts
// Exports ALL users as CSV (no pagination limit)

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {

  // ── 1. Verify admin token ──────────────────────────────────
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: authErr } = await adminClient.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin')
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  // ── 2. Fetch ALL profiles (no pagination) ─────────────────
  const { data: profiles, error: profileErr } = await adminClient
    .from('profiles')
    .select(
      'id, name, email, plan_name, account_status, ' +
      'created_at, last_seen, country, verified_city, role'
    )
    .order('created_at', { ascending: false })

  if (profileErr)
    return NextResponse.json({ error: profileErr.message }, { status: 500 })

  const allProfiles = (profiles ?? []) as any[]

  // ── 3. Fetch subscriptions for LTV ────────────────────────
  const { data: subs } = await adminClient
    .from('subscriptions')
    .select('user_id, amount, status')

  const ltvMap: Record<string, number> = {}
  for (const s of (subs ?? []) as any[]) {
    if (s.amount > 0) {
      ltvMap[s.user_id] = (ltvMap[s.user_id] ?? 0) + Number(s.amount)
    }
  }

  // ── 4. Build CSV ───────────────────────────────────────────
  const headers = [
    'Name', 'Email', 'Plan', 'Status', 'Role',
    'Joined', 'Last Seen', 'Country', 'City', 'LTV ($)'
  ]

  function escapeCSV(val: any): string {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  function formatDate(ts: string | null): string {
    if (!ts) return ''
    return new Date(ts).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const rows = allProfiles.map(p => [
    escapeCSV(p.name),
    escapeCSV(p.email),
    escapeCSV(p.plan_name ?? 'Free'),
    escapeCSV(p.account_status ?? 'Active'),
    escapeCSV(p.role ?? 'user'),
    escapeCSV(formatDate(p.created_at)),
    escapeCSV(formatDate(p.last_seen)),
    escapeCSV(p.country ?? ''),
    escapeCSV(p.verified_city ?? ''),
    escapeCSV((ltvMap[p.id] ?? 0).toFixed(2)),
  ].join(','))

  const csv = [headers.join(','), ...rows].join('\n')

  // ── 5. Return as downloadable file ────────────────────────
  const date     = new Date().toISOString().split('T')[0]
  const filename = `riazify-users-${date}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store',
    },
  })
}