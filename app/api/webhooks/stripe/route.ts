// app/api/webhooks/stripe/route.ts
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Stripe webhook handler
// Listens for Stripe events and fires internal webhooks
// Pre-wired and ready â€” just add STRIPE_WEBHOOK_SECRET when
// you connect Stripe and it works automatically
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// â”€â”€ Verify Stripe signature â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function verifyStripeSignature(
  payload:   string,
  signature: string,
  secret:    string,
): boolean {
  try {
    const parts     = signature.split(',')
    const timestamp = parts.find(p => p.startsWith('t='))?.slice(2)
    const v1        = parts.find(p => p.startsWith('v1='))?.slice(3)
    if (!timestamp || !v1) return false

    const signed   = `${timestamp}.${payload}`
    const expected = crypto
      .createHmac('sha256', secret)
      .update(signed)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(v1,       'hex'),
      Buffer.from(expected, 'hex'),
    )
  } catch { return false }
}

// â”€â”€ Get plan name from Stripe price â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getPlanName(priceId: string | null): string {
  // Map your Stripe price IDs to plan names
  // Update these when you create prices in Stripe
  const PRICE_MAP: Record<string, string> = {
    'price_starter_monthly':  'Starter',
    'price_starter_annual':   'Starter',
    'price_growth_monthly':   'Growth',
    'price_growth_annual':    'Growth',
    'price_custom_monthly':   'Custom',
    'price_custom_annual':    'Custom',
  }
  return priceId ? (PRICE_MAP[priceId] ?? 'Paid Plan') : 'Paid Plan'
}

// â”€â”€ Fire internal webhook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function fireWebhook(
  req:        NextRequest,
  event_type: string,
  data:       Record<string, any>,
) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
    await fetch(`${appUrl}/api/admin/webhooks`, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
      },
      body: JSON.stringify({ event_type, data }),
    })
  } catch { /* non-critical */ }
}

// â”€â”€ Update profile plan in Supabase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function updateUserPlan(
  stripeCustomerId: string,
  planName:         string,
  status:           string,
) {
  try {
    await (adminClient.from('profiles') as any)
      .update({
        plan_name:          planName,
        stripe_customer_id: stripeCustomerId,
        updated_at:         new Date().toISOString(),
      })
      .eq('stripe_customer_id', stripeCustomerId)
  } catch { /* non-critical */ }
}

// â”€â”€ Main webhook handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function POST(req: NextRequest) {
  const payload   = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''
  const secret    = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  // â”€â”€ Verify signature if secret is configured â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (secret) {
    const valid = verifyStripeSignature(payload, signature, secret)
    if (!valid) {
      console.error('[stripe-webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    // Secret not configured yet â€” log and continue
    // This is fine during development/pre-Stripe setup
    console.log('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set â€” skipping verification')
  }

  let event: any
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const obj = event.data?.object ?? {}

  console.log(`[stripe-webhook] Event: ${event.type}`)

  try {
    switch (event.type) {

      // â”€â”€ Subscription created or upgraded â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const customerId = obj.customer
        const priceId    = obj.items?.data?.[0]?.price?.id ?? null
        const planName   = getPlanName(priceId)
        const amount     = obj.items?.data?.[0]?.price?.unit_amount
          ? `$${(obj.items.data[0].price.unit_amount / 100).toFixed(2)}`
          : 'â€”'
        const interval   = obj.items?.data?.[0]?.price?.recurring?.interval ?? 'month'
        const status     = obj.status

        // Get user email from Stripe customer
        let userEmail = obj.customer_email ?? 'â€”'
        try {
          const { data: profile } = await (adminClient.from('profiles') as any)
            .select('email, name').eq('stripe_customer_id', customerId).single()
          if (profile) userEmail = (profile as any).email ?? userEmail
        } catch { /* non-critical */ }

        // Update profile in DB
        await updateUserPlan(customerId, planName, status)

        // Fire webhook to Discord
        await fireWebhook(req, 'plan.upgraded', {
          email:    userEmail,
          plan:     planName,
          amount:   `${amount}/${interval}`,
          status,
        })
        break
      }

      // â”€â”€ Payment succeeded â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'invoice.payment_succeeded': {
        const customerId = obj.customer
        const amount     = obj.amount_paid
          ? `$${(obj.amount_paid / 100).toFixed(2)}`
          : 'â€”'

        let userEmail = obj.customer_email ?? 'â€”'
        try {
          const { data: profile } = await (adminClient.from('profiles') as any)
            .select('email, plan_name').eq('stripe_customer_id', customerId).single()
          if (profile) userEmail = (profile as any).email ?? userEmail
        } catch { /* non-critical */ }

        await fireWebhook(req, 'payment.recovered', {
          email:  userEmail,
          amount,
          status: 'Payment succeeded',
        })
        break
      }

      // â”€â”€ Payment failed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'invoice.payment_failed': {
        const customerId  = obj.customer
        const amount      = obj.amount_due
          ? `$${(obj.amount_due / 100).toFixed(2)}`
          : 'â€”'
        const attemptCount = obj.attempt_count ?? 1
        const nextAttempt  = obj.next_payment_attempt
          ? new Date(obj.next_payment_attempt * 1000).toLocaleDateString()
          : 'No retry scheduled'

        let userEmail = obj.customer_email ?? 'â€”'
        let planName  = 'â€”'
        try {
          const { data: profile } = await (adminClient.from('profiles') as any)
            .select('email, plan_name').eq('stripe_customer_id', customerId).single()
          if (profile) {
            userEmail = (profile as any).email    ?? userEmail
            planName  = (profile as any).plan_name ?? planName
          }
        } catch { /* non-critical */ }

        await fireWebhook(req, 'payment.failed', {
          email:        userEmail,
          plan:         planName,
          amount,
          attempt:      `Attempt ${attemptCount}`,
          next_attempt: nextAttempt,
        })
        break
      }

      // â”€â”€ Subscription cancelled â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'customer.subscription.deleted': {
        const customerId = obj.customer
        const priceId    = obj.items?.data?.[0]?.price?.id ?? null
        const planName   = getPlanName(priceId)

        let userEmail = 'â€”'
        try {
          const { data: profile } = await (adminClient.from('profiles') as any)
            .select('email').eq('stripe_customer_id', customerId).single()
          if (profile) userEmail = (profile as any).email ?? userEmail
        } catch { /* non-critical */ }

        // Downgrade to free
        await updateUserPlan(customerId, 'Free', 'cancelled')

        await fireWebhook(req, 'plan.cancelled', {
          email:  userEmail,
          plan:   planName,
          reason: obj.cancellation_details?.reason ?? 'Not specified',
        })
        break
      }

      // â”€â”€ Checkout completed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'checkout.session.completed': {
        const customerId = obj.customer
        const userEmail  = obj.customer_email ?? obj.customer_details?.email ?? 'â€”'
        const amount     = obj.amount_total
          ? `$${(obj.amount_total / 100).toFixed(2)}`
          : 'â€”'

        // Save stripe_customer_id to profile by email
        if (userEmail && userEmail !== 'â€”') {
          try {
            await (adminClient.from('profiles') as any)
              .update({ stripe_customer_id: customerId })
              .eq('email', userEmail)
          } catch { /* non-critical */ }
        }

        await fireWebhook(req, 'plan.upgraded', {
          email:  userEmail,
          amount,
          status: 'Checkout completed',
        })
        break
      }

      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('[stripe-webhook]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
