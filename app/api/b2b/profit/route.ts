// app/api/b2b/profit/route.ts
import { NextRequest } from 'next/server'
import { validateB2BKey, b2bError, b2bSuccess, handleCors, CORS_HEADERS } from '@/lib/b2b-auth'
import { createClient } from '@supabase/supabase-js'

const EBAY_FEES: Record<string, number> = {
  electronics: 0.0865, clothing: 0.1200, collectibles: 0.1235,
  motors: 0.0275, books: 0.1465, toys: 0.1265,
  home: 0.1165, jewelry: 0.1500, default: 0.1265,
}

const PAYPAL_RATE  = 0.0349
const PAYPAL_FIXED = 0.49

export async function OPTIONS() { return handleCors() }

export async function POST(request: NextRequest) {
  const auth = await validateB2BKey(request)
  if (!auth.success) return b2bError(auth.error!, auth.statusCode!)

  // ── Kill switch check ────────────────────────────────────────
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: killSwitch } = await (adminClient.from('kill_switches') as any)
      .select('is_enabled').eq('title', 'Profit Calculator').single()
    if (killSwitch && !killSwitch.is_enabled) {
      return b2bError('Profit Calculator is temporarily unavailable. Our team is working on restoring this feature.', 503)
    }
  } catch { /* non-critical — allow through if check fails */ }
  // ── End kill switch check ────────────────────────────────────

  let body: {
    sale_price?: number; cost_price?: number; shipping_cost?: number
    category?: string;   currency?: string;   quantity?: number
  }
  try { body = await request.json() }
  catch { return b2bError('Invalid JSON body') }

  const { sale_price, cost_price, shipping_cost = 0, category = 'default', currency = 'USD', quantity = 1 } = body

  if (!sale_price || sale_price <= 0) return b2bError('"sale_price" is required and must be > 0')
  if (!cost_price || cost_price <= 0) return b2bError('"cost_price" is required and must be > 0')
  if (quantity < 1 || quantity > 10000) return b2bError('"quantity" must be between 1 and 10000')

  const ebayFeeRate = EBAY_FEES[category.toLowerCase()] ?? EBAY_FEES.default
  const ebayFee     = parseFloat((sale_price * ebayFeeRate).toFixed(2))
  const paypalFee   = parseFloat((sale_price * PAYPAL_RATE + PAYPAL_FIXED).toFixed(2))
  const totalFees   = parseFloat((ebayFee + paypalFee).toFixed(2))
  const totalCost   = parseFloat((cost_price + shipping_cost + totalFees).toFixed(2))
  const netProfit   = parseFloat((sale_price - totalCost).toFixed(2))
  const roi         = parseFloat(((netProfit / cost_price) * 100).toFixed(1))
  const marginPct   = parseFloat(((netProfit / sale_price) * 100).toFixed(1))
  const breakEven   = netProfit <= 0 ? null : Math.ceil(cost_price / netProfit)

  let rating: string, advice: string
  if (marginPct >= 25)     { rating = 'excellent'; advice = 'Strong margins. Great product to list.' }
  else if (marginPct >= 15){ rating = 'good';      advice = 'Healthy margins. Worth selling.' }
  else if (marginPct >= 8) { rating = 'fair';      advice = 'Thin margins. Consider negotiating lower cost.' }
  else if (marginPct >= 0) { rating = 'poor';      advice = 'Very thin margins. High risk product.' }
  else                     { rating = 'loss';      advice = 'Selling at a loss. Do not list at this price.' }

  return b2bSuccess({
    sale_price, cost_price, shipping_cost, category, currency, quantity,
    fees: { ebay_fee: ebayFee, ebay_rate: `${(ebayFeeRate * 100).toFixed(2)}%`, paypal_fee: paypalFee, total_fees: totalFees },
    total_cost: totalCost, net_profit: netProfit,
    net_profit_total: parseFloat((netProfit * quantity).toFixed(2)),
    roi_percent: roi, margin_percent: marginPct,
    break_even_qty: breakEven,
    rating, advice,
  }, { partner: auth.key?.partner_name })
}

export async function GET() {
  return Response.json({
    endpoint:    'POST /api/b2b/profit',
    description: 'Calculate real eBay net profit including all fees',
    auth:        'Pass your API key in the x-api-key header',
    categories:  Object.keys(EBAY_FEES),
    body: {
      sale_price:    'number  — eBay listing sale price (required)',
      cost_price:    'number  — your sourcing/purchase cost (required)',
      shipping_cost: 'number  — shipping cost (optional, default 0)',
      category:      'string  — eBay category for accurate fees (optional)',
      currency:      'string  — currency code (optional, default "USD")',
      quantity:      'number  — units to calculate for (optional, default 1)',
    },
    example_request: {
      method:  'POST',
      headers: { 'x-api-key': 'sk_live_your_key_here', 'Content-Type': 'application/json' },
      body:    { sale_price: 29.99, cost_price: 12.00, shipping_cost: 4.99, category: 'electronics' },
    },
    example_response: {
      success: true,
      data: {
        sale_price: 29.99, cost_price: 12.00, shipping_cost: 4.99,
        category: 'electronics', currency: 'USD', quantity: 1,
        fees: { ebay_fee: 2.59, ebay_rate: '8.65%', paypal_fee: 1.54, total_fees: 4.13 },
        total_cost: 21.12, net_profit: 8.87, net_profit_total: 8.87,
        roi_percent: 73.9, margin_percent: 29.6, break_even_qty: 2,
        rating: 'excellent', advice: 'Strong margins. Great product to list.',
      },
      meta: { partner: 'Your Company Name', timestamp: '2026-06-06T00:00:00.000Z' },
    },
    ratings: {
      excellent: 'margin >= 25% — strong product',
      good:      'margin >= 15% — worth selling',
      fair:      'margin >= 8%  — thin margins',
      poor:      'margin >= 0%  — very risky',
      loss:      'margin < 0%   — do not list',
    },
  }, { headers: CORS_HEADERS })
}
