// app/api/b2b/vero/route.ts
import { NextRequest } from 'next/server'
import { validateB2BKey, b2bError, b2bSuccess, handleCors, CORS_HEADERS } from '@/lib/b2b-auth'
import { createClient } from '@supabase/supabase-js'

const VERO_BRANDS = [
  { brand: 'Nike',          keywords: ['nike', 'air max', 'air force', 'jordan', 'swoosh'],       risk: 'high'   },
  { brand: 'Adidas',        keywords: ['adidas', 'yeezy', 'ultraboost', 'three stripes'],          risk: 'high'   },
  { brand: 'Apple',         keywords: ['apple', 'iphone', 'macbook', 'airpods', 'ipad'],           risk: 'high'   },
  { brand: 'Louis Vuitton', keywords: ['louis vuitton', 'lv', 'monogram'],                         risk: 'high'   },
  { brand: 'Gucci',         keywords: ['gucci', 'gg supreme'],                                     risk: 'high'   },
  { brand: 'Disney',        keywords: ['disney', 'mickey mouse', 'marvel', 'star wars', 'pixar'],  risk: 'high'   },
  { brand: 'Rolex',         keywords: ['rolex', 'submariner', 'datejust'],                          risk: 'high'   },
  { brand: 'Supreme',       keywords: ['supreme', 'box logo'],                                     risk: 'medium' },
  { brand: 'The North Face',keywords: ['north face', 'tnf'],                                       risk: 'medium' },
  { brand: 'Sony',          keywords: ['sony', 'playstation', 'ps5', 'ps4'],                       risk: 'medium' },
]

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
      .select('is_enabled').eq('title', 'VeRO Brand Scanner').single()
    if (killSwitch && !killSwitch.is_enabled) {
      return b2bError('VeRO Brand Scanner is temporarily unavailable. Our team is working on restoring this feature.', 503)
    }
  } catch { /* non-critical — allow through if check fails */ }
  // ── End kill switch check ────────────────────────────────────

  let body: { keyword?: string; keywords?: string[] }
  try { body = await request.json() }
  catch { return b2bError('Invalid JSON body') }

  const inputs: string[] = body.keywords
    ? body.keywords
    : body.keyword ? [body.keyword] : []

  if (inputs.length === 0) return b2bError('Provide "keyword" or "keywords" in request body')
  if (inputs.length > 20)  return b2bError('Maximum 20 keywords per request')

  // Check Supabase vero_brands table
  let supabaseBrands: string[] = []
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await (supabase as any).from('vero_brands').select('brand_name')
    supabaseBrands = (data ?? []).map((b: any) => b.brand_name?.toLowerCase())
  } catch { /* use hardcoded list */ }

  const results = inputs.map(input => {
    const lc      = input.toLowerCase().trim()
    let isVero    = false
    let brand     = null as string | null
    let riskLevel = 'low'

    for (const entry of VERO_BRANDS) {
      if (entry.keywords.some(k => lc.includes(k))) {
        isVero = true; brand = entry.brand; riskLevel = entry.risk; break
      }
    }
    if (!isVero) {
      for (const b of supabaseBrands) {
        if (lc.includes(b)) { isVero = true; brand = b; riskLevel = 'high'; break }
      }
    }

    return {
      keyword:        input,
      is_vero:        isVero,
      brand,
      risk_level:     riskLevel,
      recommendation: isVero ? (riskLevel === 'high' ? 'avoid' : 'caution') : 'safe',
      message:        isVero
        ? `"${input}" may be associated with ${brand} — a VeRO protected brand.`
        : `"${input}" appears safe to list.`,
    }
  })

  return b2bSuccess(
    inputs.length === 1 ? results[0] : results,
    { partner: auth.key?.partner_name, checked: inputs.length, vero_detected: results.filter(r => r.is_vero).length }
  )
}

export async function GET() {
  return Response.json({
    endpoint:    'POST /api/b2b/vero',
    description: 'Check if a keyword or product is VeRO protected on eBay',
    auth:        'Pass your API key in the x-api-key header',
    body: {
      keyword:  'string  — single keyword to check',
      keywords: 'array   — up to 20 keywords to check at once',
    },
    example_request: {
      method:  'POST',
      headers: { 'x-api-key': 'sk_live_your_key_here', 'Content-Type': 'application/json' },
      body:    { keyword: 'Nike Air Max' },
    },
    example_response: {
      success: true,
      data: {
        keyword:        'Nike Air Max',
        is_vero:        true,
        brand:          'Nike',
        risk_level:     'high',
        recommendation: 'avoid',
        message:        '"Nike Air Max" may be associated with Nike — a VeRO protected brand.',
      },
      meta: {
        partner:       'Your Company Name',
        checked:       1,
        vero_detected: 1,
        timestamp:     '2026-06-06T00:00:00.000Z',
      },
    },
    batch_example: {
      body: { keywords: ['Nike Air Max', 'Cat Brush', 'iPhone Case'] },
      note: 'Up to 20 keywords per request',
    },
    risk_levels: {
      high:   'Strongly associated with VeRO brand — avoid listing',
      medium: 'Possibly associated — proceed with caution',
      low:    'No VeRO association found — safe to list',
    },
    recommendations: {
      avoid:   'Do not list this product — high risk of removal',
      caution: 'Research further before listing',
      safe:    'No VeRO issues detected',
    },
  }, { headers: CORS_HEADERS })
}