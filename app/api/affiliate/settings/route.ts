// app/api/affiliate/settings/route.ts
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
    const { data, error } = await (supabase.from('affiliate_settings') as any)
      .select('*')
      .limit(1)
      .single()
    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch {
    // Return defaults if no settings exist yet
    return NextResponse.json({
      settings: {
        commission_rate:         0.25,
        commission_months:       12,
        min_payout:              50,
        cookie_days:             30,
        is_program_active:       true,
        default_discount:        50,
        default_discount_months: 1,
      }
    })
  }
}