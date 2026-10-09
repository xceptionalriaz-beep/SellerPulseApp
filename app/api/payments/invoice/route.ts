// app/api/payments/invoice/route.ts
export const dynamic = 'force-dynamic'
// Proxies LemonSqueezy invoice PDF through your server
// so the browser can download it directly without CORS issues

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get txnId from query params
    const txnId = req.nextUrl.searchParams.get('txnId')
    if (!txnId) return NextResponse.json({ error: 'Missing txnId' }, { status: 400 })

    // Fetch transaction â€” verify it belongs to this user
    const { data: txn } = await (adminClient.from('transactions') as any)
      .select('invoice, plan, created_at, user_id')
      .eq('id', txnId)
      .single()

    if (!txn) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    if (txn.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (!txn.invoice) return NextResponse.json({ error: 'No invoice available' }, { status: 404 })

    // Get LS API key for authenticated requests
    const { data: lsKeyData } = await (adminClient.from('api_fleet_config') as any)
      .select('primary_key_1')
      .eq('platform_name', 'lemonsqueezy')
      .single()
    const lsApiKey = (lsKeyData as any)?.primary_key_1 ?? process.env.LEMONSQUEEZY_API_KEY

    // Fetch the PDF from the invoice URL
    const headers: Record<string, string> = {
      'Accept': 'application/pdf, */*',
    }
    if (lsApiKey && txn.invoice.includes('lemonsqueezy.com')) {
      headers['Authorization'] = `Bearer ${lsApiKey}`
    }

    const pdfRes = await fetch(txn.invoice, { headers })

    if (!pdfRes.ok) {
      return NextResponse.json({ error: 'Could not fetch invoice' }, { status: 502 })
    }

    // Build filename
    const date     = new Date(txn.created_at)
    const month    = date.toLocaleDateString('en-US', { month: 'short' })
    const year     = date.getFullYear()
    const planName = (txn.plan ?? 'invoice').toLowerCase().replace(/\s+/g, '-')
    const filename = `riazify-${planName}-${month}-${year}.pdf`

    // Stream PDF back to browser with download headers
    const pdfBuffer = await pdfRes.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      pdfBuffer.byteLength.toString(),
        'Cache-Control':       'no-store',
      },
    })

  } catch (err: any) {
    console.error('[invoice] Error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}
