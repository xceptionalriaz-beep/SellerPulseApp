// app/api/ebay/shipping/labels/route.ts
// POST — purchase a shipping label via eBay Logistics API
// Falls back to a realistic mock when no valid token

import { NextRequest, NextResponse } from 'next/server'
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

// Generate a realistic-looking tracking number per carrier
function mockTracking(carrierId: string): string {
  const rand = (n: number) => Math.floor(Math.random() * n)
  const dig  = (len: number) => Array.from({ length: len }, () => rand(10)).join('')
  switch (carrierId) {
    case 'USPS':  return `9400111899${dig(12)}`
    case 'UPS':   return `1Z${dig(3).toUpperCase()}${dig(4)}${dig(2)}${dig(8)}`
    case 'FEDEX': return dig(12)
    default:      return dig(20)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sb = supabase()
    const { data: { user }, error: authErr } = await sb.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()
    const {
      rateId, carrierId, serviceCode,
      toName, toAddr1, toAddr2, toCity, toState, toZip, toCountry = 'US',
      weightLbs = 0, weightOz = 0,
      lengthIn, widthIn, heightIn,
      addInsurance = false, insuranceValue = 0,
      addSignature = false,
    } = body

    if (!rateId) return NextResponse.json({ error: 'rateId is required' }, { status: 400 })

    // Try real eBay Logistics API
    try {
      const { getEbayToken } = await import('@/lib/ebay-auth')
      const token = await getEbayToken(user.id)

      const payload = {
        rateId,
        shippingCarrierCode: carrierId,
        shippingServiceCode: serviceCode,
        shipTo: {
          contactAddress: {
            addressLine1: toAddr1,
            addressLine2: toAddr2 || undefined,
            city: toCity,
            stateOrProvince: toState,
            postalCode: toZip,
            countryCode: toCountry,
          },
          contact: { fullName: toName },
        },
        packageSpecification: {
          dimensions: {
            height: String(heightIn || 4),
            length: String(lengthIn || 8),
            unit:   'INCH',
            width:  String(widthIn  || 6),
          },
          weight: {
            unit:  'OUNCE',
            value: String(Math.round(Number(weightLbs) * 16 + Number(weightOz)) || 8),
          },
        },
        ...(addInsurance && insuranceValue > 0 ? {
          insurance: { insuredValue: { currency: 'USD', value: String(insuranceValue) } }
        } : {}),
        ...(addSignature ? { additionalOptions: [{ optionType: 'ADULT_SIGNATURE_REQUIRED' }] } : {}),
      }

      const ebayRes = await fetch('https://api.ebay.com/sell/logistics/v1/shipment', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })

      if (ebayRes.ok) {
        const data = await ebayRes.json()
        return NextResponse.json({
          shipmentId:       data.shipmentId,
          trackingNumber:   data.trackingNumber,
          labelDownloadUrl: data.labelDownloadInfo?.labelDownloadUrl ?? null,
          source:           'ebay',
        })
      }
    } catch {
      // No token or expired — fall through
    }

    // Mock response
    const trackingNumber = mockTracking(carrierId ?? 'USPS')
    return NextResponse.json({
      shipmentId:       `MOCK-${Date.now()}`,
      trackingNumber,
      labelDownloadUrl: null,   // Page will render a visual mock label
      source:           'mock',
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
