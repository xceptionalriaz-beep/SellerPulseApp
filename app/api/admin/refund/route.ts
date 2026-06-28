// app/api/admin/refund/route.ts
// Issues a refund via LemonSqueezy API + sends confirmation email

import { createClient }         from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend }               from 'resend'
import { render }               from '@react-email/render'
import RefundConfirmation       from '@/components/emails/RefundConfirmation'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { transactionId, lsOrderId, userId, amount, refundReason, refundNote, notifyCustomer } = await req.json()

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
    }

    // Get API key from DB
    const { data: lsKey } = await (adminClient.from('api_fleet_config') as any)
      .select('primary_key_1, status')
      .eq('platform_name', 'lemonsqueezy')
      .single()

    if (!lsKey?.primary_key_1 || lsKey.primary_key_1 === 'EMPTY') {
      return NextResponse.json({ error: 'LemonSqueezy not configured' }, { status: 500 })
    }

    if (lsKey.status !== 'connected') {
      return NextResponse.json({ error: 'LemonSqueezy not connected' }, { status: 500 })
    }

    // If no real LS order ID â†’ preview/mock data
    if (!lsOrderId || lsOrderId === 'â€”') {
      return NextResponse.json({ error: 'No LemonSqueezy order ID â€” this is preview data' }, { status: 400 })
    }

    // Call LemonSqueezy refund API
    const lsRes = await fetch(`https://api.lemonsqueezy.com/v1/orders/${lsOrderId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lsKey.primary_key_1}`,
        'Content-Type':  'application/vnd.api+json',
        'Accept':        'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type:       'orders',
          id:         String(lsOrderId),
          attributes: { amount: amount ?? undefined },
        }
      }),
    })

    if (!lsRes.ok) {
      const err = await lsRes.json()
      const msg = err?.errors?.[0]?.detail ?? 'Refund failed'
      console.error('[refund] LS error:', msg)
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    // Update transaction in DB
    await (adminClient.from('transactions') as any)
      .update({
        status:        'refunded',
        ltv:           0,
        refund_reason: refundReason ?? null,
        refund_note:   refundNote   ?? null,
        refund_amount: amount,
        refunded_at:   new Date().toISOString(),
        refunded_by:   'admin',
        updated_at:    new Date().toISOString(),
      })
      .eq('id', transactionId)

    // Downgrade user plan to free
    if (userId) {
      await (adminClient.from('profiles') as any)
        .update({
          plan_name:           'free',
          subscription_status: 'refunded',
          updated_at:          new Date().toISOString(),
        })
        .eq('id', userId)
    }

    // Get user email and name for notification
    let userEmail = ''
    let userName  = 'Valued Customer'
    if (userId) {
      const { data: profile } = await (adminClient.from('profiles') as any)
        .select('email, full_name')
        .eq('id', userId)
        .single()
      userEmail = (profile as any)?.email   ?? ''
      userName  = (profile as any)?.full_name ?? 'Valued Customer'
    }

    // Send refund confirmation email if requested
    if (notifyCustomer && userEmail) {
      try {
        const { data: resendKey } = await (adminClient.from('api_fleet_config') as any)
          .select('primary_key_1')
          .eq('platform_name', 'resend')
          .single()

        if (resendKey?.primary_key_1) {
          const resend = new Resend(resendKey.primary_key_1)

          const reasonMap: Record<string, string> = {
            customer_request:         'Customer request',
            duplicate_charge:         'Duplicate charge',
            product_not_as_described: 'Product not as described',
            fraud:                    'Fraud / Unauthorized',
            technical_issue:          'Technical issue',
            other:                    'Other',
          }

          const { data: txn } = await (adminClient.from('transactions') as any)
            .select('invoice, plan, amount')
            .eq('id', transactionId)
            .single()

          const html = await render(RefundConfirmation({
            customerName:  userName,
            customerEmail: userEmail,
            amount:        `$${amount.toFixed(2)}`,
            plan:          (txn as any)?.plan
                            ? (txn as any).plan.charAt(0).toUpperCase() + (txn as any).plan.slice(1)
                            : 'Starter',
            invoice:       (txn as any)?.invoice ?? 'â€”',
            reason:        reasonMap[refundReason] ?? refundReason,
            refundDate:    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          }))

          await resend.emails.send({
            from:    process.env.RESEND_FROM_EMAIL ?? 'Riazify <notifications@dropnrest.com>',
            to:      userEmail,
            subject: `Your refund of $${amount.toFixed(2)} has been processed â€” Riazify`,
            html,
          })
        }
      } catch (emailErr) {
        console.error('[refund] Email send error:', emailErr)
        // Don't fail the refund if email fails
      }
    }

    // Log to api_usage_logs
    try {
      await (adminClient.from('api_usage_logs') as any).insert({
        platform_name:    'lemonsqueezy',
        tool_name:        'payments',
        call_name:        'Refund',
        endpoint:         `orders/${lsOrderId}/refund`,
        success_count:    1,
        error_count:      0,
        response_time_ms: 0,
        logged_at:        new Date().toISOString(),
      })
    } catch {}

    return NextResponse.json({ success: true, message: 'Refund issued successfully' })

  } catch (err: any) {
    console.error('[refund] Error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}
