// app/api/webhooks/lemonsqueezy/route.ts
// ══════════════════════════════════════════════════════════════
// LemonSqueezy webhook handler
// Listens for LemonSqueezy events and fires internal webhooks
// Pre-wired and ready — just add LEMONSQUEEZY_WEBHOOK_SECRET
// to your env when you connect LemonSqueezy
// ══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Verify LemonSqueezy signature ──────────────────────────────
function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected,  'hex'),
    )
  } catch { return false }
}

// ── Map LemonSqueezy variant to plan name ──────────────────────
function getPlanName(variantName: string | null, productName: string | null): string {
  const name = (variantName ?? productName ?? '').toLowerCase()
  if (name.includes('growth'))  return 'Growth'
  if (name.includes('starter')) return 'Starter'
  if (name.includes('custom'))  return 'Custom'
  if (name.includes('pro'))     return 'Starter'
  if (name.includes('elite'))   return 'Growth'
  return variantName ?? productName ?? 'Paid Plan'
}

// ── Fire internal webhook to Discord ──────────────────────────
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

// ── Update profile plan in Supabase ───────────────────────────
async function updateUserPlan(email: string, planName: string, lsCustomerId: string) {
  try {
    await (adminClient.from('profiles') as any)
      .update({
        plan_name:              planName,
        lemonsqueezy_customer_id: lsCustomerId,
        updated_at:             new Date().toISOString(),
      })
      .eq('email', email)
  } catch { /* non-critical */ }
}

// ── Main webhook handler ───────────────────────────────────────
export async function POST(req: NextRequest) {
  const payload   = await req.text()
  const signature = req.headers.get('x-signature') ?? ''
  const secret    = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''

  // ── Verify signature if secret configured ─────────────────────
  if (secret) {
    const valid = verifySignature(payload, signature, secret)
    if (!valid) {
      console.error('[lemonsqueezy-webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    console.log('[lemonsqueezy-webhook] LEMONSQUEEZY_WEBHOOK_SECRET not set — skipping verification')
  }

  let event: any
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = event.meta?.event_name ?? ''
  const obj       = event.data?.attributes ?? {}
  const userEmail = obj.user_email ?? obj.customer_email ?? '—'
  const lsCustomerId = String(event.data?.id ?? '')

  console.log(`[lemonsqueezy-webhook] Event: ${eventName}`)

  try {
    switch (eventName) {

      // ── New order (one-time purchase) ─────────────────────────
      case 'order_created': {
        const productName  = obj.first_order_item?.product_name ?? null
        const variantName  = obj.first_order_item?.variant_name ?? null
        const planName     = getPlanName(variantName, productName)
        const total        = obj.total ? `$${(obj.total / 100).toFixed(2)}` : '—'
        const currency     = (obj.currency ?? 'USD').toUpperCase()

        await updateUserPlan(userEmail, planName, lsCustomerId)

        await fireWebhook(req, 'plan.upgraded', {
          email:   userEmail,
          plan:    planName,
          amount:  `${total} ${currency}`,
          status:  'Order completed',
          type:    'One-time purchase',
        })
        break
      }

      // ── Subscription created ───────────────────────────────────
      case 'subscription_created': {
        const productName = obj.product_name ?? null
        const variantName = obj.variant_name ?? null
        const planName    = getPlanName(variantName, productName)
        const interval    = obj.billing_anchor ? 'month' : 'month'
        const amount      = obj.unit_price ? `$${(obj.unit_price / 100).toFixed(2)}` : '—'

        await updateUserPlan(userEmail, planName, lsCustomerId)

        await fireWebhook(req, 'plan.upgraded', {
          email:   userEmail,
          plan:    planName,
          amount:  `${amount}/${interval}`,
          status:  'Subscription started',
          type:    'Subscription',
        })
        break
      }

      // ── Subscription updated/upgraded ──────────────────────────
      case 'subscription_updated': {
        const productName = obj.product_name ?? null
        const variantName = obj.variant_name ?? null
        const planName    = getPlanName(variantName, productName)
        const amount      = obj.unit_price ? `$${(obj.unit_price / 100).toFixed(2)}` : '—'
        const status      = obj.status ?? 'active'

        if (status === 'active') {
          await updateUserPlan(userEmail, planName, lsCustomerId)
          await fireWebhook(req, 'plan.upgraded', {
            email:  userEmail,
            plan:   planName,
            amount: `${amount}/month`,
            status: 'Subscription updated',
          })
        }
        break
      }

      // ── Subscription cancelled ─────────────────────────────────
      case 'subscription_cancelled':
      case 'subscription_expired': {
        const productName = obj.product_name ?? null
        const variantName = obj.variant_name ?? null
        const planName    = getPlanName(variantName, productName)
        const endsAt      = obj.ends_at
          ? new Date(obj.ends_at).toLocaleDateString()
          : '—'

        // Downgrade to Free when expired
        if (eventName === 'subscription_expired') {
          await updateUserPlan(userEmail, 'Free', lsCustomerId)
        }

        await fireWebhook(req, 'plan.cancelled', {
          email:    userEmail,
          plan:     planName,
          ends_at:  endsAt,
          reason:   eventName === 'subscription_expired' ? 'Subscription expired' : 'Cancelled by user',
        })
        break
      }

      // ── Payment failed ─────────────────────────────────────────
      case 'subscription_payment_failed': {
        const productName  = obj.product_name ?? null
        const variantName  = obj.variant_name ?? null
        const planName     = getPlanName(variantName, productName)
        const amount       = obj.billing_price ? `$${(obj.billing_price / 100).toFixed(2)}` : '—'
        const attemptCount = obj.billing_reason ?? 'Retry scheduled'
        const retryAt      = obj.next_billing_date
          ? new Date(obj.next_billing_date).toLocaleDateString()
          : 'No retry scheduled'

        await fireWebhook(req, 'payment.failed', {
          email:        userEmail,
          plan:         planName,
          amount,
          attempt:      attemptCount,
          next_attempt: retryAt,
        })
        break
      }

      // ── Payment succeeded ──────────────────────────────────────
      case 'subscription_payment_success': {
        const amount   = obj.billing_price ? `$${(obj.billing_price / 100).toFixed(2)}` : '—'
        const planName = getPlanName(obj.variant_name ?? null, obj.product_name ?? null)

        await fireWebhook(req, 'payment.recovered', {
          email:  userEmail,
          plan:   planName,
          amount,
          status: 'Payment succeeded',
        })
        break
      }

      // ── Subscription resumed (after pause) ─────────────────────
      case 'subscription_resumed': {
        const planName = getPlanName(obj.variant_name ?? null, obj.product_name ?? null)
        const amount   = obj.unit_price ? `$${(obj.unit_price / 100).toFixed(2)}` : '—'

        await updateUserPlan(userEmail, planName, lsCustomerId)

        await fireWebhook(req, 'plan.upgraded', {
          email:  userEmail,
          plan:   planName,
          amount: `${amount}/month`,
          status: 'Subscription resumed',
        })
        break
      }

      default:
        console.log(`[lemonsqueezy-webhook] Unhandled event: ${eventName}`)
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('[lemonsqueezy-webhook]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}