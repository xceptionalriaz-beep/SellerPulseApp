// app/api/ebay/shipping/quote/route.ts
// POST — fetch shipping rates from eBay Logistics API
// Falls back to realistic mock rates when no valid token

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

export interface ShipRate {
  rateId:        string
  carrierId:     string
  carrierName:   string
  serviceCode:   string
  serviceName:   string
  totalPrice:    number
  currency:      string
  deliveryDays:  number | null
  deliveryLabel: string
  tags:          Array<'cheapest' | 'fastest' | 'suggested'>
  includedInsurance: number
}

// Realistic mock rates keyed by package weight range
function mockRates(weightOz: number): ShipRate[] {
  const isLight  = weightOz <= 13
  const isMedium = weightOz > 13 && weightOz <= 70

  const rates: ShipRate[] = []

  // USPS First Class (≤13oz only)
  if (isLight) {
    rates.push({
      rateId: 'mock-usps-first',
      carrierId: 'USPS',
      carrierName: 'USPS',
      serviceCode: 'FIRST_CLASS_PKG',
      serviceName: 'First Class Package',
      totalPrice: parseFloat((3.49 + weightOz * 0.03).toFixed(2)),
      currency: 'USD',
      deliveryDays: 5,
      deliveryLabel: '3–5 Business Days',
      tags: ['cheapest'],
      includedInsurance: 0,
    })
  }

  // USPS Priority Mail
  rates.push({
    rateId: 'mock-usps-priority',
    carrierId: 'USPS',
    carrierName: 'USPS',
    serviceCode: 'PRIORITY_MAIL',
    serviceName: 'Priority Mail',
    totalPrice: isLight ? 8.45 : isMedium ? 12.80 : 18.20,
    currency: 'USD',
    deliveryDays: 2,
    deliveryLabel: '1–3 Business Days',
    tags: isLight ? ['suggested'] : ['suggested', 'cheapest'],
    includedInsurance: 100,
  })

  // USPS Priority Mail Express
  rates.push({
    rateId: 'mock-usps-express',
    carrierId: 'USPS',
    carrierName: 'USPS',
    serviceCode: 'PRIORITY_MAIL_EXPRESS',
    serviceName: 'Priority Mail Express',
    totalPrice: isLight ? 26.35 : isMedium ? 34.50 : 52.00,
    currency: 'USD',
    deliveryDays: 1,
    deliveryLabel: '1 Business Day',
    tags: ['fastest'],
    includedInsurance: 100,
  })

  // UPS Ground
  rates.push({
    rateId: 'mock-ups-ground',
    carrierId: 'UPS',
    carrierName: 'UPS',
    serviceCode: 'UPS_GROUND',
    serviceName: 'UPS Ground',
    totalPrice: isLight ? 9.80 : isMedium ? 13.40 : 19.60,
    currency: 'USD',
    deliveryDays: null,
    deliveryLabel: '3–7 Business Days',
    tags: [],
    includedInsurance: 0,
  })

  // FedEx Ground
  rates.push({
    rateId: 'mock-fedex-ground',
    carrierId: 'FEDEX',
    carrierName: 'FedEx',
    serviceCode: 'FEDEX_GROUND',
    serviceName: 'FedEx Ground',
    totalPrice: isLight ? 10.25 : isMedium ? 14.10 : 20.80,
    currency: 'USD',
    deliveryDays: null,
    deliveryLabel: '3–7 Business Days',
    tags: [],
    includedInsurance: 0,
  })

  // FedEx 2Day
  rates.push({
    rateId: 'mock-fedex-2day',
    carrierId: 'FEDEX',
    carrierName: 'FedEx',
    serviceCode: 'FEDEX_2_DAY',
    serviceName: 'FedEx 2Day',
    totalPrice: isLight ? 18.90 : isMedium ? 25.60 : 38.40,
    currency: 'USD',
    deliveryDays: 2,
    deliveryLabel: '2 Business Days',
    tags: [],
    includedInsurance: 0,
  })

  return rates.sort((a, b) => a.totalPrice - b.totalPrice)
}

export async function POST(req: NextRequest) {
  try {
    const sb = supabase()
    const { data: { user }, error: authErr } = await sb.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()
    const {
      toPostalCode, toCountryCode = 'US',
      weightLbs = 0, weightOz = 0,
      lengthIn, widthIn, heightIn,
    } = body

    if (!toPostalCode) return NextResponse.json({ error: 'toPostalCode is required' }, { status: 400 })

    const totalOz = Math.round((Number(weightLbs) * 16) + Number(weightOz))

    // Try real eBay Logistics API first
    try {
      const { getEbayToken } = await import('@/lib/ebay-auth')
      const token = await getEbayToken(user.id)

      const quotePayload = {
        packageSpecification: {
          dimensions: {
            height: String(heightIn || 4),
            length: String(lengthIn || 8),
            unit:   'INCH',
            width:  String(widthIn  || 6),
          },
          weight: {
            unit:  'OUNCE',
            value: String(totalOz || 8),
          },
        },
        shippingOptions: [{
          optionType: 'DOMESTIC',
          packageType: 'MAILING_BOX',
          shippingServices: ['USPS', 'UPS', 'FEDEX'],
        }],
        shipTo: {
          postalCode:  toPostalCode,
          countryCode: toCountryCode,
        },
      }

      const ebayRes = await fetch(
        'https://api.ebay.com/sell/logistics/v1/shipment_quote',
        {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify(quotePayload),
        }
      )

      if (ebayRes.ok) {
        const data = await ebayRes.json()
        // Transform eBay response to our ShipRate shape
        const rates: ShipRate[] = (data.rates ?? []).map((r: any, i: number) => ({
          rateId:        r.rateId,
          carrierId:     r.shippingCarrierCode,
          carrierName:   r.shippingCarrierCode,
          serviceCode:   r.shippingServiceCode,
          serviceName:   r.shippingServiceName ?? r.shippingServiceCode,
          totalPrice:    parseFloat(r.totalShippingCost?.value ?? '0'),
          currency:      r.totalShippingCost?.currency ?? 'USD',
          deliveryDays:  r.maxEstimatedDeliveryDate ? null : null,
          deliveryLabel: r.shippingTimeMin && r.shippingTimeMax
            ? `${r.shippingTimeMin}–${r.shippingTimeMax} Business Days`
            : 'Estimated delivery varies',
          tags:           i === 0 ? ['cheapest'] : [],
          includedInsurance: 0,
        }))

        return NextResponse.json({ rates, source: 'ebay' })
      }
    } catch {
      // Token missing / expired — fall through to mocks
    }

    // Return mock rates
    const rates = mockRates(totalOz || 8)
    return NextResponse.json({ rates, source: 'mock' })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
