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

    // Fetch affiliate settings
    const { data: settings } = await (supabase.from('affiliate_settings') as any)
      .select('*')
      .limit(1)
      .single()

    // Fetch real plan prices from landing_pricing table
    const { data: plans } = await (supabase.from('landing_pricing') as any)
      .select('plan_id, name, price, price_annual')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    // Extract numeric prices for calculator
    const planPrices: Record<string, number> = {}
    if (plans) {
      plans.forEach((p: any) => {
        const numeric = parseFloat(String(p.price).replace(/[^0-9.]/g, ''))
        if (!isNaN(numeric) && numeric > 0) {
          planPrices[p.plan_id] = numeric
        }
      })
    }

    return NextResponse.json({
      settings: settings ?? {
        commission_rate:         0.25,
        commission_months:       12,
        min_payout:              50,
        cookie_days:             30,
        is_program_active:       true,
        default_discount:        50,
        default_discount_months: 1,
      },
      planPrices,
      // Return sorted plan prices array for calculator buttons
      calcPlans: plans
        ? plans
            .filter((p: any) => {
              const n = parseFloat(String(p.price).replace(/[^0-9.]/g, ''))
              return !isNaN(n) && n > 0
            })
            .map((p: any) => ({
              id:    p.plan_id,
              name:  p.name,
              price: parseFloat(String(p.price).replace(/[^0-9.]/g, '')),
            }))
        : [{ id: 'starter', name: 'Starter', price: 49 }, { id: 'growth', name: 'Growth', price: 99 }]
    })
  } catch {
    return NextResponse.json({
      settings: {
        commission_rate:         0.25,
        commission_months:       12,
        min_payout:              50,
        cookie_days:             30,
        is_program_active:       true,
        default_discount:        50,
        default_discount_months: 1,
      },
      planPrices: { starter: 49, growth: 99 },
      calcPlans:  [{ id: 'starter', name: 'Starter', price: 49 }, { id: 'growth', name: 'Growth', price: 99 }]
    })
  }
}