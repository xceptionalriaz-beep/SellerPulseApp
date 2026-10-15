// app/api/ebay/accounts/route.ts
// Returns the user's connected eBay accounts for channel selection in campaign forms

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function supabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
}

const MARKETPLACE_LABELS: Record<string, { flag: string; short: string }> = {
  EBAY_US: { flag: '🇺🇸', short: 'US' },
  EBAY_GB: { flag: '🇬🇧', short: 'UK' },
  EBAY_AU: { flag: '🇦🇺', short: 'AU' },
  EBAY_DE: { flag: '🇩🇪', short: 'DE' },
  EBAY_CA: { flag: '🇨🇦', short: 'CA' },
  EBAY_FR: { flag: '🇫🇷', short: 'FR' },
  EBAY_IT: { flag: '🇮🇹', short: 'IT' },
  EBAY_ES: { flag: '🇪🇸', short: 'ES' },
}

export async function GET() {
  try {
    const sb = supabase()
    const { data: { user }, error: authErr } = await sb.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // First check dedicated ebay_connections table (multi-account support)
    const { data: connections } = await sb
      .from('ebay_connections')
      .select('id, ebay_username, ebay_user_id, marketplace')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (connections && connections.length > 0) {
      const accounts = connections.map(c => {
        const mkt = c.marketplace ?? 'EBAY_US'
        const meta = MARKETPLACE_LABELS[mkt] ?? { flag: '🌐', short: mkt.replace('EBAY_', '') }
        return {
          id:          c.id,
          username:    c.ebay_username ?? c.ebay_user_id ?? 'eBay Account',
          marketplace: mkt,
          flag:        meta.flag,
          short:       meta.short,
          label:       `${c.ebay_username ?? 'eBay Account'} (${meta.short})`,
        }
      })
      return NextResponse.json({ accounts })
    }

    // Fall back to profiles table (legacy single-account)
    const { data: profile } = await sb
      .from('profiles')
      .select('ebay_username, ebay_user_id, ebay_marketplace, name')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ accounts: [] })

    const mkt  = profile.ebay_marketplace ?? 'EBAY_US'
    const meta = MARKETPLACE_LABELS[mkt] ?? { flag: '🌐', short: mkt.replace('EBAY_', '') }
    const uname = profile.ebay_username ?? profile.name ?? 'eBay Account'

    return NextResponse.json({
      accounts: [{
        id:          'profile',
        username:    uname,
        marketplace: mkt,
        flag:        meta.flag,
        short:       meta.short,
        label:       `${uname} (${meta.short})`,
      }]
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
