// app/api/geo/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Silent IP geolocation fallback.
// Called automatically when user logs in or
// when browser geolocation is denied.
// Uses ip-api.com â€” free, no API key needed.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { createClient }  from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // â”€â”€ Verify user is authenticated â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // â”€â”€ Check if location already set from browser GPS â”€â”€â”€â”€â”€â”€
    // Don't overwrite accurate browser data with IP data
    const { data: profile } = await supabase
      .from('profiles')
      .select('location_source, country')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.location_source === 'browser') {
      return NextResponse.json({ skipped: true, reason: 'browser location already set' })
    }

    // â”€â”€ Get real IP from request headers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp    = req.headers.get('x-real-ip')
    const cfIp      = req.headers.get('cf-connecting-ip') // Cloudflare
    const ip        = cfIp ?? (forwarded ? forwarded.split(',')[0].trim() : null) ?? realIp ?? ''

    // Skip localhost / private IPs
    const isPrivate = !ip ||
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.')

    if (isPrivate) {
      return NextResponse.json({ skipped: true, reason: 'private/local IP' })
    }

    // â”€â”€ Call ip-api.com â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Free tier: 1000 requests/day, no API key needed
    const geoRes = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,timezone`,
      { next: { revalidate: 3600 } } // cache for 1hr per IP
    )

    if (!geoRes.ok) {
      return NextResponse.json({ error: 'Geo lookup failed' }, { status: 502 })
    }

    const geo = await geoRes.json()

    if (geo.status !== 'success') {
      return NextResponse.json({ error: 'Geo lookup returned failure' }, { status: 400 })
    }

    // â”€â”€ Save to profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        country:         geo.country      ?? null,
        verified_city:   geo.city         ?? null,
        country_code:    geo.countryCode  ?? null,
        timezone:        geo.timezone     ?? null,
        location_source: 'ip',
      })
      .eq('id', user.id)

    if (updateErr) throw updateErr

    return NextResponse.json({
      success:      true,
      country:      geo.country,
      city:         geo.city,
      country_code: geo.countryCode,
      timezone:     geo.timezone,
      source:       'ip',
    })

  } catch (err) {
    console.error('Geo route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
